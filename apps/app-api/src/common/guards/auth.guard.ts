import type { NestKitAuthenticator, NestKitAuthorizer, NestKitAuthResult, NestKitAuthUser } from "@goi/nest-kit"
import {
  BadRequestException,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common"
import { JwtService } from "@nestjs/jwt"
import { and, eq, inArray } from "drizzle-orm"
import type { Request } from "express"
import { PgService, pgSchema } from "@/database/postgresql"
import { RedisService } from "@/database/redis"

type JwtPayload = { userId?: string; exp?: number; iat?: number }
type AuthUser = { userId: string; username: string }

const {
  financeFamilyMember: familyMemberSchema,
  authPermission: permissionSchema,
  authRolePermission: rolePermissionSchema,
} = pgSchema

@Injectable()
export class AppAuthenticator implements NestKitAuthenticator {
  constructor(
    private readonly jwtService: JwtService,
    private readonly redisService: RedisService,
  ) {}

  async authenticate(request: unknown, _context: ExecutionContext): Promise<NestKitAuthResult> {
    const req = request as Request
    const token = extractBearerToken(req)
    if (!token) throw new UnauthorizedException()

    const payload = (await this.jwtService.verifyAsync(token)) as JwtPayload
    if (!payload?.userId) throw new UnauthorizedException()

    const cached = await this.redisService.get(`auth:token:${token}`)
    if (!cached) throw new UnauthorizedException("Token invalid or expired")

    const user = JSON.parse(cached) as AuthUser
    ;(req as unknown as { user?: AuthUser }).user = user

    return { user: user as NestKitAuthUser, token, payload }
  }
}

@Injectable()
export class FinanceAuthorizer implements NestKitAuthorizer {
  constructor(private readonly pg: PgService) {}

  async authorize(args: {
    request: unknown
    user: NestKitAuthUser
    permissions: string[]
    context: ExecutionContext
  }): Promise<void> {
    const request = args.request as Request
    const user = args.user as AuthUser

    if (this.isFinanceRequest(request) && !this.isFinanceBookOpenEndpoint(request)) {
      const familyId = this.extractFamilyId(request)
      if (!familyId) throw new BadRequestException("familyId is required")
      ;(request as unknown as { familyId?: string }).familyId = familyId
      const access = await this.resolveFamilyAccess(user.userId, familyId)
      if (args.permissions.length > 0 && !access.isOwner) {
        await this.assertHasPermissions(access.roleId, args.permissions)
      }
    }
  }

  private isFinanceRequest(request: Request): boolean {
    const url = request.originalUrl || request.url || ""
    return url.startsWith("/api/family/") || url.startsWith("/family/")
  }

  private isFinanceBookOpenEndpoint(request: Request): boolean {
    const url = request.originalUrl || request.url || ""
    return (
      url.startsWith("/api/family/list") ||
      url.startsWith("/api/family/create") ||
      url.startsWith("/family/list") ||
      url.startsWith("/family/create")
    )
  }

  private extractFamilyId(request: Request): string | undefined {
    const queryFamilyId = (request.query as Record<string, unknown> | undefined)?.familyId
    if (typeof queryFamilyId === "string" && queryFamilyId.length > 0) return queryFamilyId
    const bodyFamilyId = (request.body as Record<string, unknown> | undefined)?.familyId
    if (typeof bodyFamilyId === "string" && bodyFamilyId.length > 0) return bodyFamilyId
    const headerFamilyId = request.headers["x-family-id"]
    if (typeof headerFamilyId === "string" && headerFamilyId.length > 0) return headerFamilyId
    return undefined
  }

  private async resolveFamilyAccess(
    userId: string,
    familyId: string,
  ): Promise<{ isOwner: boolean; roleId: string | null }> {
    const memberRows = await this.pg.pdb
      .select({
        roleId: familyMemberSchema.roleId,
      })
      .from(familyMemberSchema)
      .where(
        and(
          eq(familyMemberSchema.userId, userId),
          eq(familyMemberSchema.familyId, familyId),
          eq(familyMemberSchema.status, "ACTIVE"),
        ),
      )
      .limit(1)

    const isOwner = false // TODO: check if user is owner of the family
    // For now we check owner via family table if needed, but simplified:

    let roleId: string | null = null
    if (memberRows[0]) {
      roleId = memberRows[0].roleId
    }

    if (!memberRows[0] && !isOwner) {
      throw new ForbiddenException("You are not a member of this family")
    }

    return { isOwner, roleId }
  }

  private async assertHasPermissions(roleId: string | null, permissions: string[]): Promise<void> {
    if (!roleId) throw new ForbiddenException("Role missing")

    const uniquePermissions = Array.from(new Set(permissions))
    const rows = await this.pg.pdb
      .select({ code: permissionSchema.code })
      .from(rolePermissionSchema)
      .innerJoin(permissionSchema, eq(rolePermissionSchema.permissionId, permissionSchema.permissionId))
      .where(
        and(
          eq(rolePermissionSchema.roleId, roleId),
          inArray(permissionSchema.code, uniquePermissions),
          eq(permissionSchema.isDeleted, false),
          eq(permissionSchema.isDisabled, false),
        ),
      )

    if (new Set(rows.map((r) => r.code)).size !== uniquePermissions.length) {
      throw new ForbiddenException("Permission denied")
    }
  }
}

function extractBearerToken(request: Request): string | undefined {
  const authorization = request.headers.authorization
  if (!authorization) return undefined
  const [type, token] = authorization.split(" ")
  if (type !== "Bearer") return undefined
  return token
}
