import {
  AllExceptionsFilter,
  AuthGuard,
  NEST_KIT_AUTH_GUARD_OPTIONS,
  NEST_KIT_AUTHENTICATOR,
  SystemProtectionModule,
  TransformResponseInterceptor,
} from "@goi/nest-kit"
import { Module } from "@nestjs/common"
import { ConfigModule } from "@nestjs/config"
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from "@nestjs/core"
import { AdminAuthenticator } from "@/common/guards/auth.guard"
import { ADMIN_PROTECTION_RULES } from "@/config/protection.config"
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

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    SystemProtectionModule.register(ADMIN_PROTECTION_RULES),
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
  controllers: [],
  providers: [
    { provide: APP_GUARD, useClass: AuthGuard },
    { provide: NEST_KIT_AUTHENTICATOR, useClass: AdminAuthenticator },
    { provide: NEST_KIT_AUTH_GUARD_OPTIONS, useValue: { allowSwagger: true } },
    { provide: APP_FILTER, useClass: AllExceptionsFilter },
    { provide: APP_INTERCEPTOR, useClass: TransformResponseInterceptor },
  ],
})
export class AppModule {}
