import type { CreateFamily, Family, UpdateFamily } from "@goi/contracts"
import { normalizePage, toPageResult } from "@goi/utils"
import { Injectable, NotFoundException } from "@nestjs/common"
import { and, desc, eq, ilike, sql } from "drizzle-orm"
import { v4 as uuid } from "uuid"
import { FAMILY_ROLE_CONFIG } from "@/config/family-role.config"
import { PgService, pgSchema } from "@/database/postgresql"
import { RoleService } from "@/modules/role/role.service"
import type { PageResult } from "@/types/response"

const { financeFamily, authRole: roleSchema, financeFamilyMember: familyMemberSchema } = pgSchema

@Injectable()
export class FamilyService {
  constructor(
    private readonly pg: PgService,
    private readonly roleService: RoleService,
  ) {}

  async find(id: string, tx?: Parameters<Parameters<PgService["pdb"]["transaction"]>[0]>[0]): Promise<Family> {
    const db = tx || this.pg.pdb
    const rows = await db
      .select({
        id: financeFamily.id,
        name: financeFamily.name,
        ownerUserId: financeFamily.ownerUserId,
        baseCurrency: financeFamily.baseCurrency,
        timezone: financeFamily.timezone,
        isDeleted: financeFamily.isDeleted,
        createdAt: financeFamily.createdAt,
        updatedAt: financeFamily.updatedAt,
      })
      .from(financeFamily)
      .where(and(eq(financeFamily.id, id), eq(financeFamily.isDeleted, false)))
      .limit(1)

    const row = rows[0]
    if (!row) throw new NotFoundException("Family not found")

    return {
      ...row,
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
    } as unknown as Family
  }

  async create(userId: string, dto: CreateFamily & { id: string }): Promise<Family> {
    return this.pg.pdb.transaction(async (tx) => {
      // 1. Create Family
      const [insertedFamily] = await tx
        .insert(financeFamily)
        .values({
          id: dto.id,
          name: dto.name,
          ownerUserId: userId,
          baseCurrency: dto.baseCurrency,
          timezone: dto.timezone,
        })
        .returning({ id: financeFamily.id })

      const familyId = insertedFamily.id

      // 2. Clone global roles to family roles
      const globalRoles = await this.roleService.findGlobalRoles()
      const newRoles = globalRoles.map((role) => ({
        roleId: uuid(),
        familyId: familyId,
        roleCode: role.roleCode,
        roleName: role.roleName,
        isDisabled: false,
        isDeleted: false,
      }))

      if (newRoles.length > 0) {
        await tx.insert(roleSchema).values(newRoles)
      }

      // 3. Assign owner role to creator
      // Find the 'owner' role from the newly created roles
      const ownerRole = newRoles.find((role) => role.roleCode === FAMILY_ROLE_CONFIG.CREATOR_ROLE_CODE)
      if (ownerRole) {
        await tx.insert(familyMemberSchema).values({
          id: uuid(),
          familyId: familyId,
          userId: userId,
          roleId: ownerRole.roleId,
          status: "active",
        })
      }

      return this.find(familyId, tx)
    })
  }

  async update(id: string, dto: UpdateFamily): Promise<Family> {
    await this.pg.pdb
      .update(financeFamily)
      .set({
        ...(dto.name !== undefined ? { name: dto.name } : {}),
        ...(dto.baseCurrency !== undefined ? { baseCurrency: dto.baseCurrency } : {}),
        ...(dto.timezone !== undefined ? { timezone: dto.timezone } : {}),
      })
      .where(eq(financeFamily.id, id))

    return this.find(id)
  }

  async delete(id: string): Promise<boolean> {
    const [deleted] = await this.pg.pdb
      .update(financeFamily)
      .set({ isDeleted: true })
      .where(eq(financeFamily.id, id))
      .returning({
        id: financeFamily.id,
      })

    if (!deleted) throw new NotFoundException("Family not found")
    return true
  }

  async list(query: {
    name?: string
    page?: number | string
    pageSize?: number | string
  }): Promise<PageResult<Family>> {
    const where: Parameters<typeof and> = []

    if (query.name) {
      where.push(ilike(financeFamily.name, `%${query.name}%`))
    }

    const pageParams = normalizePage(query)

    const totalRows = await this.pg.pdb
      .select({ count: sql<number>`count(*)` })
      .from(financeFamily)
      .where(and(...where))
    const total = Number(totalRows[0]?.count ?? 0)

    const rows = await this.pg.pdb
      .select({
        id: financeFamily.id,
        name: financeFamily.name,
        ownerUserId: financeFamily.ownerUserId,
        baseCurrency: financeFamily.baseCurrency,
        timezone: financeFamily.timezone,
        isDeleted: financeFamily.isDeleted,
        createdAt: financeFamily.createdAt,
        updatedAt: financeFamily.updatedAt,
      })
      .from(financeFamily)
      .where(and(...where))
      .orderBy(desc(financeFamily.createdAt))
      .limit(pageParams.limit)
      .offset(pageParams.offset)

    return toPageResult(
      pageParams,
      total,
      rows.map((r) => ({
        ...r,
        createdAt: r.createdAt.toISOString(),
        updatedAt: r.updatedAt.toISOString(),
      })) as unknown as Family[],
    )
  }
}
