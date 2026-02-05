import { Inject, Injectable } from "@nestjs/common"
import Redis from "ioredis"
import { REDIS_TOKEN } from "@/constants/database.constants"

@Injectable()
export class RedisService {
  constructor(@Inject(REDIS_TOKEN) private readonly redis: Redis) {}

  async set(key: string, value: string, ttl?: number): Promise<void> {
    if (ttl) {
      await this.redis.set(key, value, "EX", ttl)
    } else {
      await this.redis.set(key, value)
    }
  }

  async get(key: string): Promise<string | null> {
    return this.redis.get(key)
  }

  async del(key: string): Promise<void> {
    await this.redis.del(key)
  }

  async exists(key: string): Promise<boolean> {
    const result = await this.redis.exists(key)
    return result === 1
  }
}
