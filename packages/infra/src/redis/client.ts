import Redis from "ioredis"

export type RedisClient = {
  set: (key: string, value: string, ...args: Array<string | number>) => Promise<unknown>
  get: (key: string) => Promise<string | null>
  del: (...keys: string[]) => Promise<number>
  exists: (...keys: string[]) => Promise<number>
  quit: () => Promise<unknown>
}

export function createRedisClient(connectionString: string): RedisClient {
  return new Redis(connectionString) as unknown as RedisClient
}
