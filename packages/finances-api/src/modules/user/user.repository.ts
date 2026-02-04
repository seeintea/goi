import type {
  CreateUserValues,
  PageResult,
  UpdateUserValues,
  User,
  UserListQuery,
  UserRepository,
} from "@goi/finances-shared/user"
import { Injectable } from "@nestjs/common"
import { and, desc, eq, like, sql } from "drizzle-orm"
import { toIsoString } from "@/common/utils/date"
import { normalizePage, toPageResult } from "@/common/utils/pagination"
import { PgService, pgSchema } from "@/database/postgresql"

const { user: userSchema } = pgSchema

@Injectable()
export class DrizzleUserRepository implements UserRepository {
  constructor(private readonly pg: PgService) {}

  async find(userId: string): Promise<User | undefined> {
    const rows = await this.pg.pdb
      .select({
        userId: userSchema.userId,
        username: userSchema.username,
        email: userSchema.email,
        phone: userSchema.phone,
        isDisabled: userSchema.isDisabled,
        isDeleted: userSchema.isDeleted,
        createTime: userSchema.createTime,
        updateTime: userSchema.updateTime,
      })
      .from(userSchema)
      .where(and(eq(userSchema.userId, userId), eq(userSchema.isDeleted, false)))
      .limit(1)

    const row = rows[0]
    if (!row) return undefined

    return {
      ...row,
      createTime: toIsoString(row.createTime),
      updateTime: toIsoString(row.updateTime),
    }
  }

  async findAuthUserByUsername(username: string) {
    const rows = await this.pg.pdb
      .select({
        userId: userSchema.userId,
        username: userSchema.username,
        password: userSchema.password,
        salt: userSchema.salt,
        isDisabled: userSchema.isDisabled,
        isDeleted: userSchema.isDeleted,
      })
      .from(userSchema)
      .where(and(eq(userSchema.username, username), eq(userSchema.isDeleted, false)))
      .limit(1)
    return rows[0]
  }

  async create(values: CreateUserValues): Promise<User> {
    await this.pg.pdb.insert(userSchema).values({
      userId: values.userId,
      username: values.username,
      password: values.password,
      salt: values.salt,
      email: values.email ?? "",
      phone: values.phone ?? "",
      isDisabled: values.isDisabled ?? false,
      isDeleted: false,
    })
    const user = await this.find(values.userId)
    if (!user) throw new Error("用户创建失败")
    return user
  }

  async update(values: UpdateUserValues): Promise<User> {
    await this.pg.pdb
      .update(userSchema)
      .set({
        ...(values.username !== undefined ? { username: values.username } : {}),
        ...(values.password !== undefined ? { password: values.password } : {}),
        ...(values.salt !== undefined ? { salt: values.salt } : {}),
        ...(values.email !== undefined ? { email: values.email } : {}),
        ...(values.phone !== undefined ? { phone: values.phone } : {}),
        ...(values.isDisabled !== undefined ? { isDisabled: values.isDisabled } : {}),
        ...(values.isDeleted !== undefined ? { isDeleted: values.isDeleted } : {}),
      })
      .where(eq(userSchema.userId, values.userId))

    const user = await this.find(values.userId)
    if (!user) throw new Error("用户更新失败")
    return user
  }

  async delete(userId: string): Promise<boolean> {
    await this.pg.pdb.update(userSchema).set({ isDeleted: true }).where(eq(userSchema.userId, userId))
    return true
  }

  async list(query: UserListQuery): Promise<PageResult<User>> {
    const where: Parameters<typeof and> = [eq(userSchema.isDeleted, false)]
    if (query.userId) where.push(eq(userSchema.userId, query.userId))
    if (query.username) where.push(like(userSchema.username, `%${query.username}%`))

    const pageParams = normalizePage(query)

    const totalRows = await this.pg.pdb
      .select({ count: sql<number>`count(*)` })
      .from(userSchema)
      .where(and(...where))
    const total = Number(totalRows[0]?.count ?? 0)

    const rows = await this.pg.pdb
      .select({
        userId: userSchema.userId,
        username: userSchema.username,
        email: userSchema.email,
        phone: userSchema.phone,
        isDisabled: userSchema.isDisabled,
        isDeleted: userSchema.isDeleted,
        createTime: userSchema.createTime,
        updateTime: userSchema.updateTime,
      })
      .from(userSchema)
      .where(and(...where))
      .orderBy(desc(userSchema.createTime))
      .limit(pageParams.limit)
      .offset(pageParams.offset)

    const list = rows.map((row) => ({
      ...row,
      createTime: toIsoString(row.createTime),
      updateTime: toIsoString(row.updateTime),
    }))

    return toPageResult(pageParams, total, list)
  }
}
