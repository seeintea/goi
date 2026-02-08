import { createRedisClient, type RedisClient } from "@goi/infra"
import type { Provider } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import { REDIS_TOKEN } from "./redis.tokens"

export type { RedisClient }

export const RedisProvider: Provider = {
  provide: REDIS_TOKEN,
  inject: [ConfigService],
  useFactory: async (configService: ConfigService) => {
    const connectionString = configService.getOrThrow<string>("REDIS_DATABASE_URL")
    return createRedisClient(connectionString)
  },
}
