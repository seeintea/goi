import { Permission } from "@goi/nest-kit"
import { Controller, Get, Query } from "@nestjs/common"
import { ApiOperation, ApiTags } from "@nestjs/swagger"
import { ZodResponse } from "nestjs-zod"
import { AuditLogListQueryDto, AuditLogPageResponseDto } from "./audit-log.dto"
import { AuditLogService } from "./audit-log.service"

@ApiTags("系统 - 审计日志")
@Controller("system/audit-logs")
export class AuditLogController {
  constructor(private readonly auditLogService: AuditLogService) {}

  @Get("list")
  @Permission("sys:audit-log:read")
  @ApiOperation({ summary: "查询审计日志列表" })
  @ZodResponse({ type: AuditLogPageResponseDto })
  async list(@Query() query: AuditLogListQueryDto) {
    return this.auditLogService.list(query)
  }
}
