import { AppUser, LoginResponse, NavMenuTree } from "@goi/contracts"
import { BusinessException } from "@goi/nest-kit"
import { generateSalt, hashPassword, verifyPassword } from "@goi/utils-node"
import { Injectable, UnauthorizedException } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import { JwtService } from "@nestjs/jwt"
import { and, desc, eq, isNull } from "drizzle-orm"
import { v4 as uuid } from "uuid"
import { FAMILY_ROLE_CONFIG } from "@/config/family-role.config"
import { PgService, pgSchema } from "@/database/postgresql"
import { RedisService } from "@/database/redis"
import { UserService } from "@/modules/user/user.service"
import type { RegisterDto } from "./auth.dto"

const {
  financeFamily: familySchema,
  financeFamilyMember: familyMemberSchema,
  authRole: roleSchema,
  authPermission: permissionSchema,
  authRolePermission: rolePermissionSchema,
  authModule: appModule,
} = pgSchema

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly redisService: RedisService,
    private readonly configService: ConfigService,
    private readonly pg: PgService,
  ) {}

  async login(username: string, password: string): Promise<LoginResponse> {
    const user = await this.userService.findAuthUserByUsername(username)
    if (!user) throw new BusinessException("用户名或密码错误，请重试")
    if (user.isDisabled) throw new BusinessException("用户已被禁用")

    const ok = verifyPassword(password, user.password, user.salt)
    if (!ok) throw new BusinessException("用户名或密码错误，请重试")

    const accessToken = await this.jwtService.signAsync({ userId: user.userId })

    const ttl = Number(this.configService.getOrThrow<number>("TOKEN_EXPIRE_TIME"))
    const userKey = `auth:user:${user.userId}`
    const oldToken = await this.redisService.get(userKey)
    if (oldToken) {
      await this.redisService.del(`auth:token:${oldToken}`)
    }

    await this.redisService.set(`auth:token:${accessToken}`, JSON.stringify({ userId: user.userId, username }), ttl)
    await this.redisService.set(userKey, accessToken, ttl)

    const context = await this.resolveLoginContext(user.userId)

    return {
      userId: user.userId,
      username: user.username,
      accessToken,
      roleId: context.roleId,
      roleName: context.roleName,
      familyId: context.familyId,
    }
  }

  async register(dto: RegisterDto): Promise<AppUser> {
    const salt = generateSalt(16)
    const password = hashPassword(dto.password, salt)
    return this.userService.create({ ...dto, password, salt, userId: uuid() })
  }

  async logout(token?: string): Promise<boolean> {
    if (!token) return true

    await this.redisService.del(`auth:token:${token}`)

    try {
      const payload = (await this.jwtService.verifyAsync(token, { secret: process.env.JWT_SECRET })) as {
        userId?: string
      }
      const userId = payload?.userId
      if (userId) {
        await this.redisService.del(`auth:user:${userId}`)
      }
    } catch {
      throw new UnauthorizedException()
    }

    return true
  }

  async getNav(userId: string, familyId?: string): Promise<NavMenuTree[]> {
    const permissions = await this.getPermissions(userId, familyId)

    const allModules = await this.pg.pdb
      .select()
      .from(appModule)
      .where(eq(appModule.isDeleted, false))
      .orderBy(appModule.sort)

    const validModules = allModules.filter((m) => {
      if (m.permissionCode && !permissions.includes(m.permissionCode)) {
        return false
      }
      return true
    })

    return this.buildMenuTree(validModules)
  }

  private buildMenuTree(modules: (typeof appModule.$inferSelect)[], parentId: string | null = null): NavMenuTree[] {
    const children = modules
      .filter((m) => m.parentId === parentId)
      .map((m) => {
        const subChildren = this.buildMenuTree(modules, m.moduleId)
        return {
          moduleId: m.moduleId,
          parentId: m.parentId as any,
          name: m.name,
          routePath: m.routePath,
          permissionCode: m.permissionCode,
          sort: m.sort,
          children: subChildren.length > 0 ? subChildren : undefined,
        }
      })
      .sort((a, b) => a.sort - b.sort)
    return children
  }

  async getPermissions(userId: string, familyId?: string): Promise<string[]> {
    let targetFamilyId: string | null | undefined = familyId
    let roleId: string | null = null
    let roleCode: string | null = null

    if (!targetFamilyId) {
      const context = await this.resolveLoginContext(userId)
      targetFamilyId = context.familyId
      roleId = context.roleId
      roleCode = context.roleCode
    } else {
      const memberRows = await this.pg.pdb
        .select({
          roleId: familyMemberSchema.roleId,
          roleCode: roleSchema.roleCode,
        })
        .from(familyMemberSchema)
        .innerJoin(roleSchema, eq(familyMemberSchema.roleId, roleSchema.roleId))
        .where(
          and(
            eq(familyMemberSchema.userId, userId),
            eq(familyMemberSchema.familyId, targetFamilyId),
            eq(familyMemberSchema.status, "active"),
          ),
        )
        .limit(1)

      if (memberRows[0]) {
        roleId = memberRows[0].roleId
        roleCode = memberRows[0].roleCode
      }
    }

    if (!roleId || !roleCode) return []

    const shouldInherit = (FAMILY_ROLE_CONFIG.GLOBAL_PERMISSION_INHERITANCE_ROLES as readonly string[]).includes(
      roleCode,
    )

    // 1. Fetch local permissions (assigned to the specific role instance)
    const localPermissions = await this.pg.pdb
      .select({ code: permissionSchema.code })
      .from(rolePermissionSchema)
      .innerJoin(permissionSchema, eq(rolePermissionSchema.permissionId, permissionSchema.permissionId))
      .where(
        and(
          eq(rolePermissionSchema.roleId, roleId),
          eq(permissionSchema.isDeleted, false),
          eq(permissionSchema.isDisabled, false),
        ),
      )

    const permissionSet = new Set(localPermissions.map((r) => r.code))

    // 2. If role should inherit global permissions, fetch them and merge
    if (shouldInherit) {
      const globalPermissions = await this.pg.pdb
        .select({ code: permissionSchema.code })
        .from(rolePermissionSchema)
        .innerJoin(roleSchema, eq(rolePermissionSchema.roleId, roleSchema.roleId))
        .innerJoin(permissionSchema, eq(rolePermissionSchema.permissionId, permissionSchema.permissionId))
        .where(
          and(
            eq(roleSchema.roleCode, roleCode),
            isNull(roleSchema.familyId),
            eq(permissionSchema.isDeleted, false),
            eq(permissionSchema.isDisabled, false),
          ),
        )

      for (const p of globalPermissions) {
        permissionSet.add(p.code)
      }
    }

    return Array.from(permissionSet)
  }

  private async resolveLoginContext(
    userId: string,
  ): Promise<{ roleId: string | null; roleName: string | null; roleCode: string | null; familyId: string | null }> {
    const memberRows = await this.pg.pdb
      .select({
        familyId: familyMemberSchema.familyId,
        roleId: familyMemberSchema.roleId,
      })
      .from(familyMemberSchema)
      .innerJoin(familySchema, eq(familyMemberSchema.familyId, familySchema.id))
      .where(
        and(
          eq(familyMemberSchema.userId, userId),
          eq(familyMemberSchema.status, "active"),
          eq(familyMemberSchema.isDeleted, false),
          eq(familySchema.isDeleted, false),
        ),
      )
      .orderBy(desc(familyMemberSchema.joinedAt))
      .limit(1)

    if (memberRows[0]) {
      const role = await this.resolveRoleById(memberRows[0].roleId)
      return {
        familyId: memberRows[0].familyId,
        roleId: role?.roleId ?? null,
        roleName: role?.roleName ?? null,
        roleCode: role?.roleCode ?? null,
      }
    }

    return { roleId: null, roleName: null, roleCode: null, familyId: null }
  }

  private async resolveRoleById(roleId: string) {
    const [role] = await this.pg.pdb
      .select({ roleId: roleSchema.roleId, roleName: roleSchema.roleName, roleCode: roleSchema.roleCode })
      .from(roleSchema)
      .where(eq(roleSchema.roleId, roleId))
    return role
  }
}
