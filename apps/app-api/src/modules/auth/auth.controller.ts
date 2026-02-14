import { Public } from "@goi/nest-kit"
import { Body, Controller, Post, Req } from "@nestjs/common"
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger"
import type { Request } from "express"
import { ZodResponse } from "nestjs-zod"
import { UserResponseDto } from "../user/user.dto"
import { LoginDto, LoginResponseDto, RegisterDto } from "./auth.dto"
import { AuthService } from "./auth.service"

@ApiTags("授权")
@Controller("sys/auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post("login")
  @ApiOperation({ summary: "用户登录" })
  @ZodResponse({ type: LoginResponseDto })
  async login(@Body() body: LoginDto): Promise<LoginResponseDto> {
    return this.authService.login(body.username, body.password)
  }

  @Public()
  @Post("register")
  @ApiOperation({ summary: "用户注册" })
  @ZodResponse({ type: UserResponseDto })
  async register(@Body() body: RegisterDto) {
    return this.authService.register(body)
  }

  @Post("logout")
  @ApiOperation({ summary: "用户登出" })
  @ApiResponse({ type: Boolean })
  async logout(@Req() req: Request): Promise<boolean> {
    const [type, token] = req.headers.authorization?.split(" ") ?? []
    if (type !== "Bearer") return true
    return this.authService.logout(token)
  }
}
