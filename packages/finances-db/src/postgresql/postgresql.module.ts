import { Global, Module } from "@nestjs/common"
import { ConfigModule } from "@nestjs/config"
import { PgProvider } from "./postgresql.provider"
import { PgService } from "./postgresql.service"
import { POSTGRESQL_TOKEN } from "./postgresql.tokens"

@Global()
@Module({
  imports: [ConfigModule],
  providers: [PgProvider, PgService],
  exports: [PgProvider, POSTGRESQL_TOKEN, PgService],
})
export class PgModule {}
