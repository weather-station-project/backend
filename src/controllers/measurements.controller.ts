import { Controller, Get, Logger, Query, UseGuards, VERSION_NEUTRAL } from '@nestjs/common'
import { Roles } from '../decorators/roles.decorator'
import { Role, UserDto } from '../model/auth.model'
import { JwtAuthGuard } from '../guards/jwt-auth.guard'
import { RolesGuard } from '../guards/roles.guard'
import { IMeasurements, MeasurementsRequestModel, WindDirection } from '../model/measurements.model'
import { UserDecorator } from '../decorators/user.decorator'
import { MeasurementsService } from '../services/measurements.service'

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller({ path: 'measurements', version: VERSION_NEUTRAL })
export class MeasurementsController {
  private readonly logger: Logger = new Logger(MeasurementsController.name)

  constructor(private readonly measurementsService: MeasurementsService) {}

  @Roles(Role.Read)
  @Get()
  async getMeasurements(
    @Query() query: MeasurementsRequestModel,
    @UserDecorator() userFromHeaders: UserDto
  ): Promise<IMeasurements> {
    this.logger.log(
      `Request getMeasurements by the user '${userFromHeaders.login}' from date '${query.fromDate}' to date '${query.toDate}'`
    )

    const [ambientTemperatures, groundTemperatures, airMeasurements, windMeasurements, rainfalls] = await Promise.all([
      this.measurementsService.getAmbientTemperatures(query.fromDate, query.toDate),
      this.measurementsService.getGroundTemperatures(query.fromDate, query.toDate),
      this.measurementsService.getAirMeasurements(query.fromDate, query.toDate),
      this.measurementsService.getWindMeasurements(query.fromDate, query.toDate),
      this.measurementsService.getRainfalls(query.fromDate, query.toDate),
    ])

    return {
      ambientTemperatures: ambientTemperatures.map((record) => {
        return { dateTime: record.dateTime, temperature: record.temperature }
      }),
      groundTemperatures: groundTemperatures.map((record) => {
        return { dateTime: record.dateTime, temperature: record.temperature }
      }),
      airMeasurements: airMeasurements.map((record) => {
        return { dateTime: record.dateTime, humidity: record.humidity, pressure: record.pressure }
      }),
      windMeasurements: windMeasurements.map((record) => {
        return { dateTime: record.dateTime, speed: record.speed, direction: record.direction as WindDirection }
      }),
      rainfalls: rainfalls.map((record) => {
        return { dateTime: record.dateTime, amount: record.amount }
      }),
    }
  }
}
