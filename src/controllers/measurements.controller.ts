import { Body, Controller, Get, Logger, Post, Query, UseGuards, VERSION_NEUTRAL } from '@nestjs/common'
import { Roles } from '../decorators/roles.decorator'
import { Role, UserDto } from '../model/auth.model'
import { JwtAuthGuard } from '../guards/jwt-auth.guard'
import { RolesGuard } from '../guards/roles.guard'
import {
  AirMeasurementDto,
  GroundTemperatureDto,
  Grouping,
  IMeasurements,
  MeasurementsRequestModel,
  RainfallDto,
  WindDirection,
  WindMeasurementDto,
} from '../model/measurements.model'
import { UserDecorator } from '../decorators/user.decorator'
import { MeasurementsService } from '../services/measurements.service'
import { AirMeasurement, GroundTemperature, Rainfall, WindMeasurement } from '@prisma/client'

const TRULY_VALUES: string[] = ['true', '1']

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
    const includeSummary = TRULY_VALUES.includes(query.includeSummary.toLowerCase())
    const includeMeasurements = TRULY_VALUES.includes(query.includeMeasurements.toLowerCase())

    this.logger.log(
      `Request getMeasurements by the user '${userFromHeaders.login}' with params: ${JSON.stringify(query)}`
    )

    const [airMeasurements, groundTemperatures, windMeasurements, rainfalls] = await Promise.all([
      this.measurementsService.getAirMeasurements(query.fromDate, query.toDate),
      this.measurementsService.getGroundTemperatures(query.fromDate, query.toDate),
      this.measurementsService.getWindMeasurements(query.fromDate, query.toDate),
      this.measurementsService.getRainfalls(query.fromDate, query.toDate),
    ])

    const result: IMeasurements = {
      airMeasurements: {},
      groundTemperatures: {},
      windMeasurements: {},
      rainfalls: {},
    }

    if (includeMeasurements) {
      await this.fillResultWithMeasurements(result, airMeasurements, groundTemperatures, windMeasurements, rainfalls)
    }

    if (includeSummary) {
      await this.fillResultWithSummary(
        result,
        query.grouping,
        airMeasurements,
        groundTemperatures,
        windMeasurements,
        rainfalls
      )
    }

    return result
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
  @Post('ground-temperature')
  async addGroundTemperature(
    @Body() measurement: GroundTemperatureDto,
    @UserDecorator() userFromHeaders: UserDto
  ): Promise<void> {
    this.logger.log(`Request addGroundTemperature by the user '${userFromHeaders.login}`)
    await this.measurementsService.addGroundTemperature(measurement)
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

  private async fillResultWithMeasurements(
    result: IMeasurements,
    airMeasurements: AirMeasurement[],
    groundTemperatures: GroundTemperature[],
    windMeasurements: WindMeasurement[],
    rainfalls: Rainfall[]
  ): Promise<void> {
    result.airMeasurements.items = airMeasurements.map((record) => {
      return {
        dateTime: record.dateTime,
        temperature: record.temperature,
        humidity: record.humidity,
        pressure: record.pressure,
      }
    })
    result.groundTemperatures.items = groundTemperatures.map((record) => {
      return { dateTime: record.dateTime, temperature: record.temperature }
    })
    result.windMeasurements.items = windMeasurements.map((record) => {
      return { dateTime: record.dateTime, speed: record.speed, direction: record.direction as WindDirection }
    })
    result.rainfalls.items = rainfalls.map((record) => {
      return { dateTime: record.dateTime, amount: record.amount }
    })
  }

  private async fillResultWithSummary(
    result: IMeasurements,
    grouping: Grouping,
    airMeasurements: AirMeasurement[],
    groundTemperatures: GroundTemperature[],
    windMeasurements: WindMeasurement[],
    rainfalls: Rainfall[]
  ): Promise<void> {
    const [groupedAirMeasurements, groupedGroundTemperatures, groupedWindMeasurements, groupedRainfalls] =
      await Promise.all([
        this.measurementsService.getGroupedAirMeasurements(airMeasurements, grouping),
        this.measurementsService.getGroupedGroundTemperatures(groundTemperatures, grouping),
        this.measurementsService.getGroupedWindMeasurements(windMeasurements, grouping),
        this.measurementsService.getGroupedRainfalls(rainfalls, grouping),
      ])

    result.airMeasurements.summary = []
    groupedAirMeasurements.forEach((items: AirMeasurementDto[], key: string): void => {
      const length: number = items.length

      if (length === 0) {
        result.airMeasurements.summary.push({
          key,
          maxTemperature: 0,
          avgTemperature: 0,
          minTemperature: 0,

          maxHumidity: 0,
          avgHumidity: 0,
          minHumidity: 0,

          maxPressure: 0,
          avgPressure: 0,
          minPressure: 0,
        })
      } else {
        result.airMeasurements.summary.push({
          key,
          maxTemperature: Math.max(...items.map((item: AirMeasurementDto): number => item.temperature)),
          avgTemperature: parseFloat(
            (
              items.reduce((acc: number, item: AirMeasurementDto): number => acc + item.temperature, 0) / length
            ).toFixed(1)
          ),
          minTemperature: Math.min(...items.map((item: AirMeasurementDto): number => item.temperature)),

          maxHumidity: Math.max(...items.map((item: AirMeasurementDto): number => item.humidity)),
          avgHumidity: parseFloat(
            (items.reduce((acc: number, item: AirMeasurementDto): number => acc + item.humidity, 0) / length).toFixed(1)
          ),
          minHumidity: Math.min(...items.map((item: AirMeasurementDto): number => item.humidity)),

          maxPressure: Math.max(...items.map((item: AirMeasurementDto): number => item.pressure)),
          avgPressure: parseFloat(
            (items.reduce((acc: number, item: AirMeasurementDto): number => acc + item.pressure, 0) / length).toFixed(1)
          ),
          minPressure: Math.min(...items.map((item: AirMeasurementDto): number => item.pressure)),
        })
      }
    })

    result.groundTemperatures.summary = []
    groupedGroundTemperatures.forEach((items: GroundTemperatureDto[], key: string): void => {
      const length: number = items.length

      if (length === 0) {
        result.groundTemperatures.summary.push({
          key,

          maxTemperature: 0,
          avgTemperature: 0,
          minTemperature: 0,
        })
      } else {
        result.groundTemperatures.summary.push({
          key,

          maxTemperature: Math.max(...items.map((item: GroundTemperatureDto): number => item.temperature)),
          avgTemperature: parseFloat(
            (
              items.reduce((acc: number, item: GroundTemperatureDto): number => acc + item.temperature, 0) / length
            ).toFixed(1)
          ),
          minTemperature: Math.min(...items.map((item: GroundTemperatureDto): number => item.temperature)),
        })
      }
    })

    result.windMeasurements.summary = []
    groupedWindMeasurements.forEach((items: WindMeasurementDto[], key: string): void => {
      const length: number = items.length

      if (length === 0) {
        result.windMeasurements.summary.push({
          key,

          avgSpeed: 0,
          maxGust: 0,
          predominantDirection: WindDirection.UNKNOWN,
        })
      } else {
        const frequencyMap = items.reduce(
          (acc, item) => {
            acc[item.direction] = (acc[item.direction] || 0) + 1
            return acc
          },
          {} as { [key: string]: number }
        )

        result.windMeasurements.summary.push({
          key,

          avgSpeed: parseFloat(
            (items.reduce((acc: number, item: WindMeasurementDto): number => acc + item.speed, 0) / length).toFixed(1)
          ),
          maxGust: Math.max(...items.map((item: WindMeasurementDto): number => item.speed)),
          predominantDirection: Object.keys(frequencyMap).reduce(
            (a: string, b: string): string => (frequencyMap[a] > frequencyMap[b] ? a : b),
            WindDirection.UNKNOWN
          ) as WindDirection,
        })
      }
    })

    result.rainfalls.summary = []
    groupedRainfalls.forEach((items: RainfallDto[], key: string): void => {
      const length: number = items.length

      if (length === 0) {
        result.rainfalls.summary.push({
          key,

          maxAmount: 0,
          avgAmount: 0,
          minAmount: 0,
        })
      } else {
        result.rainfalls.summary.push({
          key,

          maxAmount: Math.max(...items.map((item: RainfallDto): number => item.amount)),
          avgAmount: parseFloat(
            (items.reduce((acc: number, item: RainfallDto): number => acc + item.amount, 0) / length).toFixed(1)
          ),
          minAmount: Math.min(...items.map((item: RainfallDto): number => item.amount)),
        })
      }
    })
  }
}
