import "reflect-metadata"
import { NestFactory } from "@nestjs/core"
import { AppModule } from "./app.module"

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  app.enableCors({
    origin: "*",
    allowedHeaders: ["Authorization", "content-type"],
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  })

  app.setGlobalPrefix("api")

  const port = process.env.PORT ?? 3001
  await app.listen(port)
  console.log(`server on: http://localhost:${port}`)
}

bootstrap()
