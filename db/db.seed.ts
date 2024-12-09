import { Logger } from '@nestjs/common'
import { GlobalConfig } from '../src/config/global.config'
import { Prisma, PrismaClient } from '@prisma/client'
import { DefaultArgs } from '@prisma/client/runtime/library'
import prisma from '../src/db/prismaClient.db'
import * as bcrypt from 'bcrypt'

const logger: Logger = new Logger('DB Initializer')
type PrismaTransaction = Omit<
  PrismaClient<
    Prisma.PrismaClientOptions,
    'log' extends keyof T
      ? T['log'] extends Array<Prisma.LogLevel | Prisma.LogDefinition>
        ? Prisma.GetEvents<T['log']>
        : never
      : never,
    DefaultArgs
  >,
  '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'
>

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
  await prisma.$transaction(async (tx: PrismaTransaction): Promise<void> => {
    await setUsers(tx)
})}

async function setUsers(tx: PrismaTransaction): Promise<void> {
  const passwordHashed: string = await bcrypt.hash('123456', GlobalConfig.auth.hashSaltRounds)

  await tx.user.create({ data: { login:'dashboard', password: passwordHashed, role:'read' } })
  await tx.user.create({ data: { login:'sensors', password: passwordHashed, role:'write' } })
}
