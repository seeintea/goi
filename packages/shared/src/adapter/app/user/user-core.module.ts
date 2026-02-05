import type { DynamicModule, Provider } from "@nestjs/common"
import { Module } from "@nestjs/common"
import { UserService } from "./user.service"

@Module({})
export class UserCoreModule {}

export function createUserCoreModule(options: { userRepository: Provider }): DynamicModule {
  return {
    module: UserCoreModule,
    providers: [options.userRepository, UserService],
    exports: [UserService],
  }
}
