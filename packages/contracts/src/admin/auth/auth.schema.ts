import { z } from "zod"

export const adminLoginSchema = z
  .object({
    username: z.string().min(1).max(30).describe("管理员用户名"),
    password: z.string().min(1).max(100).describe("密码"),
  })
  .meta({ id: "管理员登录请求" })

export const adminLoginResponseSchema = z
  .object({
    userId: z.uuid().describe("管理员用户ID"),
    username: z.string().min(1).max(30).describe("管理员用户名"),
    accessToken: z.string().min(1).describe("访问令牌"),
  })
  .meta({ id: "管理员登录响应" })

export type AdminLogin = z.infer<typeof adminLoginSchema>
export type AdminLoginResponse = z.infer<typeof adminLoginResponseSchema>
