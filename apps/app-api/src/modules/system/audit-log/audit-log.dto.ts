import { auditLogListQuerySchema } from "@goi/contracts"
import { createZodDto } from "nestjs-zod"

export class AuditLogListQueryDto extends createZodDto(auditLogListQuerySchema) {}
