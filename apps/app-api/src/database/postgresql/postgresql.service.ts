import { Inject, Injectable } from "@nestjs/common"
import { POSTGRESQL_TOKEN } from "@/constants/database.constants"
import type { PgDatabase } from "./postgresql.provider"

@Injectable()
export class PgService {
  constructor(
    @Inject(POSTGRESQL_TOKEN)
    readonly pdb: PgDatabase,
  ) {}
}
