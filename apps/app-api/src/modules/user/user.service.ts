import type { AppUser, CreateAppUser, UpdateAppUser } from "@goi/contracts"
import { normalizePage, toIsoString, toPageResult } from "@goi/utils"
import { Injectable, NotFoundException } from "@nestjs/common"
import { and, desc, eq, exists, like, sql } from "drizzle-orm"
import { PgService, pgSchema } from "@/database/postgresql"
import type { PageResult } from "@/types/response"

const { authUser: userSchema, financeFamilyMember: familyMemberSchema, authRole: roleSchema } = pgSchema

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
      .where(and(eq(userSchema.userId, userId), eq(userSchema.isDeleted, false)))
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

  async create(
    values: CreateAppUser & { salt: string; password: string; userId: string; familyId?: string },
  ): Promise<AppUser> {
    const inserted = await this.pg.pdb.transaction(async (tx) => {
      const [user] = await tx
        .insert(userSchema)
        .values({
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
        .returning({ userId: userSchema.userId })

      if (values.familyId) {
        // Find 'member' role in the family, or fallback to 'owner' if not found?
        // Actually, for virtual users, we should probably assign a minimal role.
        // Let's try to find a role with code 'member'.
        const [role] = await tx
          .select({ roleId: roleSchema.roleId })
          .from(roleSchema)
          .where(and(eq(roleSchema.familyId, values.familyId), eq(roleSchema.roleCode, "member")))
          .limit(1)

        // If no 'member' role, maybe 'owner'? Or just pick any?
        // Let's assume 'member' exists or use the first role found.
        let roleId = role?.roleId

        if (!roleId) {
          const [anyRole] = await tx
            .select({ roleId: roleSchema.roleId })
            .from(roleSchema)
            .where(eq(roleSchema.familyId, values.familyId))
            .limit(1)
          roleId = anyRole?.roleId
        }

        if (roleId) {
          await tx.insert(familyMemberSchema).values({
            id: sql`gen_random_uuid()`,
            userId: values.userId,
            familyId: values.familyId,
            roleId: roleId,
            status: "active",
          })
        }
      }
      return user
    })

    return this.find(inserted.userId)
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

  async resetPassword(userId: string, password: string, salt: string): Promise<boolean> {
    await this.pg.pdb.update(userSchema).set({ password, salt }).where(eq(userSchema.userId, userId))
    return true
  }

  async delete(userId: string): Promise<boolean> {
    await this.pg.pdb.update(userSchema).set({ isDeleted: true }).where(eq(userSchema.userId, userId))
    return true
  }

  async list(query: {
    userId?: string
    username?: string
    familyId?: string
    page?: number | string
    pageSize?: number | string
  }): Promise<PageResult<AppUser>> {
    const where: Parameters<typeof and> = [eq(userSchema.isDeleted, false)]
    if (query.userId) where.push(eq(userSchema.userId, query.userId))
    if (query.username) where.push(like(userSchema.username, `%${query.username}%`))
    if (query.familyId) {
      where.push(
        exists(
          this.pg.pdb
            .select({ id: familyMemberSchema.id })
            .from(familyMemberSchema)
            .where(
              and(
                eq(familyMemberSchema.userId, userSchema.userId),
                eq(familyMemberSchema.familyId, query.familyId),
                eq(familyMemberSchema.isDeleted, false),
              ),
            ),
        ),
      )
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
