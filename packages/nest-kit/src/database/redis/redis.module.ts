import { Global, Module } from "@nestjs/common"
import { ConfigModule } from "@nestjs/config"
import { RedisProvider } from "./redis.provider"
import { RedisService } from "./redis.service"
import { REDIS_TOKEN } from "./redis.tokens"

@Global()
@Module({
  imports: [ConfigModule],
  providers: [RedisProvider, RedisService],
  exports: [RedisProvider, REDIS_TOKEN, RedisService],
})
export class RedisModule {}
