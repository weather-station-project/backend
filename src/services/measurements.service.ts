import { Injectable } from '@nestjs/common'
import { AirMeasurement, AmbientTemperature, GroundTemperature, Rainfall, WindMeasurement } from '@prisma/client'
import prisma from '../db/prismaClient.db'
import {
  AirMeasurementDto,
  AmbientTemperatureDto,
  GroundTemperatureDto,
  RainfallDto,
  WindMeasurementDto,
} from '../model/measurements.model'

@Injectable()
export class MeasurementsService {
  async getAmbientTemperatures(fromDate: Date, toDate: Date): Promise<AmbientTemperature[]> {
    return prisma.ambientTemperature.findMany({
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

  async getAirMeasurements(fromDate: Date, toDate: Date): Promise<AirMeasurement[]> {
    return prisma.airMeasurement.findMany({
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

  async addAmbientTemperature(ambientTemperature: AmbientTemperatureDto): Promise<void> {
    await prisma.ambientTemperature.create({
      data: { temperature: ambientTemperature.temperature, dateTime: ambientTemperature.dateTime },
    })
  }

  async addGroundTemperature(groundTemperature: GroundTemperatureDto): Promise<void> {
    await prisma.groundTemperature.create({
      data: { temperature: groundTemperature.temperature, dateTime: groundTemperature.dateTime },
    })
  }

  async addAirMeasurement(airMeasurement: AirMeasurementDto): Promise<void> {
    await prisma.airMeasurement.create({
      data: { humidity: airMeasurement.humidity, pressure: airMeasurement.pressure, dateTime: airMeasurement.dateTime },
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
}
