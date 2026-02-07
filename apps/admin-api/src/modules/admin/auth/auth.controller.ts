import { Public } from "@goi/nest-kit/security"
import { Body, Controller, Post, Req } from "@nestjs/common"
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger"
import type { Request } from "express"
import { ZodResponse } from "nestjs-zod"
import { AdminLoginDto, AdminLoginResponseDto } from "./auth.dto"
import { AuthService } from "./auth.service"

@ApiTags("授权")
@Controller("admin/auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post("login")
  @ApiOperation({ summary: "管理员登录" })
  @ZodResponse({ type: AdminLoginResponseDto })
  async login(@Body() body: AdminLoginDto): Promise<AdminLoginResponseDto> {
    return this.authService.login(body.username, body.password)
  }

  @Post("logout")
  @ApiOperation({ summary: "管理员登出" })
  @ApiResponse({ type: Boolean })
  async logout(@Req() req: Request): Promise<boolean> {
    const [type, token] = req.headers.authorization?.split(" ") ?? []
    if (type !== "Bearer") return true
    return this.authService.logout(token)
  }
}
