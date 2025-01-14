import { Body, Controller, Get, Logger, Post, Query, UseGuards, VERSION_NEUTRAL } from '@nestjs/common'
import { Roles } from '../decorators/roles.decorator'
import { Role, UserDto } from '../model/auth.model'
import { JwtAuthGuard } from '../guards/jwt-auth.guard'
import { RolesGuard } from '../guards/roles.guard'
import {
  AirMeasurementDto,
  AmbientTemperatureDto,
  GroundTemperatureDto,
  IMeasurements,
  MeasurementsRequestModel,
  RainfallDto,
  WindDirection,
  WindMeasurementDto,
} from '../model/measurements.model'
import { UserDecorator } from '../decorators/user.decorator'
import { MeasurementsService } from '../services/measurements.service'

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller({ path: 'measurements', version: VERSION_NEUTRAL })
export class MeasurementsController {
  private readonly logger: Logger = new Logger(MeasurementsController.name)

  constructor(private readonly measurementsService: MeasurementsService) {}

  @Roles(Role.Read, Role.Write)
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

  @Roles(Role.Write)
  @Post('ambient-temperature')
  async addAmbientTemperature(
    @Body() measurement: AmbientTemperatureDto,
    @UserDecorator() userFromHeaders: UserDto
  ): Promise<void> {
    this.logger.log(`Request addAmbientTemperature by the user '${userFromHeaders.login}`)
    await this.measurementsService.addAmbientTemperature(measurement)
  }

  @Roles(Role.Write)
  @Post('ground-temperature')
  async addGroundTemperature(
    @Body() measurement: GroundTemperatureDto,
    @UserDecorator() userFromHeaders: UserDto
  ): Promise<void> {
    this.logger.log(`Request addGroundTemperature by the user '${userFromHeaders.login}`)
    await this.measurementsService.addGroundTemperature(measurement)
  }

  @Roles(Role.Write)
  @Post('air-measurement')
  async addAirMeasurement(
    @Body() measurement: AirMeasurementDto,
    @UserDecorator() userFromHeaders: UserDto
  ): Promise<void> {
    this.logger.log(`Request addAirMeasurement by the user '${userFromHeaders.login}`)
    await this.measurementsService.addAirMeasurement(measurement)
  }

  @Roles(Role.Write)
  @Post('wind-measurement')
  async addWindMeasurement(
    @Body() measurement: WindMeasurementDto,
    @UserDecorator() userFromHeaders: UserDto
  ): Promise<void> {
    this.logger.log(`Request addWindMeasurement by the user '${userFromHeaders.login}`)
    await this.measurementsService.addWindMeasurement(measurement)
  }

  @Roles(Role.Write)
  @Post('rainfall')
  async addRainfall(@Body() measurement: RainfallDto, @UserDecorator() userFromHeaders: UserDto): Promise<void> {
    this.logger.log(`Request addRainfall by the user '${userFromHeaders.login}`)
    await this.measurementsService.addRainfall(measurement)
  }
}
