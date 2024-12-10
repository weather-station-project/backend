import { Module } from '@nestjs/common'
import { MeasurementsController } from '../controllers/measurements.controller'
import { MeasurementsService } from '../services/measurements.service'

@Module({ controllers: [MeasurementsController], providers: [MeasurementsService] })
export class MeasurementsModule {}
