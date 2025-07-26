import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // Thêm prefix cho tất cả routes
  app.setGlobalPrefix('api');
  await app.listen(process.env.PORT ?? 8080);
}
bootstrap();
