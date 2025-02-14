import { TerminusModule } from '@nestjs/terminus'
import { Module } from '@nestjs/common'
import { HealthController } from '../controllers/health.controller'

@Module({
  imports: [
    TerminusModule.forRoot({
      errorLogStyle: 'pretty',
      logger: true,
    }),
  ],
  controllers: [HealthController],
})
export class HealthModule {}
