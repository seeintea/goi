import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Logger } from "@nestjs/common"
import { Response } from "express"
import { BusinessException } from "@/common/exceptions/business.exception"
import { ErrorMsgReflect, ErrorStatusEnum } from "@/constants/response.constants"
import type { ApiResponse } from "@/types/response"

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name)

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse<Response>()

    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR
    let businessCode: number = ErrorStatusEnum.INTERNAL_ERROR
    let message = ErrorMsgReflect[businessCode]

    if (exception instanceof BusinessException) {
      statusCode = exception.getStatus()
      businessCode = exception.getErrorCode()
      message = exception.message
    } else if (exception instanceof HttpException) {
      statusCode = exception.getStatus()
      businessCode = statusCode

      const httpResponse = exception.getResponse()
      this.logger.error(httpResponse)

      message = ErrorMsgReflect[businessCode] || ErrorMsgReflect[ErrorStatusEnum.INTERNAL_ERROR]
    } else if (exception instanceof Error) {
      message = exception.message
      this.logger.error(exception.message, exception.stack)
    }

    const errorResponse: ApiResponse<null> = {
      code: businessCode,
      message: message,
      data: null,
    }

    response.status(statusCode).json(errorResponse)
  }
}
