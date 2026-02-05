import { Global, Module } from "@nestjs/common"
import { ConfigModule } from "@nestjs/config"
import { POSTGRESQL_TOKEN } from "@/constants/database.constants"
import { PgProvider } from "./postgresql.provider"
import { PgService } from "./postgresql.service"

@Global()
@Module({
  imports: [ConfigModule],
  providers: [PgProvider, PgService],
  exports: [PgProvider, POSTGRESQL_TOKEN, PgService],
})
export class PgModule {}
