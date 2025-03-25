import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // API 경로 prefix 설정
  app.setGlobalPrefix("api");

  // CORS 활성화
  app.enableCors({
    origin: "http://localhost:3000",
    credentials: true,
  });

  // ValidationPipe 활성화
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  await app.listen(3001);
}
void bootstrap();
