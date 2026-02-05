import { NestFactory } from "@nestjs/core"
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger"
import { cleanupOpenApiDoc } from "nestjs-zod"
import { AppModule } from "./app.module"

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  app.enableCors({
    origin: "*",
    allowedHeaders: ["Authorization", "content-type", "x-book-id"],
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  })

  app.setGlobalPrefix("api")

  const port = process.env.PORT ?? 3000

  const config = new DocumentBuilder()
    .setTitle("Finances API")
    .setDescription("The Finances API description")
    .setVersion("1.0")
    .build()

  const documentFactory = cleanupOpenApiDoc(SwaggerModule.createDocument(app, config))
  SwaggerModule.setup("swagger", app, documentFactory, {
    jsonDocumentUrl: "swagger/json",
  })

  await app.listen(port)
  console.log(`server on: http://localhost:${port}`)
  console.log(`swagger on: http://localhost:${port}/swagger`)
  console.log(`json document on: http://localhost:${port}/swagger/json`)
}
bootstrap()
