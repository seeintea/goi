import { AuthGuard, NEST_KIT_AUTH_GUARD_OPTIONS, NEST_KIT_AUTHENTICATOR } from "@goi/nest-kit/security"
import { AllExceptionsFilter, TransformResponseInterceptor } from "@goi/nest-kit/transport"
import { Module } from "@nestjs/common"
import { ConfigModule } from "@nestjs/config"
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from "@nestjs/core"
import { AdminAuthenticator } from "@/common/guards/auth.guard"
import { PgModule } from "@/database/postgresql"
import { RedisModule } from "@/database/redis"
import {
  AppModuleModule,
  AppPermissionModule,
  AppRoleModule,
  AppRolePermissionModule,
  AppUserModule,
  AuthModule,
  ModuleModule,
  PermissionModule,
  UserModule,
} from "@/modules"
import { HealthController } from "./health.controller"

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PgModule,
    RedisModule,
    AuthModule,
    UserModule,
    AppUserModule,
    AppModuleModule,
    AppPermissionModule,
    AppRoleModule,
    AppRolePermissionModule,
    ModuleModule,
    PermissionModule,
  ],
  controllers: [HealthController],
  providers: [
    { provide: APP_GUARD, useClass: AuthGuard },
    { provide: NEST_KIT_AUTHENTICATOR, useClass: AdminAuthenticator },
    { provide: NEST_KIT_AUTH_GUARD_OPTIONS, useValue: { allowSwagger: true } },
    { provide: APP_FILTER, useClass: AllExceptionsFilter },
    { provide: APP_INTERCEPTOR, useClass: TransformResponseInterceptor },
  ],
})
export class AppModule {}
