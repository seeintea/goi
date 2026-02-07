import { BusinessException } from "@goi/nest-kit/transport"
import { Injectable } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import { JwtService } from "@nestjs/jwt"
import { RedisService } from "@/database/redis"
import { UserService } from "@/modules/admin/user/user.service"
import type { AdminLoginResponseDto } from "./auth.dto"

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly redisService: RedisService,
    private readonly configService: ConfigService,
  ) {}

  async login(username: string, password: string): Promise<AdminLoginResponseDto> {
    const user = await this.userService.findAuthUserByUsername(username)
    if (!user) throw new BusinessException("用户名或密码错误，请重试")
    if (user.isDisabled) throw new BusinessException("用户已被禁用")

    const ok = this.userService.verifyPassword(password, user.password, user.salt)
    if (!ok) throw new BusinessException("用户名或密码错误，请重试")

    const accessToken = await this.jwtService.signAsync({ userId: user.userId })

    const ttl = Number(this.configService.getOrThrow<number>("TOKEN_EXPIRE_TIME"))
    const userKey = `admin:auth:user:${user.userId}`
    const oldToken = await this.redisService.get(userKey)
    if (oldToken) {
      await this.redisService.del(`admin:auth:token:${oldToken}`)
    }

    await this.redisService.set(
      `admin:auth:token:${accessToken}`,
      JSON.stringify({ userId: user.userId, username: user.username }),
      ttl,
    )
    await this.redisService.set(userKey, accessToken, ttl)

    return { userId: user.userId, username: user.username, accessToken }
  }

  async logout(token: string): Promise<boolean> {
    const cached = await this.redisService.get(`admin:auth:token:${token}`)
    if (!cached) return true
    const user = JSON.parse(cached) as { userId?: string }
    if (user.userId) {
      await this.redisService.del(`admin:auth:user:${user.userId}`)
    }
    await this.redisService.del(`admin:auth:token:${token}`)
    return true
  }
}
