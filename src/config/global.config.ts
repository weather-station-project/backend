import { Level } from 'pino'
import { Algorithm } from 'jsonwebtoken'

interface IEnvironmentConfig {
  isDevelopment: boolean
  isProduction: boolean
}

interface IServerConfig {
  serverPort: number
}

interface IAuthConfig {
  jwtSecret: string
  jwtExpirationTime: string
  algorithm: Algorithm
  hashSaltRounds: number
}

interface ILogConfig {
  level: Level
}

interface IDatabaseConfig {
  server: string
  name: string
  port: number
  user: string
  password: string
  schema: string
}

export class Config {
  environment: IEnvironmentConfig
  server: IServerConfig
  auth: IAuthConfig
  log: ILogConfig
  database: IDatabaseConfig

  constructor() {
    this.environment = {
      isDevelopment: process.env.NODE_ENV !== 'production',
      isProduction: process.env.NODE_ENV === 'production',
    }
    this.server = {
      serverPort: parseInt(process.env.PORT, 10) || 8080,
    }
    this.auth = {
      jwtSecret: process.env.JWT_SECRET || '123456',
      jwtExpirationTime: process.env.JWT_EXPIRATION_TIME || '1d',
      algorithm: 'HS256',
      hashSaltRounds: 12,
    }
    this.log = { level: (process.env.LOG_LEVEL as Level) || 'debug' }
    this.database = {
      server: process.env.DATABASE_HOST || 'localhost',
      name: process.env.DATABASE_NAME || 'postgres',
      port: parseInt(process.env.DATABASE_PORT, 10) || 5432,
      user: process.env.DATABASE_USER || 'postgres',
      password: process.env.DATABASE_PASSWORD || '123456',
      schema: process.env.DATABASE_SCHEMA,
    }
  }
}

const globalConfigInstance: Config = new Config()
export { globalConfigInstance as GlobalConfig }
