import { DynamicModule, Global, Module, Provider } from "@nestjs/common"
import { ProtectionRules, SYSTEM_PROTECTION_OPTIONS, SystemProtectionService } from "./system-protection.service"

@Global()
@Module({})
export class SystemProtectionModule {
  static register(rules: ProtectionRules): DynamicModule {
    const providers: Provider[] = [
      {
        provide: SYSTEM_PROTECTION_OPTIONS,
        useValue: rules,
      },
      SystemProtectionService,
    ]

    return {
      module: SystemProtectionModule,
      providers,
      exports: [SystemProtectionService],
    }
  }
}
