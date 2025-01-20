import { Logger } from '@nestjs/common'
import { GlobalConfig } from '../src/config/global.config'
import { Prisma } from '@prisma/client'
import prisma from '../src/db/prismaClient.db'
import * as bcrypt from 'bcryptjs'
import { Role } from '../src/model/auth.model'
import { WindDirection } from '../src/model/measurements.model'

const logger: Logger = new Logger('DB Initializer')

/*
 * This data is used locally only for testing purposes.
 */

main()
  .then(async (): Promise<void> => {
    await prisma.$disconnect()
  })
  .catch(async (e): Promise<void> => {
    logger.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })

async function main(): Promise<void> {
  await prisma.$transaction(
    async (tx: Prisma.TransactionClient): Promise<void> => {
      await setUsers(tx)
      await setMeasurements(tx)
    },
    { maxWait: 10000, timeout: 900000 }
  )
}

async function setUsers(tx: Prisma.TransactionClient): Promise<void> {
  const passwordHashed: string = await bcrypt.hash(GlobalConfig.database.password, GlobalConfig.auth.hashSaltRounds)

  await tx.user.create({ data: { login: 'dashboard', password: passwordHashed, role: Role.Read } })
  await tx.user.create({ data: { login: 'sensors', password: passwordHashed, role: Role.Write } })
}

async function setMeasurements(tx: Prisma.TransactionClient): Promise<void> {
  const oneMonthAgo = new Date()
  oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1)

  const intervals: Date[] = getDateIntervals(oneMonthAgo, new Date(), 5)
  for (const interval of intervals) {
    await tx.groundTemperature.create({ data: { dateTime: interval, temperature: getRandomBetween(-5, 40) } })
    await tx.airMeasurement.create({
      data: {
        dateTime: interval,
        temperature: getRandomBetween(-5, 40),
        humidity: getRandomBetween(10, 100),
        pressure: getRandomBetween(900, 1100),
      },
    })
    await tx.windMeasurement.create({
      data: {
        dateTime: interval,
        speed: getRandomBetween(0, 100),
        direction: getRandomEnumValue(WindDirection),
      },
    })
    await tx.rainfall.create({ data: { dateTime: interval, amount: getRandomBetween(0, 100) } })
  }
}

function getDateIntervals(startDate: Date, endDate: Date, intervalMinutes: number): Date[] {
  const intervals: Date[] = []
  const currentDate = new Date(startDate)

  while (currentDate <= endDate) {
    intervals.push(new Date(currentDate))
    currentDate.setMinutes(currentDate.getMinutes() + intervalMinutes)
  }

  return intervals
}

function getRandomBetween(min: number, max: number): number {
  return Math.random() * (max - min) + min
}

function getRandomEnumValue<T>(enumObj: T): T[keyof T] {
  const enumValues = Object.values(enumObj) as T[keyof T][]
  const randomIndex: number = Math.floor(Math.random() * enumValues.length)
  return enumValues[randomIndex]
}
