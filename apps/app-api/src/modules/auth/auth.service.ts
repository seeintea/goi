import { BusinessException } from "@goi/nest-kit"
import { verifyPassword } from "@goi/utils-node"
import { Injectable, UnauthorizedException } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import { JwtService } from "@nestjs/jwt"
import { and, desc, eq } from "drizzle-orm"
import { PgService, pgSchema } from "@/database/postgresql"
import { RedisService } from "@/database/redis"
import { UserService } from "@/modules/user/user.service"
import type { LoginResponse } from "./auth.dto"

const { financeBook: bookSchema, financeBookMember: bookMemberSchema, authRole: roleSchema } = pgSchema

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
      bookId: context.bookId,
    }
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

  private async resolveLoginContext(
    userId: string,
  ): Promise<{ roleId: string | null; roleName: string | null; bookId: string | null }> {
    const memberRows = await this.pg.pdb
      .select({
        bookId: bookMemberSchema.bookId,
        roleCode: bookMemberSchema.roleCode,
      })
      .from(bookMemberSchema)
      .innerJoin(bookSchema, eq(bookMemberSchema.bookId, bookSchema.bookId))
      .where(
        and(
          eq(bookMemberSchema.userId, userId),
          eq(bookMemberSchema.isDeleted, false),
          eq(bookSchema.isDeleted, false),
        ),
      )
      .orderBy(desc(bookMemberSchema.createdAt))
      .limit(1)

    if (memberRows[0]) {
      const role = await this.resolveRoleByCode(memberRows[0].roleCode)
      return { bookId: memberRows[0].bookId, roleId: role?.roleId ?? null, roleName: role?.roleName ?? null }
    }

    const ownerRows = await this.pg.pdb
      .select({ bookId: bookSchema.bookId })
      .from(bookSchema)
      .where(and(eq(bookSchema.ownerUserId, userId), eq(bookSchema.isDeleted, false)))
      .orderBy(desc(bookSchema.createdAt))
      .limit(1)

    if (ownerRows[0]) {
      const role = await this.resolveRoleByCode("Owner")
      return { bookId: ownerRows[0].bookId, roleId: role?.roleId ?? null, roleName: role?.roleName ?? null }
    }

    return { bookId: null, roleId: null, roleName: null }
  }

  private async resolveRoleByCode(roleCode: string): Promise<{ roleId: string; roleName: string } | undefined> {
    const rows = await this.pg.pdb
      .select({ roleId: roleSchema.roleId, roleName: roleSchema.roleName })
      .from(roleSchema)
      .where(and(eq(roleSchema.roleCode, roleCode), eq(roleSchema.isDeleted, false), eq(roleSchema.isDisabled, false)))
      .limit(1)
    const row = rows[0]
    if (!row) return undefined
    return row
  }
}
