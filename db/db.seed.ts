import { Logger } from '@nestjs/common'
import { prisma } from '../src/db/prismaClient.db'
import { GlobalConfig } from '../src/config/global.config'
import { DeviceLayout, DevicePosition, DeviceType } from '../src/model/models/enums.model'
import {
  ARMCHAIRS_KAT_ID,
  BEDSIDE_TABLES_KAT_ID,
  CHAISE_LONGUES_KAT_ID,
  CHEST_OF_DRAWERS_KAT_ID,
  COFFEE_SIDE_TABLES_KAT_ID,
  DESK_CHAIRS_KAT_ID,
  DESK_COMPUTER_DESKS_KAT_ID,
  DINING_CHAIRS_KAT_ID,
  DINING_TABLES_KAT_ID,
  MIRRORS_KAT_ID,
  OTTOMANS_KAT_ID,
  RUGS_KAT_ID,
  SOFAS_KAT_ID,
} from '../src/utils/ikeaIds.util'
import { Prisma, PrismaClient } from '@prisma/client'
import { DefaultArgs } from '@prisma/client/runtime/library'

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
 * In order to modify the seed data for the cloud environments, you need to touch the .sql file
 * in the pmp-rx-infrastructure repository
 * */

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
    // Stores
    await setStores(tx)

    /* Health check MANDATORY DATA */
    await tx.device.create({
      data: {
        storeNo: '031',
        deviceId: GlobalConfig.health.deviceId,
        type: DeviceType.Manager,
        location: 'health-check',
        position: DevicePosition.Base,
      },
    })

    /* Product Exceptions */
    await setProductExceptions(tx)

    /* Category Exceptions */
    await setCategoyExceptions(tx)

    /* Data for Fuencarral */
    await setDevKiosks(tx, 'ES', '498P2', [
      ARMCHAIRS_KAT_ID,
      COFFEE_SIDE_TABLES_KAT_ID,
      OTTOMANS_KAT_ID,
      CHEST_OF_DRAWERS_KAT_ID,
      SOFAS_KAT_ID,
      CHAISE_LONGUES_KAT_ID,
      DESK_CHAIRS_KAT_ID,
      DESK_COMPUTER_DESKS_KAT_ID,
      BEDSIDE_TABLES_KAT_ID,
      MIRRORS_KAT_ID,
      DINING_CHAIRS_KAT_ID,
      DINING_TABLES_KAT_ID,
    ])

    /* Data for Soroksar */
    await setDevKiosks(tx, 'HU', '507', [
      RUGS_KAT_ID,
      ARMCHAIRS_KAT_ID,
      COFFEE_SIDE_TABLES_KAT_ID,
      OTTOMANS_KAT_ID,
      CHEST_OF_DRAWERS_KAT_ID,
      SOFAS_KAT_ID,
      CHAISE_LONGUES_KAT_ID,
      DESK_CHAIRS_KAT_ID,
      DESK_COMPUTER_DESKS_KAT_ID,
      BEDSIDE_TABLES_KAT_ID,
      MIRRORS_KAT_ID,
      DINING_CHAIRS_KAT_ID,
      DINING_TABLES_KAT_ID,
    ])

    /* Data for Alcorcón */
    await setDevKiosks(tx, 'ES', '031', [RUGS_KAT_ID])

    /* Data for Las Rozas */
    await setDevKiosks(tx, 'ES', '665', [
      ARMCHAIRS_KAT_ID,
      COFFEE_SIDE_TABLES_KAT_ID,
      OTTOMANS_KAT_ID,
      CHEST_OF_DRAWERS_KAT_ID,
      SOFAS_KAT_ID,
      CHAISE_LONGUES_KAT_ID,
      DESK_CHAIRS_KAT_ID,
      DESK_COMPUTER_DESKS_KAT_ID,
      BEDSIDE_TABLES_KAT_ID,
      MIRRORS_KAT_ID,
      DINING_CHAIRS_KAT_ID,
      DINING_TABLES_KAT_ID,
    ])

    /* Data for Reading */
    await setDevKiosks(tx, 'GB', '461', [RUGS_KAT_ID])

    /* Data for Hammersmith */
    await setDevKiosks(tx, 'GB', '642', [
      ARMCHAIRS_KAT_ID,
      COFFEE_SIDE_TABLES_KAT_ID,
      CHEST_OF_DRAWERS_KAT_ID,
      DINING_CHAIRS_KAT_ID,
      DINING_TABLES_KAT_ID,
    ])

    /* Data for Houston */
    await setDevKiosks(tx, 'US', '379', [
      RUGS_KAT_ID,
      ARMCHAIRS_KAT_ID,
      COFFEE_SIDE_TABLES_KAT_ID,
      BEDSIDE_TABLES_KAT_ID,
      DINING_CHAIRS_KAT_ID,
      DINING_TABLES_KAT_ID,
    ])

    /* Data for College park store */
    await setDevKiosks(tx, 'US', '411', [RUGS_KAT_ID])

    /* Data for PaOP Gaithersbur */
    await setDevKiosks(tx, 'US', '716', [
      ARMCHAIRS_KAT_ID,
      COFFEE_SIDE_TABLES_KAT_ID,
      OTTOMANS_KAT_ID,
      CHEST_OF_DRAWERS_KAT_ID,
      SOFAS_KAT_ID,
      CHAISE_LONGUES_KAT_ID,
      DESK_CHAIRS_KAT_ID,
      DESK_COMPUTER_DESKS_KAT_ID,
      BEDSIDE_TABLES_KAT_ID,
      MIRRORS_KAT_ID,
      DINING_CHAIRS_KAT_ID,
      DINING_TABLES_KAT_ID,
    ])

    /* Data for Katy PaOP */
    await setDevKiosks(tx, 'US', '715', [
      ARMCHAIRS_KAT_ID,
      COFFEE_SIDE_TABLES_KAT_ID,
      OTTOMANS_KAT_ID,
      CHEST_OF_DRAWERS_KAT_ID,
      SOFAS_KAT_ID,
      CHAISE_LONGUES_KAT_ID,
      DESK_CHAIRS_KAT_ID,
      DESK_COMPUTER_DESKS_KAT_ID,
      BEDSIDE_TABLES_KAT_ID,
      MIRRORS_KAT_ID,
      DINING_CHAIRS_KAT_ID,
      DINING_TABLES_KAT_ID,
    ])

    /* Data for SFO */
    await setDevKiosks(tx, 'US', '658', [BEDSIDE_TABLES_KAT_ID, DINING_CHAIRS_KAT_ID, DINING_TABLES_KAT_ID])
  })
}

