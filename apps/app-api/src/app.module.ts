import {
  AllExceptionsFilter,
  AuthGuard,
  NEST_KIT_AUTH_GUARD_OPTIONS,
  NEST_KIT_AUTHENTICATOR,
  NEST_KIT_AUTHORIZER,
  SystemProtectionModule,
  TransformResponseInterceptor,
} from "@goi/nest-kit"
import { SHARED_ROLE_PROTECTION } from "@goi/rules"
import { Module } from "@nestjs/common"
import { ConfigModule } from "@nestjs/config"
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from "@nestjs/core"
import { AppAuthenticator, FinanceAuthorizer } from "@/common/guards/auth.guard"
import { PgModule } from "@/database/postgresql"
import { RedisModule } from "@/database/redis"
import {
  AccountModule,
  AuditLogModule,
  AuthModule,
  BudgetModule,
  CategoryModule,
  FamilyMemberModule,
  FamilyModule,
  ModuleModule,
  PermissionModule,
  RoleModule,
  RolePermissionModule,
  TagModule,
  TransactionModule,
  UserModule,
} from "@/modules"

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    SystemProtectionModule.register({ role: SHARED_ROLE_PROTECTION }),
    PgModule,
    RedisModule,
    AuthModule,
    UserModule,
    FamilyModule,
    FamilyMemberModule,
    AccountModule,
    CategoryModule,
    TransactionModule,
    TagModule,
    BudgetModule,
    ModuleModule,
    PermissionModule,
    RoleModule,
    RolePermissionModule,
    AuditLogModule,
  ],
  controllers: [],
  providers: [
    { provide: APP_GUARD, useClass: AuthGuard },
    { provide: NEST_KIT_AUTHENTICATOR, useClass: AppAuthenticator },
    { provide: NEST_KIT_AUTHORIZER, useClass: FinanceAuthorizer },
    { provide: NEST_KIT_AUTH_GUARD_OPTIONS, useValue: { allowSwagger: true } },
    { provide: APP_FILTER, useClass: AllExceptionsFilter },
    { provide: APP_INTERCEPTOR, useClass: TransformResponseInterceptor },
  ],
  exports: [],
})
export class AppModule {}
