import { Module } from "@nestjs/common"
import { ConfigModule } from "@nestjs/config"
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from "@nestjs/core"
import { AllExceptionsFilter, TransformResponseInterceptor } from "@goi/nest-kit/http"
import { AuthGuard } from "@/common/guards/auth.guard"
import { PgModule } from "@/database/postgresql"
import { RedisModule } from "@/database/redis"
import {
  AuthModule,
  BookMemberModule,
  BookModule,
  ModuleModule,
  PermissionModule,
  RoleModule,
  RolePermissionModule,
  UserModule,
} from "@/modules"

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PgModule,
    RedisModule,
    AuthModule,
    UserModule,
    BookModule,
    BookMemberModule,
    ModuleModule,
    PermissionModule,
    RoleModule,
    RolePermissionModule,
  ],
  controllers: [],
  providers: [
    { provide: APP_GUARD, useClass: AuthGuard },
    { provide: APP_FILTER, useClass: AllExceptionsFilter },
    { provide: APP_INTERCEPTOR, useClass: TransformResponseInterceptor },
  ],
  exports: [],
})
export class AppModule {}
