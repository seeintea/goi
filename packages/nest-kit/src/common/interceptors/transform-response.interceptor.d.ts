import { CallHandler, ExecutionContext, NestInterceptor } from "@nestjs/common";
import { Observable } from "rxjs";
import type { ApiResponse } from "../../types/response";
export declare class TransformResponseInterceptor implements NestInterceptor {
    intercept<T>(_: ExecutionContext, next: CallHandler): Observable<ApiResponse<T>>;
}
//# sourceMappingURL=transform-response.interceptor.d.ts.map