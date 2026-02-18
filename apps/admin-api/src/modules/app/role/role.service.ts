import { SystemProtectionService } from "@goi/nest-kit"
import { normalizePage, toIsoString, toPageResult } from "@goi/utils"
import { Injectable, NotFoundException } from "@nestjs/common"
import { and, desc, eq, inArray, like, sql } from "drizzle-orm"
import { z } from "zod"
import { PgService, pgSchema } from "@/database/postgresql"
import type { PageResult } from "@/types/response"
import type { CreateRole, Role, UpdateRole } from "./role.dto"

const { authRole: roleSchema, authUser: userSchema, financeFamilyMember: familyMemberSchema } = pgSchema

@Injectable()
export class RoleService {
  constructor(
    private readonly pg: PgService,
    private readonly systemProtection: SystemProtectionService,
  ) {}

  async find(roleId: string): Promise<Role> {
    const roles = await this.pg.pdb
      .select({
        roleId: roleSchema.roleId,
        familyId: roleSchema.familyId,
        roleCode: roleSchema.roleCode,
        roleName: roleSchema.roleName,
        isDisabled: roleSchema.isDisabled,
        isDeleted: roleSchema.isDeleted,
        createdAt: roleSchema.createdAt,
        updatedAt: roleSchema.updatedAt,
      })
      .from(roleSchema)
      .where(and(eq(roleSchema.roleId, roleId)))
    const role = roles[0]
    if (!role) throw new NotFoundException("角色不存在")
    return {
      ...role,
      createdAt: toIsoString(role.createdAt),
      updatedAt: toIsoString(role.updatedAt),
      allowDelete: this.systemProtection.can("ROLE", "delete", role.roleCode),
      allowDisable: this.systemProtection.can("ROLE", "updateStatus", role.roleCode),
    }
  }

  async create(values: CreateRole & { roleId: string }): Promise<Role> {
    await this.pg.pdb.insert(roleSchema).values({
      roleId: values.roleId,
      familyId: values.familyId,
      roleCode: values.roleCode,
      roleName: values.roleName,
      isDisabled: values.isDisabled ?? false,
      isDeleted: false,
    })
    return this.find(values.roleId)
  }

  async update(values: UpdateRole): Promise<Role> {
    // Validate updateStatus action
    if (values.isDisabled !== undefined) {
      const role = await this.find(values.roleId)
      this.systemProtection.validate("ROLE", "updateStatus", role.roleCode)
    }

    await this.pg.pdb
      .update(roleSchema)
      .set({
        ...(values.familyId !== undefined ? { familyId: values.familyId } : {}),
        ...(values.roleCode !== undefined ? { roleCode: values.roleCode } : {}),
        ...(values.roleName !== undefined ? { roleName: values.roleName } : {}),
        ...(values.isDisabled !== undefined ? { isDisabled: values.isDisabled } : {}),
        ...(values.isDeleted !== undefined ? { isDeleted: values.isDeleted } : {}),
      })
      .where(eq(roleSchema.roleId, values.roleId))
    return this.find(values.roleId)
  }

  async delete(roleId: string): Promise<boolean> {
    const role = await this.find(roleId)
    this.systemProtection.validate("ROLE", "delete", role.roleCode)

    await this.pg.pdb.update(roleSchema).set({ isDeleted: true }).where(eq(roleSchema.roleId, roleId))
    return true
  }

