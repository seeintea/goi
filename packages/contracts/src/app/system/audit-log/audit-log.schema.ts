import { z } from "zod"
import { pageQuerySchema, pageResponseSchema } from "../../../common"

export const auditLogSchema = z.object({
  id: z.uuid(),
  userId: z.string().nullable().optional(),
  familyId: z.uuid().nullable().optional(),
  action: z.string(),
  targetEntity: z.string(),
  targetId: z.string(),
  changes: z.any().nullable().optional(),
  ipAddress: z.string().nullable().optional(),
  userAgent: z.string().nullable().optional(),
  createdAt: z.date(),
})

export const auditLogListQuerySchema = pageQuerySchema.extend({
  familyId: z.uuid(),
  userId: z.string().optional(),
  targetEntity: z.string().optional(),
  targetId: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
})

export const auditLogResponseSchema = auditLogSchema
export const auditLogPageResponseSchema = pageResponseSchema(auditLogResponseSchema)

export type AuditLog = z.infer<typeof auditLogSchema>
export type AuditLogListQueryDto = z.infer<typeof auditLogListQuerySchema>
