import type { PgDatabase } from "@goi/nest-kit"
import { POSTGRESQL_TOKEN } from "@goi/nest-kit"

export type { PgDatabase, PgSchema } from "@goi/nest-kit"
export { PgModule, PgProvider, PgService, POSTGRESQL_TOKEN, pgSchema } from "@goi/nest-kit"

// Alias for compatibility with app-api modules
export const DATABASE_CONNECTION = POSTGRESQL_TOKEN
export type DbType = PgDatabase