async function setStores(tx: PrismaTransaction): Promise<void> {
  await tx.store.create({ data: { storeNo: '665', marketCode: 'es', name: 'Las Rozas' } })
  await tx.store.create({ data: { storeNo: '031', marketCode: 'es', name: 'IKEA Alcorcón' } })
  await tx.store.create({ data: { storeNo: '498P2', marketCode: 'es', name: 'IKEA Fuencarral' } })

  await tx.store.create({ data: { storeNo: '507', marketCode: 'hu', name: 'Soroksar' } })

  await tx.store.create({ data: { storeNo: '461', marketCode: 'gb', name: 'Reading' } })
  await tx.store.create({ data: { storeNo: '642', marketCode: 'gb', name: 'Hammersmith' } })

  await tx.store.create({ data: { storeNo: '379', marketCode: 'us', name: 'Houston' } })
  await tx.store.create({ data: { storeNo: '411', marketCode: 'us', name: 'College park store' } })
  await tx.store.create({ data: { storeNo: '716', marketCode: 'us', name: 'PaOP Gaithersburg' } })
  await tx.store.create({ data: { storeNo: '715', marketCode: 'us', name: 'Katy PaOP' } })
  await tx.store.create({ data: { storeNo: '658', marketCode: 'us', name: 'San Francisco' } })
}

async function setDevKiosks(
  tx: PrismaTransaction,
  market: string,
  storeNo: string,
  categories: string[]
): Promise<void> {
  /* Range exploration custom devices for testing purposes */
  const manager = await tx.device.create({
    data: {
      storeNo: storeNo,
      deviceId: `UKID.DEV.${market}.${storeNo}.A0`,
      type: DeviceType.Manager,
      location: 'local',
      position: DevicePosition.Base,
    },
  })

  categories.forEach(async (categoryId: string) => {
    await tx.deviceCategory.create({ data: { deviceId: manager.id, ikeaCategoryId: categoryId } })
  })

  await tx.device.create({
    data: {
      storeNo: storeNo,
      deviceId: 'rx-player-75',
      type: DeviceType.Player,
      location: 'local',
      pixelSizeMillimeters: 0.42975,
      minimumSideMarginPixels: 40,
      alignMarginPixels: 120,
      layout: DeviceLayout.Generic,
    },
  })

  await tx.device.create({
    data: {
      storeNo: storeNo,
      deviceId: 'rx-player-85',
      type: DeviceType.Player,
      location: 'local',
      pixelSizeMillimeters: 0.4875,
      minimumSideMarginPixels: 40,
      alignMarginPixels: 120,
      layout: DeviceLayout.Generic,
    },
  })

  await tx.device.create({
    data: {
      storeNo: storeNo,
      deviceId: 'rx-projector',
      type: DeviceType.Player,
      location: 'local',
      pixelSizeMillimeters: 1.875,
      minimumSideMarginPixels: 0,
      alignMarginPixels: 0,
      layout: DeviceLayout.Rugs,
    },
  })
}

