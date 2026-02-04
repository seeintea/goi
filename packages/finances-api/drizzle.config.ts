import { defineConfig } from "drizzle-kit"

export default defineConfig({
  schema: "../finances-db/src/postgresql/schema/**.entity.ts",
  out: "./src/database/postgresql/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.PG_DATABASE_URL!,
  },
})
