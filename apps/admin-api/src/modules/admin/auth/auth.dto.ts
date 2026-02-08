import { AdminLogin, AdminLoginResponse, adminLoginResponseSchema, adminLoginSchema } from "@goi/contracts"
import { createZodDto } from "nestjs-zod"
import { z } from "zod"

const typedAdminLoginSchema = adminLoginSchema as z.ZodType<AdminLogin>
const typedAdminLoginResponseSchema = adminLoginResponseSchema as z.ZodType<AdminLoginResponse>

export class AdminLoginDto extends createZodDto(typedAdminLoginSchema) {}
export class AdminLoginResponseDto extends createZodDto(typedAdminLoginResponseSchema) {}
