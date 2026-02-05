import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from "@nestjs/common"
import { map, Observable } from "rxjs"
import type { ApiResponse } from "@/types/response"

@Injectable()
export class TransformResponseInterceptor implements NestInterceptor {
  intercept<T>(_: ExecutionContext, next: CallHandler): Observable<ApiResponse<T>> {
    return next.handle().pipe(
      map(
        (data): ApiResponse<T> => ({
          code: 200,
          message: "success",
          data,
        }),
      ),
    )
  }
}
