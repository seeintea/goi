import type { AppPermission, CreateAppPermission, UpdateAppPermission } from "@goi/contracts"
import { normalizePage, toIsoString, toPageResult } from "@goi/utils"
import { Injectable, NotFoundException } from "@nestjs/common"
import { and, desc, eq, like, sql } from "drizzle-orm"
import { PgService, pgSchema } from "@/database/postgresql"
import type { PageResult } from "@/types/response"

const { authPermission: permissionSchema } = pgSchema

@Injectable()
export class PermissionService {
  constructor(private readonly pg: PgService) {}

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

    return {
      ...permission,
      createdAt: toIsoString(permission.createdAt),
      updatedAt: toIsoString(permission.updatedAt),
    }
  }

  async create(values: CreateAppPermission & { permissionId: string }): Promise<AppPermission> {
    const [inserted] = await this.pg.pdb
      .insert(permissionSchema)
      .values({
        permissionId: values.permissionId,
        code: values.code,
        name: values.name ?? "",
        moduleId: values.moduleId,
        isDisabled: false,
        isDeleted: false,
      })
      .returning({ permissionId: permissionSchema.permissionId })
    return this.find(inserted.permissionId)
  }

  async update(values: UpdateAppPermission): Promise<AppPermission> {
    await this.pg.pdb
      .update(permissionSchema)
      .set({
        ...(values.code !== undefined ? { code: values.code } : {}),
        ...(values.name !== undefined ? { name: values.name } : {}),
        ...(values.moduleId !== undefined ? { moduleId: values.moduleId } : {}),
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

    const list = rows.map((row) => ({
      ...row,
      createdAt: toIsoString(row.createdAt),
      updatedAt: toIsoString(row.updatedAt),
    }))

    return toPageResult(pageParams, total, list)
  }
}
