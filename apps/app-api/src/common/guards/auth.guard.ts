import type {
  NestKitAuthenticator,
  NestKitAuthorizer,
  NestKitAuthResult,
  NestKitAuthUser,
} from "@goi/nest-kit"
import {
  BadRequestException,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  NotFoundException,
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
  financeBook: bookSchema,
  financeBookMember: bookMemberSchema,
  authPermission: permissionSchema,
  authRole: roleSchema,
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
      const bookId = this.extractBookId(request)
      if (!bookId) throw new BadRequestException("bookId is required")
      ;(request as unknown as { bookId?: string }).bookId = bookId
      const access = await this.resolveBookAccess(user.userId, bookId)
      if (args.permissions.length > 0 && !access.isOwner) {
        await this.assertHasPermissions(access.roleCode, args.permissions)
      }
    }
  }

  private isFinanceRequest(request: Request): boolean {
    const url = request.originalUrl || request.url || ""
    return url.startsWith("/api/ff/") || url.startsWith("/ff/")
  }

  private isFinanceBookOpenEndpoint(request: Request): boolean {
    const url = request.originalUrl || request.url || ""
    return (
      url.startsWith("/api/ff/book/list") ||
      url.startsWith("/api/ff/book/create") ||
      url.startsWith("/ff/book/list") ||
      url.startsWith("/ff/book/create")
    )
  }

  private extractBookId(request: Request): string | undefined {
    const queryBookId = (request.query as Record<string, unknown> | undefined)?.bookId
    if (typeof queryBookId === "string" && queryBookId.length > 0) return queryBookId
    const bodyBookId = (request.body as Record<string, unknown> | undefined)?.bookId
    if (typeof bodyBookId === "string" && bodyBookId.length > 0) return bodyBookId
    const headerBookId = request.headers["x-book-id"]
    if (typeof headerBookId === "string" && headerBookId.length > 0) return headerBookId
    return undefined
  }

  private async resolveBookAccess(
    userId: string,
    bookId: string,
  ): Promise<{ isOwner: true } | { isOwner: false; roleCode: string }> {
    const books = await this.pg.pdb
      .select({ ownerUserId: bookSchema.ownerUserId })
      .from(bookSchema)
      .where(and(eq(bookSchema.bookId, bookId), eq(bookSchema.isDeleted, false)))
    const book = books[0]
    if (!book) throw new NotFoundException("账本不存在")
    if (book.ownerUserId === userId) return { isOwner: true }

    const rows = await this.pg.pdb
      .select({ roleCode: bookMemberSchema.roleCode })
      .from(bookMemberSchema)
      .where(
        and(
          eq(bookMemberSchema.bookId, bookId),
          eq(bookMemberSchema.userId, userId),
          eq(bookMemberSchema.isDeleted, false),
        ),
      )
      .limit(1)
    if (!rows[0]) throw new ForbiddenException("No access to this book")
    return { isOwner: false, roleCode: rows[0].roleCode }
  }

  private async assertHasPermissions(roleCode: string, permissions: string[]): Promise<void> {
    const roles = await this.pg.pdb
      .select({ roleId: roleSchema.roleId })
      .from(roleSchema)
      .where(and(eq(roleSchema.roleCode, roleCode), eq(roleSchema.isDeleted, false), eq(roleSchema.isDisabled, false)))
      .limit(1)
    const roleId = roles[0]?.roleId
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
