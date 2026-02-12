import { normalizePage, toIsoString, toPageResult } from "@goi/utils"
import { Injectable, NotFoundException } from "@nestjs/common"
import { and, desc, eq, sql } from "drizzle-orm"
import { PgService, pgSchema } from "@/database/postgresql"
import type { PageResult } from "@/types/response"
import type { CreateRolePermission, RolePermission } from "./role-permission.dto"

const { authRolePermission: rolePermissionSchema } = pgSchema

@Injectable()
export class RolePermissionService {
  constructor(private readonly pg: PgService) {}

  async find(roleId: string, permissionId: string): Promise<RolePermission> {
    const rows = await this.pg.pdb
      .select({
        roleId: rolePermissionSchema.roleId,
        permissionId: rolePermissionSchema.permissionId,
        createdAt: rolePermissionSchema.createdAt,
      })
      .from(rolePermissionSchema)
      .where(and(eq(rolePermissionSchema.roleId, roleId), eq(rolePermissionSchema.permissionId, permissionId)))
    const row = rows[0]
    if (!row) throw new NotFoundException("角色权限关联不存在")
    return {
      ...row,
      createdAt: toIsoString(row.createdAt),
    }
  }

  async create(values: CreateRolePermission): Promise<RolePermission> {
    await this.pg.pdb.insert(rolePermissionSchema).values({
      roleId: values.roleId,
      permissionId: values.permissionId,
    })
    return this.find(values.roleId, values.permissionId)
  }

  async delete(roleId: string, permissionId: string): Promise<boolean> {
    await this.pg.pdb
      .delete(rolePermissionSchema)
      .where(and(eq(rolePermissionSchema.roleId, roleId), eq(rolePermissionSchema.permissionId, permissionId)))
    return true
  }

  async list(query: {
    roleId?: string
    permissionId?: string
    page?: number | string
    pageSize?: number | string
  }): Promise<PageResult<RolePermission>> {
    const where: Parameters<typeof and> = []
    if (query.roleId) where.push(eq(rolePermissionSchema.roleId, query.roleId))
    if (query.permissionId) where.push(eq(rolePermissionSchema.permissionId, query.permissionId))

    const pageParams = normalizePage(query)

    const countQb = this.pg.pdb.select({ count: sql<number>`count(*)` }).from(rolePermissionSchema)
    if (where.length) {
      countQb.where(and(...where))
    }
    const totalRows = await countQb
    const total = Number(totalRows[0]?.count ?? 0)

    const qb = this.pg.pdb
      .select({
        roleId: rolePermissionSchema.roleId,
        permissionId: rolePermissionSchema.permissionId,
        createdAt: rolePermissionSchema.createdAt,
      })
      .from(rolePermissionSchema)
    if (where.length) {
      qb.where(and(...where))
    }
    const rows = await qb
      .orderBy(desc(rolePermissionSchema.createdAt))
      .limit(pageParams.limit)
      .offset(pageParams.offset)

    const list = rows.map((row) => ({
      ...row,
      createdAt: toIsoString(row.createdAt),
    }))

    return toPageResult(pageParams, total, list)
  }
}
