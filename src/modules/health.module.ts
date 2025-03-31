import { TerminusModule } from '@nestjs/terminus'
import { Module } from '@nestjs/common'
import { HealthController } from '../controllers/health.controller'
import { GlobalConfig } from '../config/global.config'

@Module({
  imports: [
    TerminusModule.forRoot({
      errorLogStyle: 'pretty',
      logger: !GlobalConfig.environment.isProduction,
    }),
  ],
  controllers: [HealthController],
})
export class HealthModule {}
