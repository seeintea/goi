import type { AppPermission, CreateAppPermission, UpdateAppPermission } from "@goi/contracts/app/permission"
import { Injectable, NotFoundException } from "@nestjs/common"
import { and, desc, eq, like, sql } from "drizzle-orm"
import { toIsoString } from "@/common/utils/date"
import { normalizePage, toPageResult } from "@/common/utils/pagination"
import { PgService, pgSchema } from "@/database/postgresql"
import type { PageResult } from "@/types/response"

const { permission: permissionSchema } = pgSchema

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
        createTime: permissionSchema.createTime,
        updateTime: permissionSchema.updateTime,
      })
      .from(permissionSchema)
      .where(and(eq(permissionSchema.permissionId, permissionId), eq(permissionSchema.isDeleted, false)))
      .limit(1)

    const permission = permissions[0]
    if (!permission) throw new NotFoundException("权限不存在")

    return {
      ...permission,
      createTime: toIsoString(permission.createTime),
      updateTime: toIsoString(permission.updateTime),
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
        createTime: permissionSchema.createTime,
        updateTime: permissionSchema.updateTime,
      })
      .from(permissionSchema)
      .where(and(...where))
      .orderBy(desc(permissionSchema.createTime))
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
