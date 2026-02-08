import { AdminUser, CreateAdminUser, UpdateAdminUser } from "@goi/contracts";
import { Injectable, NotFoundException } from "@nestjs/common"
import { and, desc, eq, like, sql } from "drizzle-orm"
import { toIsoString } from "@/common/utils/date"
import { normalizePage, toPageResult } from "@/common/utils/pagination"
import { verifyPassword } from "@/common/utils/password"
import { PgService, pgSchema } from "@/database/postgresql"
import type { PageResult } from "@/types/response"

const { adminUser: adminUserSchema } = pgSchema

@Injectable()
export class UserService {
  constructor(private readonly pg: PgService) {}

  verifyPassword(inputPassword: string, storedPassword: string, salt: string): boolean {
    return verifyPassword(inputPassword, storedPassword, salt)
  }

  async findAuthUserByUsername(username: string): Promise<
    | {
        userId: string
        username: string
        password: string
        salt: string
        isDisabled: boolean
        isDeleted: boolean
      }
    | undefined
  > {
    const rows = await this.pg.pdb
      .select({
        userId: adminUserSchema.userId,
        username: adminUserSchema.username,
        password: adminUserSchema.password,
        salt: adminUserSchema.salt,
        isDisabled: adminUserSchema.isDisabled,
        isDeleted: adminUserSchema.isDeleted,
      })
      .from(adminUserSchema)
      .where(and(eq(adminUserSchema.username, username), eq(adminUserSchema.isDeleted, false)))
      .limit(1)
    return rows[0]
  }

  async find(userId: string): Promise<AdminUser> {
    const rows = await this.pg.pdb
      .select({
        userId: adminUserSchema.userId,
        username: adminUserSchema.username,
        email: adminUserSchema.email,
        phone: adminUserSchema.phone,
        isDisabled: adminUserSchema.isDisabled,
        isDeleted: adminUserSchema.isDeleted,
        createTime: adminUserSchema.createTime,
        updateTime: adminUserSchema.updateTime,
      })
      .from(adminUserSchema)
      .where(and(eq(adminUserSchema.userId, userId), eq(adminUserSchema.isDeleted, false)))
      .limit(1)

    const user = rows[0]
    if (!user) throw new NotFoundException("管理员用户不存在")

    return {
      ...user,
      createTime: toIsoString(user.createTime),
      updateTime: toIsoString(user.updateTime),
    }
  }

  async create(values: CreateAdminUser & { userId: string; salt: string; password: string }): Promise<AdminUser> {
    await this.pg.pdb.insert(adminUserSchema).values({
      userId: values.userId,
      username: values.username,
      password: values.password,
      salt: values.salt,
      email: values.email ?? "",
      phone: values.phone ?? "",
      isDisabled: values.isDisabled ?? false,
      isDeleted: false,
    })
    return this.find(values.userId)
  }

  async update(values: UpdateAdminUser): Promise<AdminUser> {
    await this.pg.pdb
      .update(adminUserSchema)
      .set({
        ...(values.username !== undefined ? { username: values.username } : {}),
        ...(values.password !== undefined ? { password: values.password } : {}),
        ...(values.salt !== undefined ? { salt: values.salt } : {}),
        ...(values.email !== undefined ? { email: values.email } : {}),
        ...(values.phone !== undefined ? { phone: values.phone } : {}),
        ...(values.isDisabled !== undefined ? { isDisabled: values.isDisabled } : {}),
        ...(values.isDeleted !== undefined ? { isDeleted: values.isDeleted } : {}),
      })
      .where(eq(adminUserSchema.userId, values.userId))
    return this.find(values.userId)
  }

  async delete(userId: string): Promise<boolean> {
    await this.pg.pdb.update(adminUserSchema).set({ isDeleted: true }).where(eq(adminUserSchema.userId, userId))
    return true
  }

  async list(query: {
    userId?: string
    username?: string
    page?: number | string
    pageSize?: number | string
  }): Promise<PageResult<AdminUser>> {
    const where: Parameters<typeof and> = [eq(adminUserSchema.isDeleted, false)]
    if (query.userId) where.push(eq(adminUserSchema.userId, query.userId))
    if (query.username) where.push(like(adminUserSchema.username, `%${query.username}%`))

    const pageParams = normalizePage(query)

    const totalRows = await this.pg.pdb
      .select({ count: sql<number>`count(*)` })
      .from(adminUserSchema)
      .where(and(...where))
    const total = Number(totalRows[0]?.count ?? 0)

    const rows = await this.pg.pdb
      .select({
        userId: adminUserSchema.userId,
        username: adminUserSchema.username,
        email: adminUserSchema.email,
        phone: adminUserSchema.phone,
        isDisabled: adminUserSchema.isDisabled,
        isDeleted: adminUserSchema.isDeleted,
        createTime: adminUserSchema.createTime,
        updateTime: adminUserSchema.updateTime,
      })
      .from(adminUserSchema)
      .where(and(...where))
      .orderBy(desc(adminUserSchema.createTime))
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
