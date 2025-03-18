import {
  IsBooleanString,
  isDate,
  IsEnum,
  IsNumber,
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
} from 'class-validator'
import { Type } from 'class-transformer'

export enum WindDirection {
  N = 'N',
  NNE = 'N-NE',
  NE = 'N-E',
  ENE = 'E-NE',
  E = 'E',
  ESE = 'E-SE',
  SE = 'S-E',
  SSE = 'S-SE',
  S = 'S',
  SSW = 'S-SW',
  SW = 'S-W',
  WSW = 'W-SW',
  W = 'W',
  WNW = 'W-NW',
  NW = 'N-W',
  NNW = 'N-NW',
  UNKNOWN = '-',
}

export enum Grouping {
  None = '-',
  Hourly = 'hourly',
  Daily = 'daily',
  Monthly = 'monthly',
}

export class MeasurementsRequestModel {
  @IsValidDateInThePast()
  @Type((): DateConstructor => Date)
  fromDate: Date

  @IsValidDateInThePast()
  @Type((): DateConstructor => Date)
  toDate: Date

  @IsEnum(Grouping)
  grouping: Grouping

  @IsBooleanString()
  includeSummary: string

  @IsBooleanString()
  includeMeasurements: string
}

function IsValidDateInThePast(validationOptions?: ValidationOptions) {
  return function (object: NonNullable<unknown>, propertyName: string) {
    registerDecorator({
      name: 'IsValidDate',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: Date): boolean {
          if (!isDate(value)) {
            return false
          }

          return value <= new Date()
        },
        defaultMessage(args: ValidationArguments): string {
          return `${args.property} is not a valid datetime in the past`
        },
      },
    })
  }
}

export interface IMeasurements {
  airMeasurements: IAirMeasurements
  groundTemperatures: IGroundTemperatures
  windMeasurements: IWindMeasurements
  rainfalls: IRainfalls
}

interface ISummaryDto {
  key: string
}

interface IAirMeasurements {
  items?: AirMeasurementDto[]
  summary?: (ISummaryDto & {
    maxTemperature: number
    avgTemperature: number
    minTemperature: number

    maxPressure: number
    avgPressure: number
    minPressure: number

    maxHumidity: number
    avgHumidity: number
    minHumidity: number
  })[]
}

interface IGroundTemperatures {
  items?: GroundTemperatureDto[]
  summary?: (ISummaryDto & {
    maxTemperature: number
    avgTemperature: number
    minTemperature: number
  })[]
}

interface IWindMeasurements {
  items?: WindMeasurementDto[]
  summary?: (ISummaryDto & {
    avgSpeed: number
    maxGust: number
    predominantDirection: WindDirection
  })[]
}

interface IRainfalls {
  items?: RainfallDto[]
  summary?: (ISummaryDto & {
    maxAmount: number
    avgAmount: number
    minAmount: number
  })[]
}

export class MeasurementDto {
  @IsValidDateInThePast()
  @Type(() => Date)
  dateTime: Date
}

export class GroundTemperatureDto extends MeasurementDto {
  @IsNumber({ allowNaN: false, allowInfinity: false, maxDecimalPlaces: 0 })
  temperature: number
}

export class AirMeasurementDto extends MeasurementDto {
  @IsNumber({ allowNaN: false, allowInfinity: false, maxDecimalPlaces: 0 })
  temperature: number

  @IsNumber({ allowNaN: false, allowInfinity: false, maxDecimalPlaces: 0 })
  humidity: number

  @IsNumber({ allowNaN: false, allowInfinity: false, maxDecimalPlaces: 0 })
  pressure: number
}

export class WindMeasurementDto extends MeasurementDto {
  @IsNumber({ allowNaN: false, allowInfinity: false, maxDecimalPlaces: 0 })
  speed: number

  @IsEnum(WindDirection)
  direction: WindDirection
}

export class RainfallDto extends MeasurementDto {
  @IsNumber({ allowNaN: false, allowInfinity: false, maxDecimalPlaces: 0 })
  amount: number
}
