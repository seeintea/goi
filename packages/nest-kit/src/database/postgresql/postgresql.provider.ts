import { createPgDatabase, type PgDatabase } from "@goi/infra"
import type { Provider } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import { POSTGRESQL_TOKEN } from "./postgresql.tokens"

export type { PgDatabase }

export const PgProvider: Provider = {
  provide: POSTGRESQL_TOKEN,
  inject: [ConfigService],
  useFactory: async (configService: ConfigService) => {
    const connectionString = configService.getOrThrow<string>("PG_DATABASE_URL")
    return createPgDatabase(connectionString)
  },
}