async function setProductExceptions(tx: PrismaTransaction): Promise<void> {
  await tx.productExceptions.create({
    data: {
      itemNo: '70576150',
      widthPixels: 3249,
      heightPixels: 4661,
    },
  })
  await tx.productExceptions.create({
    data: {
      itemNo: '40408021',
      widthPixels: 3649,
      heightPixels: 5461,
    },
  })
  await tx.productExceptions.create({
    data: {
      itemNo: '10551077',
      widthPixels: 2512,
      heightPixels: 3508,
    },
  })
  await tx.productExceptions.create({
    data: {
      itemNo: '70507883',
      widthPixels: 2490,
      heightPixels: 3590,
    },
  })
  await tx.productExceptions.create({
    data: {
      itemNo: '50544909',
      hasDarkColors: true,
    },
  })
  await tx.productExceptions.create({
    data: {
      itemNo: '10544906',
      hasDarkColors: true,
    },
  })
  await tx.productExceptions.create({
    data: {
      itemNo: '00537416',
      hasDarkColors: true,
    },
  })
  await tx.productExceptions.create({
    data: {
      itemNo: '30544905',
      hasDarkColors: true,
    },
  })
  await tx.productExceptions.create({
    data: {
      itemNo: '50544914',
      hasDarkColors: true,
    },
  })
  await tx.productExceptions.create({
    data: {
      itemNo: '80544917',
      hasDarkColors: true,
    },
  })
  await tx.productExceptions.create({
    data: {
      itemNo: '90103254',
      hasDarkColors: true,
    },
  })
  await tx.productExceptions.create({
    data: {
      itemNo: '20532979',
      hasDarkColors: true,
    },
  })
  await tx.productExceptions.create({
    data: {
      itemNo: '20532984',
      hasDarkColors: true,
    },
  })
  await tx.productExceptions.create({
    data: {
      itemNo: '50532992',
      hasDarkColors: true,
    },
  })
  await tx.productExceptions.create({
    data: {
      itemNo: '70528890',
      hasDarkColors: true,
    },
  })
  await tx.productExceptions.create({
    data: {
      itemNo: '70528885',
      hasDarkColors: true,
    },
  })
  await tx.productExceptions.create({
    data: {
      itemNo: '30555277',
      rgb: 250,
      hasDarkColors: true,
    },
  })
  await tx.productExceptions.create({
    data: {
      itemNo: '70554389',
      rgb: 250,
      hasDarkColors: true,
    },
  })
  await tx.productExceptions.create({
    data: {
      itemNo: '90392452',
      hasDarkColors: true,
    },
  })
  await tx.productExceptions.create({
    data: {
      itemNo: '00517017',
      hasDarkColors: true,
    },
  })
  await tx.productExceptions.create({
    data: {
      itemNo: '30528892',
      hasDarkColors: true,
    },
  })
  await tx.productExceptions.create({
    data: {
      itemNo: '40203557',
      hasDarkColors: true,
    },
  })
  await tx.productExceptions.create({
    data: {
      itemNo: '30198293',
      hasDarkColors: true,
    },
  })
  await tx.productExceptions.create({
    data: {
      itemNo: '40556016',
      hasDarkColors: true,
    },
  })
  await tx.productExceptions.create({
    data: {
      itemNo: '80556019',
      hasDarkColors: true,
    },
  })
  await tx.productExceptions.create({
    data: {
      itemNo: '60507888',
      hasDarkColors: true,
    },
  })
  await tx.productExceptions.create({
    data: {
      itemNo: '90492574',
      hasDarkColors: true,
    },
  })
  await tx.productExceptions.create({
    data: {
      itemNo: '20471264',
      verticalRatio: 1.07,
    },
  })
  await tx.productExceptions.create({
    data: {
      itemNo: '20564531',
      rgb: 250,
    },
  })
  await tx.productExceptions.create({
    data: {
      itemNo: '20560806',
      rgb: 250,
    },
  })
  await tx.productExceptions.create({
    data: {
      itemNo: '70482137',
      rgb: 250,
    },
  })

  await tx.productExceptions.create({
    data: {
      itemNo: '49513112',
      heightCentimeters: 85,
    },
  })
  await tx.productExceptions.create({
    data: {
      itemNo: '59513102',
      heightCentimeters: 85,
    },
  })
  await tx.productExceptions.create({
    data: {
      itemNo: '19513123',
      heightCentimeters: 85,
    },
  })
  await tx.productExceptions.create({
    data: {
      itemNo: '39513122',
      heightCentimeters: 85,
    },
  })
  await tx.productExceptions.create({
    data: {
      itemNo: '29508220',
      heightCentimeters: 85,
    },
  })
  await tx.productExceptions.create({
    data: {
      itemNo: '99508226',
      heightCentimeters: 85,
    },
  })
  await tx.productExceptions.create({
    data: {
      itemNo: '59508233',
      heightCentimeters: 85,
    },
  })
  await tx.productExceptions.create({
    data: {
      itemNo: '29508239',
      heightCentimeters: 85,
    },
  })

  await tx.productExceptions.create({
    data: {
      itemNo: '79491284',
      heightCentimeters: 67,
    },
  })
  await tx.productExceptions.create({
    data: {
      itemNo: '09491273',
      heightCentimeters: 67,
    },
  })
  await tx.productExceptions.create({
    data: {
      itemNo: '39491276',
      heightCentimeters: 67,
    },
  })
  await tx.productExceptions.create({
    data: {
      itemNo: '39491281',
      heightCentimeters: 67,
    },
  })

  await tx.productExceptions.create({
    data: {
      itemNo: '59516898',
      heightCentimeters: 66,
    },
  })
  await tx.productExceptions.create({
    data: {
      itemNo: '69516893',
      heightCentimeters: 66,
    },
  })
  await tx.productExceptions.create({
    data: {
      itemNo: '49511293',
      heightCentimeters: 66,
    },
  })
  await tx.productExceptions.create({
    data: {
      itemNo: '89516887',
      heightCentimeters: 66,
    },
  })
  await tx.productExceptions.create({
    data: {
      itemNo: '79150751',
      heightCentimeters: 66,
    },
  })
  await tx.productExceptions.create({
    data: {
      itemNo: '29228205',
      heightCentimeters: 66,
    },
  })
  await tx.productExceptions.create({
    data: {
      itemNo: '09399830',
      noRealSize: true,
    },
  })
  await tx.productExceptions.create({
    data: {
      itemNo: '29399829',
      noRealSize: true,
    },
  })
}

