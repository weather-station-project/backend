import { HttpAdapterHost, NestFactory } from '@nestjs/core'
import { AppModule } from './modules/app.module'
import { ValidationPipe, VERSION_NEUTRAL, VersioningType } from '@nestjs/common'
import compression from 'compression'
import * as zlib from 'zlib'
import {
  PrismaClientKnownRequestErrorExceptionFilter,
  PrismaClientUnknownRequestErrorExceptionFilter,
  PrismaClientValidationErrorExceptionFilter,
} from './exceptionfilters/prisma.filter'
import { Logger, LoggerErrorInterceptor } from 'nestjs-pino'
import { GlobalConfig } from './config/global.config'

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  })

  app
    .enableVersioning({
      type: VersioningType.MEDIA_TYPE,
      key: 'version=',
      defaultVersion: VERSION_NEUTRAL,
    })
    .useGlobalPipes(
      new ValidationPipe({
        transform: true,
      })
    )
    .use(
      compression({
        level: zlib.constants.Z_BEST_COMPRESSION,
        threshold: 0,
      })
    )
    .enableShutdownHooks()
    .useGlobalFilters(new PrismaClientKnownRequestErrorExceptionFilter(app.get(HttpAdapterHost)))
    .useGlobalFilters(new PrismaClientValidationErrorExceptionFilter(app.get(HttpAdapterHost)))
    .useGlobalFilters(new PrismaClientUnknownRequestErrorExceptionFilter(app.get(HttpAdapterHost)))
    .useGlobalInterceptors(new LoggerErrorInterceptor())
    .useLogger(app.get(Logger))

  if (GlobalConfig.environment.isDevelopment) {
    app.enableCors()
  } else {
    app.enableCors({
      origin: [],
    })
  }

  await app.listen(GlobalConfig.server.serverPort)
}

bootstrap()
