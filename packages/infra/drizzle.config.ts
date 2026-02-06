import { defineConfig } from "drizzle-kit"

export default defineConfig({
  schema: "./src/postgresql/schema/**/**.entity.ts",
  out: "./src/postgresql/schema/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.PG_DATABASE_URL ?? "",
  },
})
