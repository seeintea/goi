import { Global, Module } from "@nestjs/common"
import { ConfigModule, ConfigService } from "@nestjs/config"
import Redis from "ioredis"
import { REDIS_TOKEN } from "@/constants/database.constants"
import { RedisService } from "./redis.service"

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: REDIS_TOKEN,
      useFactory: (configService: ConfigService) => {
        const connectionString = configService.getOrThrow<string>("REDIS_DATABASE_URL")
        return new Redis(connectionString)
      },
      inject: [ConfigService],
    },
    RedisService,
  ],
  exports: [REDIS_TOKEN, RedisService],
})
export class RedisModule {}
