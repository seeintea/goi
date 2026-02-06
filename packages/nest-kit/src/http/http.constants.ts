export enum ErrorStatusEnum {
  SUCCESS = 200,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  VALIDATION_ERROR = 422,
  INTERNAL_ERROR = 500,
  EXPECTED_ERROR = 1001,
}

export const ErrorMsgReflect = {
  [ErrorStatusEnum.SUCCESS]: "",
  [ErrorStatusEnum.UNAUTHORIZED]: "未授权，请先登录",
  [ErrorStatusEnum.FORBIDDEN]: "拒绝访问",
  [ErrorStatusEnum.NOT_FOUND]: "资源不存在",
  [ErrorStatusEnum.VALIDATION_ERROR]: "参数校验错误",
  [ErrorStatusEnum.INTERNAL_ERROR]: "未知错误，请稍后重试",
  [ErrorStatusEnum.EXPECTED_ERROR]: "服务繁忙，请稍后重试",
}
