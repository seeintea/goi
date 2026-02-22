import type { AppRole, CreateAppRole, UpdateAppRole } from "@goi/contracts"
import { SystemProtectionService } from "@goi/nest-kit"
import { normalizePage, toIsoString, toPageResult } from "@goi/utils"
import { Injectable, NotFoundException } from "@nestjs/common"
import { and, desc, eq, isNull, like, sql } from "drizzle-orm"
import { PgService, pgSchema } from "@/database/postgresql"
import type { PageResult } from "@/types/response"

const { authRole: roleSchema } = pgSchema

@Injectable()
export class RoleService {
  constructor(
    private readonly pg: PgService,
    private readonly protection: SystemProtectionService,
  ) {}

  async find(roleId: string): Promise<AppRole> {
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
      .where(and(eq(roleSchema.roleId, roleId), eq(roleSchema.isDeleted, false)))
    const role = roles[0]
    if (!role) throw new NotFoundException("角色不存在")
    return {
      ...role,
      createdAt: toIsoString(role.createdAt),
      updatedAt: toIsoString(role.updatedAt),
    }
  }

  async findGlobalRoles(): Promise<AppRole[]> {
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
      .where(and(eq(roleSchema.isDeleted, false), eq(roleSchema.isDisabled, false), isNull(roleSchema.familyId)))

    return roles.map((role) => ({
      ...role,
      createdAt: toIsoString(role.createdAt),
      updatedAt: toIsoString(role.updatedAt),
    }))
  }

  async create(values: CreateAppRole & { roleId: string }): Promise<AppRole> {
    const [inserted] = await this.pg.pdb
      .insert(roleSchema)
      .values({
        roleId: values.roleId,
        familyId: values.familyId,
        roleCode: values.roleCode,
        roleName: values.roleName,
        isDisabled: false,
        isDeleted: false,
      })
      .returning({ roleId: roleSchema.roleId })
    return this.find(inserted.roleId)
  }

  async update(values: UpdateAppRole): Promise<AppRole> {
    const role = await this.find(values.roleId)
    this.protection.validate("role", "update", role.roleCode ?? "")

    await this.pg.pdb
      .update(roleSchema)
      .set({
        ...(values.familyId !== undefined ? { familyId: values.familyId } : {}),
        ...(values.roleCode !== undefined ? { roleCode: values.roleCode } : {}),
        ...(values.roleName !== undefined ? { roleName: values.roleName } : {}),
      })
      .where(eq(roleSchema.roleId, values.roleId))
    return this.find(values.roleId)
  }

  async delete(roleId: string): Promise<boolean> {
    const role = await this.find(roleId)
    this.protection.validate("role", "delete", role.roleCode ?? "")

    await this.pg.pdb.update(roleSchema).set({ isDeleted: true }).where(eq(roleSchema.roleId, roleId))
    return true
  }

  async list(query: {
    roleCode?: string
    roleName?: string
    page?: number | string
    pageSize?: number | string
  }): Promise<PageResult<AppRole>> {
    const where: Parameters<typeof and> = [eq(roleSchema.isDeleted, false)]
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
      createdAt: toIsoString(row.createdAt),
      updatedAt: toIsoString(row.updatedAt),
    }))

    return toPageResult(pageParams, total, list)
  }
}