async function setCategoyExceptions(tx: PrismaTransaction): Promise<void> {
  await tx.categoryExceptions.create({
    data: {
      categoryId: '16246',
      noRealSize: true,
    },
  })
  await tx.categoryExceptions.create({
    data: {
      categoryId: '31786',
      noRealSize: true,
    },
  })
  await tx.categoryExceptions.create({
    data: {
      categoryId: '57538',
      noRealSize: true,
    },
  })
  await tx.categoryExceptions.create({
    data: {
      categoryId: '700299',
      noRealSize: true,
    },
  })
  await tx.categoryExceptions.create({
    data: {
      categoryId: '20542',
      noRealSize: true,
    },
  })
  await tx.categoryExceptions.create({
    data: {
      categoryId: '25206',
      noRealSize: true,
    },
  })
  await tx.categoryExceptions.create({
    data: {
      categoryId: '10573',
      noRealSize: true,
    },
  })
  await tx.categoryExceptions.create({
    data: {
      categoryId: '700540',
      noRealSize: true,
    },
  })
  await tx.categoryExceptions.create({
    data: {
      categoryId: '700539',
      noRealSize: true,
    },
  })
  await tx.categoryExceptions.create({
    data: {
      categoryId: '55991',
      noRealSize: true,
    },
  })
  await tx.categoryExceptions.create({
    data: {
      categoryId: '55992',
      noRealSize: true,
    },
  })
  await tx.categoryExceptions.create({
    data: {
      categoryId: '55990',
      noRealSize: true,
    },
  })
  await tx.categoryExceptions.create({
    data: {
      categoryId: '47427',
      noRealSize: true,
    },
  })
  await tx.categoryExceptions.create({
    data: {
      categoryId: '47425',
      noRealSize: true,
    },
  })
  await tx.categoryExceptions.create({
    data: {
      categoryId: '11845',
      noRealSize: true,
    },
  })
  await tx.categoryExceptions.create({
    data: {
      categoryId: '11844',
      noRealSize: true,
    },
  })
  await tx.categoryExceptions.create({
    data: {
      categoryId: '10551',
      noRealSize: true,
    },
  })
  await tx.categoryExceptions.create({
    data: {
      categoryId: '46077',
      noRealSize: true,
    },
  })
}
