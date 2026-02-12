import { z } from "zod"
import { pageQuerySchema } from "../../../common"

export const auditLogSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().optional(),
  familyId: z.string().uuid().optional(),
  action: z.string(),
  targetEntity: z.string(),
  targetId: z.string(),
  changes: z.any().optional(),
  ipAddress: z.string().optional(),
  userAgent: z.string().optional(),
  createdAt: z.date(),
})

export const auditLogListQuerySchema = pageQuerySchema.extend({
  familyId: z.string().uuid(),
  userId: z.string().optional(),
  targetEntity: z.string().optional(),
  targetId: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
})

export type AuditLog = z.infer<typeof auditLogSchema>
export type AuditLogListQueryDto = z.infer<typeof auditLogListQuerySchema>
