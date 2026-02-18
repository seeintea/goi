import type {
  AppPermission,
  AppPermissionTreeNode,
  AppPermissionTreeResponse,
  CreateAppPermission,
  UpdateAppPermission,
} from "@goi/contracts"
import { normalizePage, toIsoString, toPageResult } from "@goi/utils"
import { Injectable, NotFoundException } from "@nestjs/common"
import { and, asc, desc, eq, like, sql } from "drizzle-orm"
import { PgService, pgSchema } from "@/database/postgresql"
import type { PageResult } from "@/types/response"
import { ModuleService } from "../module/module.service"

const { authPermission: permissionSchema, authModule: moduleSchema } = pgSchema

@Injectable()
export class PermissionService {
  constructor(
    private readonly pg: PgService,
    private readonly moduleService: ModuleService,
  ) {}

  async tree(): Promise<AppPermissionTreeResponse> {
    const modules = await this.pg.pdb
      .select({
        moduleId: moduleSchema.moduleId,
        parentId: moduleSchema.parentId,
        name: moduleSchema.name,
        sort: moduleSchema.sort,
      })
      .from(moduleSchema)
      .where(eq(moduleSchema.isDeleted, false))
      .orderBy(asc(moduleSchema.sort))

    const permissions = await this.pg.pdb
      .select({
        permissionId: permissionSchema.permissionId,
        name: permissionSchema.name,
        moduleId: permissionSchema.moduleId,
      })
      .from(permissionSchema)
      .where(and(eq(permissionSchema.isDeleted, false), eq(permissionSchema.isDisabled, false)))

    const buildTree = (parentId: string | null): AppPermissionTreeNode[] => {
      const childrenModules = modules.filter((m) => m.parentId === parentId)
      return childrenModules.map((m) => {
        const modulePermissions = permissions.filter((p) => p.moduleId === m.moduleId)
        const subModules = buildTree(m.moduleId)

        const children: AppPermissionTreeNode[] = [
          ...subModules,
          ...modulePermissions.map((p) => ({
            key: p.permissionId,
            title: p.name,
            isLeaf: true,
            permissionId: p.permissionId,
            type: "permission" as const,
          })),
        ]

        return {
          key: m.moduleId,
          title: m.name,
          isLeaf: false,
          moduleId: m.moduleId,
          children: children.length > 0 ? children : undefined,
          type: "module" as const,
        }
      })
    }

    return buildTree(null)
  }

  async find(permissionId: string): Promise<AppPermission> {
    const permissions = await this.pg.pdb
      .select({
        permissionId: permissionSchema.permissionId,
        code: permissionSchema.code,
        name: permissionSchema.name,
        moduleId: permissionSchema.moduleId,
        isDisabled: permissionSchema.isDisabled,
        isDeleted: permissionSchema.isDeleted,
        createdAt: permissionSchema.createdAt,
        updatedAt: permissionSchema.updatedAt,
      })
      .from(permissionSchema)
      .where(and(eq(permissionSchema.permissionId, permissionId), eq(permissionSchema.isDeleted, false)))
      .limit(1)

    const permission = permissions[0]
    if (!permission) throw new NotFoundException("权限不存在")

    const names = await this.moduleService.getModuleNames([permission.moduleId])
    const moduleName = names[permission.moduleId] || null

    return {
      ...permission,
      moduleName,
      createdAt: toIsoString(permission.createdAt),
      updatedAt: toIsoString(permission.updatedAt),
    }
  }

  async create(values: CreateAppPermission & { permissionId: string }): Promise<AppPermission> {
    await this.pg.pdb.insert(permissionSchema).values({
      permissionId: values.permissionId,
      code: values.code,
      name: values.name ?? "",
      moduleId: values.moduleId,
      isDisabled: values.isDisabled ?? false,
      isDeleted: false,
    })
    return this.find(values.permissionId)
  }

  async update(values: UpdateAppPermission): Promise<AppPermission> {
    await this.pg.pdb
      .update(permissionSchema)
      .set({
        ...(values.code !== undefined ? { code: values.code } : {}),
        ...(values.name !== undefined ? { name: values.name } : {}),
        ...(values.moduleId !== undefined ? { moduleId: values.moduleId } : {}),
        ...(values.isDisabled !== undefined ? { isDisabled: values.isDisabled } : {}),
        ...(values.isDeleted !== undefined ? { isDeleted: values.isDeleted } : {}),
      })
      .where(eq(permissionSchema.permissionId, values.permissionId))

    return this.find(values.permissionId)
  }

  async delete(permissionId: string): Promise<boolean> {
    await this.pg.pdb
      .update(permissionSchema)
      .set({ isDeleted: true })
      .where(eq(permissionSchema.permissionId, permissionId))
    return true
  }

  async list(query: {
    code?: string
    moduleId?: string
    page?: number | string
    pageSize?: number | string
  }): Promise<PageResult<AppPermission>> {
    const where: Parameters<typeof and> = [eq(permissionSchema.isDeleted, false)]
    if (query.code) where.push(like(permissionSchema.code, `%${query.code}%`))
    if (query.moduleId) where.push(eq(permissionSchema.moduleId, query.moduleId))

    const pageParams = normalizePage(query)

    const totalRows = await this.pg.pdb
      .select({ count: sql<number>`count(*)` })
      .from(permissionSchema)
      .where(and(...where))
    const total = Number(totalRows[0]?.count ?? 0)

    const rows = await this.pg.pdb
      .select({
        permissionId: permissionSchema.permissionId,
        code: permissionSchema.code,
        name: permissionSchema.name,
        moduleId: permissionSchema.moduleId,
        isDisabled: permissionSchema.isDisabled,
        isDeleted: permissionSchema.isDeleted,
        createdAt: permissionSchema.createdAt,
        updatedAt: permissionSchema.updatedAt,
      })
      .from(permissionSchema)
      .where(and(...where))
      .orderBy(desc(permissionSchema.createdAt))
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