  async list(query: {
    familyId?: string | null
    roleCode?: string
    roleName?: string
    userId?: string
    username?: string
    isDeleted?: boolean
    page?: number | string
    pageSize?: number | string
  }): Promise<PageResult<Role>> {
    const where: Parameters<typeof and> = []

    // Filter by isDeleted if provided, otherwise default to false (only active roles)
    // However, if the user explicitly wants to see deleted roles, we should allow it.
    // Based on user requirement: "be able to query deleted data".
    // If isDeleted is strictly true/false, we use it. If undefined, we might default to false OR show all.
    // User mentioned "be able to query", implying a choice.
    // Let's implement: if isDeleted is undefined, show all (no filter on isDeleted)?
    // Or stick to typical admin pattern: default show active, allow filter to show deleted.
    // Re-reading user request: "hope to find deleted data in B-end... displayed as whether deleted".
    // This usually means showing ALL data by default or having a filter.
    // Let's assume default behavior is SHOW ALL (no filter on isDeleted) so user can see both.
    // But typically lists hide deleted.
    // Let's implement logic: if query.isDeleted is defined, use it. If not, don't filter (Show ALL).
    // WAIT, most systems default to `isDeleted: false`.
    // Let's check previous User module implementation logic (Memory id: 03fkky7s22zl9ftf0akuyufk9).
    // "Updated ... User list logic: default behavior (when isDeleted is undefined) now returns ALL users".
    // So I should follow this pattern: Default = ALL.

    if (query.isDeleted !== undefined) {
      where.push(eq(roleSchema.isDeleted, query.isDeleted))
    }
    // If isDeleted is undefined, we do NOTHING (return all)

    // User search logic
    if (query.userId || query.username) {
      let targetUserIds: string[] = []

      // 1. Get user IDs
      if (query.username) {
        const users = await this.pg.pdb
          .select({ userId: userSchema.userId })
          .from(userSchema)
          .where(and(eq(userSchema.isDeleted, false), like(userSchema.username, `%${query.username}%`)))
        targetUserIds = users.map((u) => u.userId)
      }

      // 2. Prioritize username search if results found, otherwise use userId if provided
      if (targetUserIds.length === 0 && query.userId) {
        // Validate userId format (UUID) before using it in SQL
        if (!z.uuid().safeParse(query.userId).success) {
          return toPageResult(normalizePage(query), 0, [])
        }
        targetUserIds = [query.userId]
      }

      // If no users found, return empty result
      if (targetUserIds.length === 0) {
        return toPageResult(normalizePage(query), 0, [])
      }

      // 3. Find family IDs for these users
      const families = await this.pg.pdb
        .select({ familyId: familyMemberSchema.familyId })
        .from(familyMemberSchema)
        .where(inArray(familyMemberSchema.userId, targetUserIds))

      const familyIds = families.map((f) => f.familyId).filter((id): id is string => !!id)

      if (familyIds.length > 0) {
        where.push(inArray(roleSchema.familyId, familyIds))
      } else {
        return toPageResult(normalizePage(query), 0, [])
      }
    } else if (query.familyId) {
      where.push(eq(roleSchema.familyId, query.familyId))
    }

    if (query.roleCode) where.push(like(roleSchema.roleCode, `%${query.roleCode}%`))
    if (query.roleName) where.push(like(roleSchema.roleName, `%${query.roleName}%`))

    const pageParams = normalizePage(query)

    const totalRows = await this.pg.pdb
      .select({ count: sql<number>`count(*)` })
      .from(roleSchema)
      .where(and(...where))
    const total = Number(totalRows[0]?.count ?? 0)

    const rows = await this.pg.pdb
      .select({
        roleId: roleSchema.roleId,
        familyId: roleSchema.familyId,
        roleCode: roleSchema.roleCode,
        roleName: roleSchema.roleName,
        isDisabled: roleSchema.isDisabled,
        isDeleted: roleSchema.isDeleted,
        createdAt: roleSchema.createdAt,
        updatedAt: roleSchema.updatedAt,
      })
      .from(roleSchema)
      .where(and(...where))
      .orderBy(desc(roleSchema.createdAt))
      .limit(pageParams.limit)
      .offset(pageParams.offset)

    const list = rows.map((row) => ({
      ...row,
      familyId: row.familyId ?? null,
      createdAt: toIsoString(row.createdAt),
      updatedAt: toIsoString(row.updatedAt),
      allowDelete: this.systemProtection.can("ROLE", "delete", row.roleCode),
      allowDisable: this.systemProtection.can("ROLE", "updateStatus", row.roleCode),
    }))

    return toPageResult(pageParams, total, list)
  }
}
