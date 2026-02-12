import { auditLogListQuerySchema, auditLogPageResponseSchema } from "@goi/contracts"
import { createZodDto } from "nestjs-zod"

export class AuditLogListQueryDto extends createZodDto(auditLogListQuerySchema) {}
export class AuditLogPageResponseDto extends createZodDto(auditLogPageResponseSchema) {}
