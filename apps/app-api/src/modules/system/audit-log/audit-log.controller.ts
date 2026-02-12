import { Controller, Get, Query } from "@nestjs/common"
import { ApiTags } from "@nestjs/swagger"
import { AuditLogListQueryDto } from "./audit-log.dto"
import { AuditLogService } from "./audit-log.service"

@ApiTags("System - Audit Log")
@Controller("system/audit-logs")
export class AuditLogController {
  constructor(private readonly auditLogService: AuditLogService) {}

  @Get()
  async findAll(@Query() query: AuditLogListQueryDto) {
    return this.auditLogService.findAll(query)
  }
}
