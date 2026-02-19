import type { AppUser, CreateAppUser, ResetAppUserPassword, UpdateAppUser, UpdateAppUserStatus } from "@goi/contracts"
import { normalizePage, toIsoString, toPageResult } from "@goi/utils"
import { Injectable, NotFoundException } from "@nestjs/common"
import { and, desc, eq, like, sql } from "drizzle-orm"
import { PgService, pgSchema } from "@/database/postgresql"
import type { PageResult } from "@/types/response"

const { authUser: userSchema } = pgSchema

@Injectable()
export class UserService {
  constructor(private readonly pg: PgService) {}

  async find(userId: string): Promise<AppUser> {
    const rows = await this.pg.pdb
      .select({
        userId: userSchema.userId,
        username: userSchema.username,
        nickname: userSchema.nickname,
        email: userSchema.email,
        phone: userSchema.phone,
        isVirtual: userSchema.isVirtual,
        isDisabled: userSchema.isDisabled,
        isDeleted: userSchema.isDeleted,
        createdAt: userSchema.createdAt,
        updatedAt: userSchema.updatedAt,
      })
      .from(userSchema)
      .where(eq(userSchema.userId, userId))
      .limit(1)
    const row = rows[0]
    if (!row) throw new NotFoundException("用户不存在")

    return {
      ...row,
      createdAt: toIsoString(row.createdAt),
      updatedAt: toIsoString(row.updatedAt),
    }
  }

  async findAuthUserByUsername(username: string): Promise<
    | {
        userId: string
        username: string
        nickname: string
        password: string
        salt: string
        isVirtual: boolean
        isDisabled: boolean
        isDeleted: boolean
      }
    | undefined
  > {
    const rows = await this.pg.pdb
      .select({
        userId: userSchema.userId,
        username: userSchema.username,
        nickname: userSchema.nickname,
        password: userSchema.password,
        salt: userSchema.salt,
        isVirtual: userSchema.isVirtual,
        isDisabled: userSchema.isDisabled,
        isDeleted: userSchema.isDeleted,
      })
      .from(userSchema)
      .where(and(eq(userSchema.username, username), eq(userSchema.isDeleted, false)))
      .limit(1)
    return rows[0]
  }

  async create(values: CreateAppUser & { userId: string; salt: string; password: string }): Promise<AppUser> {
    await this.pg.pdb.insert(userSchema).values({
      userId: values.userId,
      username: values.username,
      nickname: values.nickname ?? values.username,
      password: values.password,
      salt: values.salt,
      email: values.email ?? "",
      phone: values.phone ?? "",
      isVirtual: values.isVirtual ?? false,
      isDisabled: false,
      isDeleted: false,
    })
    return this.find(values.userId)
  }

  async update(values: UpdateAppUser): Promise<AppUser> {
    await this.pg.pdb
      .update(userSchema)
      .set({
        ...(values.username !== undefined ? { username: values.username } : {}),
        ...(values.nickname !== undefined ? { nickname: values.nickname } : {}),
        ...(values.email !== undefined ? { email: values.email } : {}),
        ...(values.phone !== undefined ? { phone: values.phone } : {}),
        ...(values.isVirtual !== undefined ? { isVirtual: values.isVirtual } : {}),
      })
      .where(eq(userSchema.userId, values.userId))
    return this.find(values.userId)
  }

  async resetPassword(values: ResetAppUserPassword): Promise<AppUser> {
    await this.pg.pdb
      .update(userSchema)
      .set({
        isVirtual: false,
        password: values.password,
        ...(values.salt !== undefined ? { salt: values.salt } : {}),
      })
      .where(eq(userSchema.userId, values.userId))
    return this.find(values.userId)
  }

  async updateStatus(values: UpdateAppUserStatus): Promise<AppUser> {
    await this.pg.pdb
      .update(userSchema)
      .set({
        isDisabled: values.isDisabled,
      })
      .where(eq(userSchema.userId, values.userId))
    return this.find(values.userId)
  }

  async delete(userId: string): Promise<boolean> {
    await this.pg.pdb.update(userSchema).set({ isDeleted: true }).where(eq(userSchema.userId, userId))
    return true
  }

  async list(query: {
    userId?: string
    username?: string
    isDisabled?: boolean
    isDeleted?: boolean
    page?: number | string
    pageSize?: number | string
  }): Promise<PageResult<AppUser>> {
    const where: Parameters<typeof and> = []
    if (query.userId) where.push(eq(userSchema.userId, query.userId))
    if (query.username) where.push(like(userSchema.username, `%${query.username}%`))
    if (query.isDisabled !== undefined) where.push(eq(userSchema.isDisabled, query.isDisabled))
    if (query.isDeleted !== undefined) {
      where.push(eq(userSchema.isDeleted, query.isDeleted))
    }

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
        nickname: userSchema.nickname,
        email: userSchema.email,
        phone: userSchema.phone,
        isVirtual: userSchema.isVirtual,
        isDisabled: userSchema.isDisabled,
        isDeleted: userSchema.isDeleted,
        createdAt: userSchema.createdAt,
        updatedAt: userSchema.updatedAt,
      })
      .from(userSchema)
      .where(and(...where))
      .orderBy(desc(userSchema.createdAt))
      .limit(pageParams.limit)
      .offset(pageParams.offset)

    const list = rows.map((row) => ({
      ...row,
      createdAt: toIsoString(row.createdAt),
      updatedAt: toIsoString(row.updatedAt),
    }))

    return toPageResult(pageParams, total, list)
  }
}
