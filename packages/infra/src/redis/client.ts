import { createClient, type RedisClientType } from "redis"

export type RedisClient = RedisClientType

export async function createRedisClient(connectionString: string): Promise<RedisClient> {
  const client = createClient({ url: connectionString })
  await client.connect()
  return client as RedisClient
}
