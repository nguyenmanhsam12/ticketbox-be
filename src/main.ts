import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import helmet from 'helmet';
import * as cookieParser from 'cookie-parser';
import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import { HttpExceptionFilter } from './common/filter-exceptions/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(helmet());
  app.use(cookieParser())
  app.enableCors({ origin: true, credentials: true });

  app.useGlobalPipes(new ValidationPipe({ 
    whitelist: true, 
    forbidUnknownValues: false, 
    transform: true,
    transformOptions: { enableImplicitConversion: true }
  }))
  app.useGlobalFilters(new HttpExceptionFilter());


  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
