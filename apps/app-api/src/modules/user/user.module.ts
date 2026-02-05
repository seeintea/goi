import { createUserCoreModule, USER_REPOSITORY, UserCoreModule } from "@goi/shared/user"
import { Module } from "@nestjs/common"
import { UserController } from "./user.controller"
import { DrizzleUserRepository } from "./user.repository"

@Module({
  imports: [
    createUserCoreModule({
      userRepository: { provide: USER_REPOSITORY, useClass: DrizzleUserRepository },
    }),
  ],
  controllers: [UserController],
  providers: [],
  exports: [UserCoreModule],
})
export class UserModule {}
