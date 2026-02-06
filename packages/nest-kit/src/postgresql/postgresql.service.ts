import { Inject, Injectable } from "@nestjs/common"
import type { PgDatabase } from "./postgresql.provider"
import { POSTGRESQL_TOKEN } from "./postgresql.tokens"

@Injectable()
export class PgService {
  readonly pdb: PgDatabase

  constructor(@Inject(POSTGRESQL_TOKEN) pdb: PgDatabase) {
    this.pdb = pdb
  }

  getDatabase(): PgDatabase {
    return this.pdb
  }
}
