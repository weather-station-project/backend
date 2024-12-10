import { Injectable } from '@nestjs/common'
import { AirMeasurement, AmbientTemperature, GroundTemperature, Rainfall, WindMeasurement } from '@prisma/client'
import prisma from '../db/prismaClient.db'

@Injectable()
export class MeasurementsService {
  async getAmbientTemperatures(fromDate: Date, toDate: Date): Promise<AmbientTemperature[]> {
    return prisma.ambientTemperature.findMany({ where: { dateTime: { gte: fromDate, lte: toDate } } })
  }

  async getGroundTemperatures(fromDate: Date, toDate: Date): Promise<GroundTemperature[]> {
    return prisma.groundTemperature.findMany({ where: { dateTime: { gte: fromDate, lte: toDate } } })
  }

  async getAirMeasurements(fromDate: Date, toDate: Date): Promise<AirMeasurement[]> {
    return prisma.airMeasurement.findMany({ where: { dateTime: { gte: fromDate, lte: toDate } } })
  }

  async getWindMeasurements(fromDate: Date, toDate: Date): Promise<WindMeasurement[]> {
    return prisma.windMeasurement.findMany({ where: { dateTime: { gte: fromDate, lte: toDate } } })
  }

  async getRainfalls(fromDate: Date, toDate: Date): Promise<Rainfall[]> {
    return prisma.rainfall.findMany({ where: { dateTime: { gte: fromDate, lte: toDate } } })
  }
}
