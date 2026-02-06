import type { NodePgDatabase } from "drizzle-orm/node-postgres"
import { drizzle } from "drizzle-orm/node-postgres"
import { Pool } from "pg"
import type { Schema } from "./schema"
import { schema } from "./schema"

export type PgDatabase = NodePgDatabase<Schema>

export function createPgDatabase(connectionString: string): PgDatabase {
  const connection = new Pool({
    connectionString,
  })
  return drizzle(connection, { schema, logger: true }) as PgDatabase
}
