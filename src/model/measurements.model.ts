import { isDate, registerDecorator, ValidationArguments, ValidationOptions } from 'class-validator'
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
}

export class MeasurementsRequestModel {
  @IsValidDateInThePast()
  @Type(() => Date)
  fromDate: Date

  @IsValidDateInThePast()
  @Type(() => Date)
  toDate: Date
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

          return value < new Date()
        },
        defaultMessage(args: ValidationArguments): string {
          return `${args.property} is not a valid datetime in the past`
        },
      },
    })
  }
}

export interface IMeasurements {
  ambientTemperatures: IAmbientTemperature[]
  groundTemperatures: IGroundTemperature[]
  airMeasurements: IAirMeasurement[]
  windMeasurements: IWindMeasurement[]
  rainfalls: IRainfall[]
}

interface IMeasurement {
  dateTime: Date
}

export interface IAmbientTemperature extends IMeasurement {
  temperature: number
}

export interface IGroundTemperature extends IMeasurement {
  temperature: number
}

export interface IAirMeasurement extends IMeasurement {
  humidity: number
  pressure: number
}

export interface IWindMeasurement extends IMeasurement {
  speed: number
  direction: WindDirection
}

export interface IRainfall extends IMeasurement {
  amount: number
}
