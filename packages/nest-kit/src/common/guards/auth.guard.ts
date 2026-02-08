import { CanActivate, ExecutionContext, Inject, Injectable, Optional, UnauthorizedException } from "@nestjs/common"
import { Reflector } from "@nestjs/core"
import { JwtService } from "@nestjs/jwt"
import { PERMISSION_DECORATOR, PUBLIC_DECORATOR } from "../decorators/constants"

export type NestKitAuthUser = Record<string, unknown>

export type NestKitAuthResult = {
  user: NestKitAuthUser
  token?: string
  payload?: unknown
}

export interface NestKitAuthenticator {
  authenticate(request: unknown, context: ExecutionContext): Promise<NestKitAuthResult>
}

export interface NestKitAuthorizer {
  authorize(args: {
    request: unknown
    user: NestKitAuthUser
    permissions: string[]
    context: ExecutionContext
  }): Promise<void> | void
}

export type NestKitAuthGuardOptions = {
  allowSwagger?: boolean
}

export const NEST_KIT_AUTHENTICATOR = "NEST_KIT_AUTHENTICATOR"
export const NEST_KIT_AUTHORIZER = "NEST_KIT_AUTHORIZER"
export const NEST_KIT_AUTH_GUARD_OPTIONS = "NEST_KIT_AUTH_GUARD_OPTIONS"

@Injectable()
export class JwtAuthenticator implements NestKitAuthenticator {
  constructor(private readonly jwtService: JwtService) {}

  async authenticate(request: unknown, _context: ExecutionContext): Promise<NestKitAuthResult> {
    const token = extractBearerToken(request)
    if (!token) throw new UnauthorizedException()
    const payload = await this.jwtService.verifyAsync(token)
    if (!payload || typeof payload !== "object") throw new UnauthorizedException()
    return { user: payload as NestKitAuthUser, token, payload }
  }
}

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    @Optional() @Inject(NEST_KIT_AUTHENTICATOR) private readonly authenticator?: NestKitAuthenticator,
    @Optional() @Inject(NEST_KIT_AUTHORIZER) private readonly authorizer?: NestKitAuthorizer,
    @Optional() @Inject(NEST_KIT_AUTH_GUARD_OPTIONS) private readonly options?: NestKitAuthGuardOptions,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const targets = [context.getHandler(), context.getClass()]
    const isPublic = this.reflector.getAllAndOverride<boolean>(PUBLIC_DECORATOR, targets)
    if (isPublic) return true

    const request = context.switchToHttp().getRequest()
    if (this.isSwaggerRequest(request) && (this.options?.allowSwagger ?? true)) return true

    if (!this.authenticator) {
      throw new UnauthorizedException("Authenticator missing")
    }

    const permissions = normalizePermissions(
      this.reflector.getAllAndOverride<string[] | string | undefined>(PERMISSION_DECORATOR, targets),
    )

    const { user } = await this.authenticator.authenticate(request, context)
    ;(request as { user?: NestKitAuthUser }).user = user

    if (this.authorizer) {
      await this.authorizer.authorize({ request, user, permissions, context })
    }

    return true
  }

  private isSwaggerRequest(request: unknown): boolean {
    const url = (request as { originalUrl?: unknown; url?: unknown }).originalUrl ?? (request as { url?: unknown }).url
    if (typeof url !== "string") return false
    return url.startsWith("/swagger") || url.startsWith("/swagger/")
  }
}

function normalizePermissions(value: string[] | string | undefined): string[] {
  if (Array.isArray(value)) return value.filter((v) => typeof v === "string" && v.length > 0)
  if (typeof value === "string" && value.length > 0) return [value]
  return []
}

function extractBearerToken(request: unknown): string | undefined {
  const authorization = (request as { headers?: { authorization?: unknown } })?.headers?.authorization
  if (typeof authorization !== "string" || authorization.length === 0) return undefined
  const [type, token] = authorization.split(" ")
  if (type !== "Bearer") return undefined
  if (typeof token !== "string" || token.length === 0) return undefined
  return token
}
