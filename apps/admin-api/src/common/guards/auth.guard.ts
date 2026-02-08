import type { NestKitAuthenticator, NestKitAuthResult, NestKitAuthUser } from "@goi/nest-kit"
import { ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common"
import { JwtService } from "@nestjs/jwt"
import type { Request } from "express"
import { RedisService } from "@/database/redis"

type JwtPayload = { userId?: string; exp?: number; iat?: number }
type AdminAuthUser = { userId: string; username: string }

@Injectable()
export class AdminAuthenticator implements NestKitAuthenticator {
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

    const cached = await this.redisService.get(`admin:auth:token:${token}`)
    if (!cached) throw new UnauthorizedException("Token invalid or expired")

    const user = JSON.parse(cached) as AdminAuthUser
    ;(req as unknown as { user?: AdminAuthUser }).user = user

    return { user: user as NestKitAuthUser, token, payload }
  }
}

function extractBearerToken(request: Request): string | undefined {
  const authorization = request.headers.authorization
  if (!authorization) return undefined
  const [type, token] = authorization.split(" ")
  if (type !== "Bearer") return undefined
  return token
}
