import { createParamDecorator, ExecutionContext } from "@nestjs/common"

export const BookId = createParamDecorator((_: unknown, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest()
  if (typeof request.bookId === "string" && request.bookId.length > 0) return request.bookId
  const queryBookId = request.query?.bookId
  if (typeof queryBookId === "string" && queryBookId.length > 0) return queryBookId
  const bodyBookId = request.body?.bookId
  if (typeof bodyBookId === "string" && bodyBookId.length > 0) return bodyBookId
  const headerBookId = request.headers?.["x-book-id"]
  if (typeof headerBookId === "string" && headerBookId.length > 0) return headerBookId
  return undefined
})
