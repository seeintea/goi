import type {
  AdminPermission,
  CreateAdminPermission,
  UpdateAdminPermission,
  UpdateAdminPermissionStatus,
} from "@goi/contracts"
import { normalizePage, toIsoString, toPageResult } from "@goi/utils"
import { Injectable, NotFoundException } from "@nestjs/common"
import { and, desc, eq, like, sql } from "drizzle-orm"
import { PgService, pgSchema } from "@/database/postgresql"
import type { PageResult } from "@/types/response"
import { ModuleService } from "../module/module.service"

const { adminPermission: adminPermissionSchema } = pgSchema

@Injectable()
export class PermissionService {
  constructor(
    private readonly pg: PgService,
    private readonly moduleService: ModuleService,
  ) {}

  async find(permissionId: string): Promise<AdminPermission> {
    const permissions = await this.pg.pdb
      .select({
        permissionId: adminPermissionSchema.permissionId,
        code: adminPermissionSchema.code,
        name: adminPermissionSchema.name,
        moduleId: adminPermissionSchema.moduleId,
        isDisabled: adminPermissionSchema.isDisabled,
        isDeleted: adminPermissionSchema.isDeleted,
        createdAt: adminPermissionSchema.createdAt,
        updatedAt: adminPermissionSchema.updatedAt,
      })
      .from(adminPermissionSchema)
      .where(and(eq(adminPermissionSchema.permissionId, permissionId), eq(adminPermissionSchema.isDeleted, false)))
      .limit(1)

    const permission = permissions[0]
    if (!permission) throw new NotFoundException("管理员权限不存在")

    const names = await this.moduleService.getModuleNames([permission.moduleId])
    const moduleName = names[permission.moduleId] || null

    return {
      ...permission,
      moduleName,
      createdAt: toIsoString(permission.createdAt),
      updatedAt: toIsoString(permission.updatedAt),
    }
  }

  async create(values: CreateAdminPermission & { permissionId: string }): Promise<AdminPermission> {
    await this.pg.pdb.insert(adminPermissionSchema).values({
      permissionId: values.permissionId,
      code: values.code,
      name: values.name ?? "",
      moduleId: values.moduleId,
      isDisabled: false,
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
      })
      .where(eq(adminPermissionSchema.permissionId, values.permissionId))

    return this.find(values.permissionId)
  }

  async updateStatus(values: UpdateAdminPermissionStatus): Promise<AdminPermission> {
    await this.pg.pdb
      .update(adminPermissionSchema)
      .set({
        isDisabled: values.isDisabled,
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
        createdAt: adminPermissionSchema.createdAt,
        updatedAt: adminPermissionSchema.updatedAt,
      })
      .from(adminPermissionSchema)
      .where(and(...where))
      .orderBy(desc(adminPermissionSchema.createdAt))
      .limit(pageParams.limit)
      .offset(pageParams.offset)

    const moduleIds = rows.map((r) => r.moduleId)
    const moduleNames = await this.moduleService.getModuleNames(moduleIds)

    const list = rows.map((row) => ({
      ...row,
      moduleName: moduleNames[row.moduleId] || null,
      createdAt: toIsoString(row.createdAt),
      updatedAt: toIsoString(row.updatedAt),
    }))

    return toPageResult(pageParams, total, list)
  }
}
