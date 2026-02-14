import { createZodDto } from "nestjs-zod"
import { z } from "zod"
import { CreateUserDto } from "../user/user.dto"

export class RegisterDto extends CreateUserDto {}

const loginSchema = z
  .object({
    username: z.string().min(1).max(30).describe("用户名"),
    password: z.string().min(1).max(100).describe("密码"),
  })
  .meta({ id: "登录请求" })

const loginResponseSchema = z
  .object({
    userId: z.uuid().describe("用户ID"),
    username: z.string().min(1).max(30).describe("用户名"),
    accessToken: z.string().min(1).describe("访问令牌"),
    roleId: z.uuid().nullable().describe("角色ID"),
    roleName: z.string().max(50).nullable().describe("角色名称"),
    familyId: z.uuid().nullable().describe("家庭ID"),
  })
  .meta({ id: "登录响应" })

export class LoginDto extends createZodDto(loginSchema) {}
export class LoginResponseDto extends createZodDto(loginResponseSchema) {}

export type Login = z.infer<typeof loginSchema>
export type LoginResponse = z.infer<typeof loginResponseSchema>
