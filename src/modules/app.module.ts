import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { onApplicationBootstrapLogging, onApplicationShutdownLogging } from '../utils/lifeCycleLogging.util'
import { GlobalConfig } from '../config/global.config'
import { LoggerModule } from 'nestjs-pino'
import { v4 as uuidv4 } from 'uuid'
import { ReqId } from 'pino-http'
import { IncomingMessage, ServerResponse } from 'http'
import pino from 'pino'
import { RequestIdStorage } from '../utils/requestStorage.util'
import LogFn = pino.LogFn
import { AuthModule } from './auth.module'
import { HealthModule } from './health.module'

interface ILogBinding {
  context: string
  err?: Error
}

// Help about pino -> https://github.com/pinojs/pino/blob/HEAD/docs/api.md
@Module({
  imports: [
    LoggerModule.forRoot({
      pinoHttp: {
        autoLogging: false,
        base: undefined,
        level: GlobalConfig.log.level,
        timestamp: !GlobalConfig.environment.isProduction,
        customProps: (request: IncomingMessage) => ({
          correlationId: request.id,
        }),
        hooks: {
          logMethod(args: Parameters<LogFn>, method: LogFn): void {
            const bindings: ILogBinding = args[0] as unknown as ILogBinding
            const requestId: string = RequestIdStorage.get()
            const text: string = args.length >= 2 ? args[args.length - 1] : bindings.err.message // Message always comes in the last place of the arguments

            let message: string
            if (requestId) {
              message = `[${bindings.context}] [${requestId}] - ${text}`
            } else {
              message = `[${bindings.context}] - ${text}`
            }

            return method.apply(this, [bindings, message])
          },
        },
        customAttributeKeys: { req: 'httpRequest', res: 'httpResponse' },
        transport: GlobalConfig.environment.isProduction
          ? undefined
          : {
              target: 'pino-pretty',
              options: {
                singleLine: true,
                colorize: true,
              },
            },
        genReqId: (request: IncomingMessage, response: ServerResponse<IncomingMessage>): ReqId => {
          let id: ReqId = request.id ?? request.headers['x-request-id']
          if (!id) {
            id = uuidv4()
          }

          response.setHeader('X-Request-ID', id as string)
          RequestIdStorage.set(id)

          return id
        },
      },
    }),
    ConfigModule.forRoot({ cache: true, isGlobal: true }),
    AuthModule,
    HealthModule,
  ],
  providers: [onApplicationBootstrapLogging, onApplicationShutdownLogging],
})
export class AppModule {}
