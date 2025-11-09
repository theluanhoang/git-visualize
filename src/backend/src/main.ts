import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe, VersioningType } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });
  const configService = app.get(ConfigService);

  // Global prefix
  const globalPrefix = configService.get<string>('app.globalPrefix') ?? 'api';
  app.setGlobalPrefix(globalPrefix);

  // Global validation
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
    transformOptions: { enableImplicitConversion: true },
  }));

  // API versioning
  app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });

  // Swagger
  if (configService.get<boolean>('swagger.enabled') !== false) {
    const docConfig = new DocumentBuilder()
      .setTitle(configService.get<string>('swagger.title') ?? 'API')
      .setDescription(configService.get<string>('swagger.description') ?? 'API docs')
      .setVersion(configService.get<string>('swagger.version') ?? '1.0')
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, docConfig);
    const swaggerPath = configService.get<string>('swagger.path') ?? 'docs';
    SwaggerModule.setup(swaggerPath, app, document);
  }

  const port = configService.get<number>('app.port') ?? 8000;
  await app.listen(port, () => {
    console.log(`Git Visualized Backend is running on http://localhost:${port}`);
  });
}

bootstrap();
