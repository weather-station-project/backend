import { Injectable, Logger, OnApplicationBootstrap, OnApplicationShutdown } from '@nestjs/common'
import { GlobalConfig } from '../config/global.config'

const logger: Logger = new Logger('LifeCycleLogging')

@Injectable()
export class onApplicationBootstrapLogging implements OnApplicationBootstrap {
  onApplicationBootstrap(): void {
    logger.log(`Server ready on PORT ${GlobalConfig.server.serverPort}`)
  }
}

@Injectable()
export class onApplicationShutdownLogging implements OnApplicationShutdown {
  onApplicationShutdown(signal?: string): void {
    logger.log(`Application shutdown with signal '${signal}'`)
  }
}
