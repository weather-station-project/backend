import { Injectable } from '@nestjs/common'
import { AirMeasurement, GroundTemperature, Rainfall, WindMeasurement } from '@prisma/client'
import prisma from '../db/prismaClient.db'
import {
  AirMeasurementDto,
  GroundTemperatureDto,
  Grouping,
  RainfallDto,
  WindDirection,
  WindMeasurementDto,
} from '../model/measurements.model'

@Injectable()
export class MeasurementsService {
  async getAirMeasurements(fromDate: Date, toDate: Date): Promise<AirMeasurement[]> {
    return prisma.airMeasurement.findMany({
      where: { dateTime: { gte: fromDate, lte: toDate } },
      orderBy: { dateTime: 'desc' },
    })
  }

  async getGroundTemperatures(fromDate: Date, toDate: Date): Promise<GroundTemperature[]> {
    return prisma.groundTemperature.findMany({
      where: { dateTime: { gte: fromDate, lte: toDate } },
      orderBy: { dateTime: 'desc' },
    })
  }

  async getWindMeasurements(fromDate: Date, toDate: Date): Promise<WindMeasurement[]> {
    return prisma.windMeasurement.findMany({
      where: { dateTime: { gte: fromDate, lte: toDate } },
      orderBy: { dateTime: 'desc' },
    })
  }

  async getRainfalls(fromDate: Date, toDate: Date): Promise<Rainfall[]> {
    return prisma.rainfall.findMany({
      where: { dateTime: { gte: fromDate, lte: toDate } },
      orderBy: { dateTime: 'desc' },
    })
  }

  async addAirMeasurement(airMeasurement: AirMeasurementDto): Promise<void> {
    await prisma.airMeasurement.create({
      data: {
        temperature: airMeasurement.temperature,
        humidity: airMeasurement.humidity,
        pressure: airMeasurement.pressure,
        dateTime: airMeasurement.dateTime,
      },
    })
  }

  async addGroundTemperature(groundTemperature: GroundTemperatureDto): Promise<void> {
    await prisma.groundTemperature.create({
      data: { temperature: groundTemperature.temperature, dateTime: groundTemperature.dateTime },
    })
  }

  async addWindMeasurement(windMeasurement: WindMeasurementDto): Promise<void> {
    await prisma.windMeasurement.create({
      data: { speed: windMeasurement.speed, direction: windMeasurement.direction, dateTime: windMeasurement.dateTime },
    })
  }

  async addRainfall(rainfall: RainfallDto): Promise<void> {
    await prisma.rainfall.create({
      data: { amount: rainfall.amount, dateTime: rainfall.dateTime },
    })
  }

  async getGroupedAirMeasurements(
    measurements: AirMeasurement[],
    grouping: Grouping
  ): Promise<Map<string, AirMeasurementDto[]>> {
    const groupedMeasurements = new Map<string, AirMeasurementDto[]>()

    measurements.forEach((measurement): void => {
      const key: string = this.getGroupingKeyByDate(measurement.dateTime, grouping)
      const groupedMeasurement = groupedMeasurements.get(key) || []

      groupedMeasurement.push({
        dateTime: this.getRoundedDateByGrouping(measurement.dateTime, grouping),
        temperature: measurement.temperature,
        humidity: measurement.humidity,
        pressure: measurement.pressure,
      })

      groupedMeasurements.set(key, groupedMeasurement)
    })

    return groupedMeasurements
  }

  async getGroupedGroundTemperatures(
    measurements: GroundTemperature[],
    grouping: Grouping
  ): Promise<Map<string, GroundTemperatureDto[]>> {
    const groupedMeasurements = new Map<string, GroundTemperatureDto[]>()

    measurements.forEach((measurement): void => {
      const key: string = this.getGroupingKeyByDate(measurement.dateTime, grouping)
      const groupedMeasurement = groupedMeasurements.get(key) || []

      groupedMeasurement.push({
        dateTime: this.getRoundedDateByGrouping(measurement.dateTime, grouping),
        temperature: measurement.temperature,
      })

      groupedMeasurements.set(key, groupedMeasurement)
    })

    return groupedMeasurements
  }

  async getGroupedWindMeasurements(
    measurements: WindMeasurement[],
    grouping: Grouping
  ): Promise<Map<string, WindMeasurementDto[]>> {
    const groupedMeasurements = new Map<string, WindMeasurementDto[]>()

    measurements.forEach((measurement): void => {
      const key: string = this.getGroupingKeyByDate(measurement.dateTime, grouping)
      const groupedMeasurement = groupedMeasurements.get(key) || []

      groupedMeasurement.push({
        dateTime: this.getRoundedDateByGrouping(measurement.dateTime, grouping),
        speed: measurement.speed,
        direction: measurement.direction as WindDirection,
      })

      groupedMeasurements.set(key, groupedMeasurement)
    })

    return groupedMeasurements
  }

  async getGroupedRainfalls(measurements: Rainfall[], grouping: Grouping): Promise<Map<string, RainfallDto[]>> {
    const groupedMeasurements = new Map<string, RainfallDto[]>()

    measurements.forEach((measurement): void => {
      const key: string = this.getGroupingKeyByDate(measurement.dateTime, grouping)
      const groupedMeasurement = groupedMeasurements.get(key) || []

      groupedMeasurement.push({
        dateTime: this.getRoundedDateByGrouping(measurement.dateTime, grouping),
        amount: measurement.amount,
      })

      groupedMeasurements.set(key, groupedMeasurement)
    })

    return groupedMeasurements
  }

  private getGroupingKeyByDate(date: Date, grouping: Grouping): string {
    switch (grouping) {
      case Grouping.Hourly:
        return `${date.toISOString().split('T')[0]}/${date.getHours().toString().padStart(2, '0')}`
      case Grouping.Daily:
        return date.toISOString().split('T')[0]
      case Grouping.Monthly:
        return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`
      default:
        return ''
    }
  }

  private getRoundedDateByGrouping(date: Date, grouping: Grouping): Date {
    switch (grouping) {
      case Grouping.Hourly:
        return new Date(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours())
      case Grouping.Daily:
        return new Date(date.getFullYear(), date.getMonth(), date.getDate())
      case Grouping.Monthly:
        return new Date(date.getFullYear(), date.getMonth())
      default:
        return date
    }
  }
}
