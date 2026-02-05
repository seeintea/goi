import { defineConfig } from "drizzle-kit"

export default defineConfig({
  schema: "./src/infra/db/postgresql/schema/**/**.entity.ts",
  out: "./src/infra/db/postgresql/schema/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.PG_DATABASE_URL ?? "",
  },
})
