import { HttpException, HttpStatus } from "@nestjs/common"
import { ErrorStatusEnum } from "@/constants/response.constants"

export class BusinessException extends HttpException {
  private errorCode: number

  constructor(message: string, code: number = ErrorStatusEnum.EXPECTED_ERROR, status: HttpStatus = HttpStatus.OK) {
    super(message, status)
    this.errorCode = code
  }

  getErrorCode(): number {
    return this.errorCode
  }
}
