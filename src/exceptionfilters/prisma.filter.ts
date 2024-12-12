import {
  PrismaClientKnownRequestError,
  PrismaClientUnknownRequestError,
  PrismaClientValidationError,
} from '@prisma/client/runtime/library'
import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus } from '@nestjs/common'
import { HttpAdapterHost } from '@nestjs/core'
import {
  FOREIGN_KEY_VIOLATED_ERROR_CODE,
  RECORD_NOT_FOUND_ERROR_CODE,
  UNIQUE_KEY_DUPLICATED_ERROR_CODE,
} from '../db/prismaClient.db'

@Catch(PrismaClientKnownRequestError)
export class PrismaClientKnownRequestErrorExceptionFilter implements ExceptionFilter {
  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: PrismaClientKnownRequestError, host: ArgumentsHost): void {
    const { httpAdapter } = this.httpAdapterHost
    const ctx = host.switchToHttp()
    let httpStatus: HttpStatus = HttpStatus.BAD_REQUEST

    if (exception.code === RECORD_NOT_FOUND_ERROR_CODE) {
      httpStatus = HttpStatus.NOT_FOUND
    } else if (
      exception.code === UNIQUE_KEY_DUPLICATED_ERROR_CODE ||
      exception.code === FOREIGN_KEY_VIOLATED_ERROR_CODE
    ) {
      httpStatus = HttpStatus.CONFLICT
    }

    const responseBody = {
      statusCode: httpStatus,
      error: exception.message,
    }

    httpAdapter.reply(ctx.getResponse(), responseBody, httpStatus)
  }
}

@Catch(PrismaClientValidationError)
export class PrismaClientValidationErrorExceptionFilter implements ExceptionFilter {
  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: PrismaClientValidationError, host: ArgumentsHost): void {
    const { httpAdapter } = this.httpAdapterHost
    const ctx = host.switchToHttp()

    const responseBody = {
      statusCode: HttpStatus.BAD_REQUEST,
      error: exception.message,
    }

    httpAdapter.reply(ctx.getResponse(), responseBody, HttpStatus.BAD_REQUEST)
  }
}

@Catch(PrismaClientUnknownRequestError)
export class PrismaClientUnknownRequestErrorExceptionFilter implements ExceptionFilter {
  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: PrismaClientValidationError, host: ArgumentsHost): void {
    const { httpAdapter } = this.httpAdapterHost
    const ctx = host.switchToHttp()

    const responseBody = {
      statusCode: HttpStatus.BAD_REQUEST,
      error: exception.message,
    }

    httpAdapter.reply(ctx.getResponse(), responseBody, HttpStatus.BAD_REQUEST)
  }
}
