import { PrismaClient } from '@prisma/client'
import { GlobalConfig } from '../config/global.config'

// https://www.prisma.io/docs/orm/reference/error-reference#error-codes
export const RECORD_NOT_FOUND_ERROR_CODE = 'P2025'
export const UNIQUE_KEY_DUPLICATED_ERROR_CODE = 'P2002'
export const FOREIGN_KEY_VIOLATED_ERROR_CODE = 'P2003'

const charsToReplace: Map<string, string> = new Map<string, string>([
  [':', '%3A'],
  ['/', '%2F'],
  ['?', '%3F'],
  ['#', '%23'],
  ['[', '%5B'],
  [']', '%5D'],
  ['@', '%40'],
  ['!', '%21'],
  ['$', '%24'],
  ['&', '%26'],
  ["'", '%27'],
  ['(', '%28'],
  [')', '%29'],
  ['*', '%2A'],
  ['+', '%2B'],
  [',', '%2C'],
  [';', '%3B'],
  ['=', '%3D'],
  ['%', '%25'],
  [' ', '%20'],
])

function prismaEncodeChars(text: string): string {
  const encodedString: string[] = []

  for (const char of text) {
    if (charsToReplace.has(char)) {
      encodedString.push(charsToReplace.get(char))
    } else {
      encodedString.push(char)
    }
  }

  return encodedString.join('')
}

const defaultLogLevels: string[] = ['error', 'warn']

const prismaClientSingleton = () => {
  return new PrismaClient({
    log: GlobalConfig.log.level === 'debug' ? [...defaultLogLevels, 'query', 'info'] : defaultLogLevels,
    errorFormat: GlobalConfig.environment.isProduction ? 'minimal' : 'colorless',
    datasources: {
      db: {
        url: [
          'postgresql://',
          prismaEncodeChars(GlobalConfig.database.user),
          ':',
          prismaEncodeChars(GlobalConfig.database.password),
          '@',
          prismaEncodeChars(GlobalConfig.database.server),
          ':',
          GlobalConfig.database.port,
          '/',
          prismaEncodeChars(GlobalConfig.database.name),
          GlobalConfig.database.schema ? `?schema=${prismaEncodeChars(GlobalConfig.database.schema)}` : '',
        ].join(''),
      },
    },
  })
}

declare const globalThis: {
  prismaGlobal: ReturnType<typeof prismaClientSingleton>
} & typeof global

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton()

export default prisma

if (!GlobalConfig.environment.isProduction) globalThis.prismaGlobal = prisma
