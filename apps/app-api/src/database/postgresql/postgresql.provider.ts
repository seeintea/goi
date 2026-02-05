import { Provider } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres"
import { Pool } from "pg"
import { POSTGRESQL_TOKEN } from "@/constants/database.constants"
import { type Schema, schema } from "./schema"

export type PgDatabase = NodePgDatabase<Schema>

export const PgProvider: Provider = {
  provide: POSTGRESQL_TOKEN,
  inject: [ConfigService],
  useFactory: async (configService: ConfigService) => {
    const connectionString = configService.getOrThrow<string>("PG_DATABASE_URL")
    const connection = new Pool({
      connectionString,
    })
    return drizzle(connection, { schema, logger: true }) as PgDatabase
  },
}
