import { AdminPermission, CreateAdminPermission, UpdateAdminPermission } from "@goi/contracts";
import { Injectable, NotFoundException } from "@nestjs/common"
import { and, desc, eq, like, sql } from "drizzle-orm"
import { toIsoString } from "@/common/utils/date"
import { normalizePage, toPageResult } from "@/common/utils/pagination"
import { PgService, pgSchema } from "@/database/postgresql"
import type { PageResult } from "@/types/response"

const { adminPermission: adminPermissionSchema } = pgSchema

@Injectable()
export class PermissionService {
  constructor(private readonly pg: PgService) {}

  async find(permissionId: string): Promise<AdminPermission> {
    const permissions = await this.pg.pdb
      .select({
        permissionId: adminPermissionSchema.permissionId,
        code: adminPermissionSchema.code,
        name: adminPermissionSchema.name,
        moduleId: adminPermissionSchema.moduleId,
        isDisabled: adminPermissionSchema.isDisabled,
        isDeleted: adminPermissionSchema.isDeleted,
        createTime: adminPermissionSchema.createTime,
        updateTime: adminPermissionSchema.updateTime,
      })
      .from(adminPermissionSchema)
      .where(and(eq(adminPermissionSchema.permissionId, permissionId), eq(adminPermissionSchema.isDeleted, false)))
      .limit(1)

    const permission = permissions[0]
    if (!permission) throw new NotFoundException("管理员权限不存在")

    return {
      ...permission,
      createTime: toIsoString(permission.createTime),
      updateTime: toIsoString(permission.updateTime),
    }
  }

  async create(values: CreateAdminPermission & { permissionId: string }): Promise<AdminPermission> {
    await this.pg.pdb.insert(adminPermissionSchema).values({
      permissionId: values.permissionId,
      code: values.code,
      name: values.name ?? "",
      moduleId: values.moduleId,
      isDisabled: values.isDisabled ?? false,
      isDeleted: false,
    })
    return this.find(values.permissionId)
  }

  async update(values: UpdateAdminPermission): Promise<AdminPermission> {
    await this.pg.pdb
      .update(adminPermissionSchema)
      .set({
        ...(values.code !== undefined ? { code: values.code } : {}),
        ...(values.name !== undefined ? { name: values.name } : {}),
        ...(values.moduleId !== undefined ? { moduleId: values.moduleId } : {}),
        ...(values.isDisabled !== undefined ? { isDisabled: values.isDisabled } : {}),
        ...(values.isDeleted !== undefined ? { isDeleted: values.isDeleted } : {}),
      })
      .where(eq(adminPermissionSchema.permissionId, values.permissionId))

    return this.find(values.permissionId)
  }

  async delete(permissionId: string): Promise<boolean> {
    await this.pg.pdb
      .update(adminPermissionSchema)
      .set({ isDeleted: true })
      .where(eq(adminPermissionSchema.permissionId, permissionId))
    return true
  }

  async list(query: {
    code?: string
    moduleId?: string
    page?: number | string
    pageSize?: number | string
  }): Promise<PageResult<AdminPermission>> {
    const where: Parameters<typeof and> = [eq(adminPermissionSchema.isDeleted, false)]
    if (query.code) where.push(like(adminPermissionSchema.code, `%${query.code}%`))
    if (query.moduleId) where.push(eq(adminPermissionSchema.moduleId, query.moduleId))

    const pageParams = normalizePage(query)

    const totalRows = await this.pg.pdb
      .select({ count: sql<number>`count(*)` })
      .from(adminPermissionSchema)
      .where(and(...where))
    const total = Number(totalRows[0]?.count ?? 0)

    const rows = await this.pg.pdb
      .select({
        permissionId: adminPermissionSchema.permissionId,
        code: adminPermissionSchema.code,
        name: adminPermissionSchema.name,
        moduleId: adminPermissionSchema.moduleId,
        isDisabled: adminPermissionSchema.isDisabled,
        isDeleted: adminPermissionSchema.isDeleted,
        createTime: adminPermissionSchema.createTime,
        updateTime: adminPermissionSchema.updateTime,
      })
      .from(adminPermissionSchema)
      .where(and(...where))
      .orderBy(desc(adminPermissionSchema.createTime))
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
