import { Logger } from '@nestjs/common'
import { GlobalConfig } from '../src/config/global.config'
import { Prisma } from '@prisma/client'
import prisma from '../src/db/prismaClient.db'
import * as bcrypt from 'bcrypt'
import { Role } from '../src/model/auth.model'

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
  await prisma.$transaction(async (tx: Prisma.TransactionClient): Promise<void> => {
    await setUsers(tx)
  })
}

async function setUsers(tx: Prisma.TransactionClient): Promise<void> {
  const passwordHashed: string = await bcrypt.hash('123456', GlobalConfig.auth.hashSaltRounds)

  await tx.user.create({ data: { login: 'dashboard', password: passwordHashed, role: Role.Read } })
  await tx.user.create({ data: { login: 'sensors', password: passwordHashed, role: Role.Write } })
}
