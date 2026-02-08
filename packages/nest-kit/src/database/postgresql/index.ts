import { type Schema as PgSchema, schema as pgSchema } from "@goi/infra"
import { PgModule } from "./postgresql.module"
import { type PgDatabase, PgProvider } from "./postgresql.provider"
import { PgService } from "./postgresql.service"
import { POSTGRESQL_TOKEN } from "./postgresql.tokens"

export { PgModule, PgProvider, PgService, pgSchema, POSTGRESQL_TOKEN }
export type { PgDatabase, PgSchema }
