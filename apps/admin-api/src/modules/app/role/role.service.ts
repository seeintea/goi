import { Injectable, NotFoundException } from "@nestjs/common"
import { and, desc, eq, like, sql } from "drizzle-orm"
import { toIsoString, normalizePage, toPageResult } from "@goi/utils"
import { PgService, pgSchema } from "@/database/postgresql"
import type { PageResult } from "@/types/response"
import type { CreateRole, Role, UpdateRole } from "./role.dto"

const { authRole: roleSchema } = pgSchema

@Injectable()
export class RoleService {
  constructor(private readonly pg: PgService) {}

  async find(roleId: string): Promise<Role> {
    const roles = await this.pg.pdb
      .select({
        roleId: roleSchema.roleId,
        roleCode: roleSchema.roleCode,
        roleName: roleSchema.roleName,
        isDisabled: roleSchema.isDisabled,
        isDeleted: roleSchema.isDeleted,
        createTime: roleSchema.createTime,
        updateTime: roleSchema.updateTime,
      })
      .from(roleSchema)
      .where(and(eq(roleSchema.roleId, roleId), eq(roleSchema.isDeleted, false)))
    const role = roles[0]
    if (!role) throw new NotFoundException("角色不存在")
    return {
      ...role,
      createTime: toIsoString(role.createTime),
      updateTime: toIsoString(role.updateTime),
    }
  }

  async create(values: CreateRole & { roleId: string }): Promise<Role> {
    await this.pg.pdb.insert(roleSchema).values({
      roleId: values.roleId,
      roleCode: values.roleCode,
      roleName: values.roleName,
      isDisabled: values.isDisabled ?? false,
      isDeleted: false,
    })
    return this.find(values.roleId)
  }

  async update(values: UpdateRole): Promise<Role> {
    await this.pg.pdb
      .update(roleSchema)
      .set({
        ...(values.roleCode !== undefined ? { roleCode: values.roleCode } : {}),
        ...(values.roleName !== undefined ? { roleName: values.roleName } : {}),
        ...(values.isDisabled !== undefined ? { isDisabled: values.isDisabled } : {}),
        ...(values.isDeleted !== undefined ? { isDeleted: values.isDeleted } : {}),
      })
      .where(eq(roleSchema.roleId, values.roleId))
    return this.find(values.roleId)
  }

  async delete(roleId: string): Promise<boolean> {
    await this.pg.pdb.update(roleSchema).set({ isDeleted: true }).where(eq(roleSchema.roleId, roleId))
    return true
  }

  async list(query: {
    roleCode?: string
    roleName?: string
    page?: number | string
    pageSize?: number | string
  }): Promise<PageResult<Role>> {
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
        roleCode: roleSchema.roleCode,
        roleName: roleSchema.roleName,
        isDisabled: roleSchema.isDisabled,
        isDeleted: roleSchema.isDeleted,
        createTime: roleSchema.createTime,
        updateTime: roleSchema.updateTime,
      })
      .from(roleSchema)
      .where(and(...where))
      .orderBy(desc(roleSchema.createTime))
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
