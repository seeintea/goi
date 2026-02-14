import {
  Login,
  loginResponseSchema,
  loginSchema,
  Register,
  registerSchema,
} from "@goi/contracts"
import { createZodDto } from "nestjs-zod"
import { z } from "zod"

export class RegisterDto extends createZodDto(registerSchema as z.ZodType<Register>) {}

export class LoginDto extends createZodDto(loginSchema as z.ZodType<Login>) {}
export class LoginResponseDto extends createZodDto(loginResponseSchema) {}
