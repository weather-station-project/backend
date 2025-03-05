import { HealthCheck, HealthCheckResult, HealthCheckService, PrismaHealthIndicator } from '@nestjs/terminus'
import { Controller, Get, VERSION_NEUTRAL } from '@nestjs/common'
import prisma from '../db/prismaClient.db'

@Controller({ path: 'health', version: VERSION_NEUTRAL })
export class HealthController {
  constructor(
    private readonly prismaHealthIndicator: PrismaHealthIndicator,
    private readonly healthCheckService: HealthCheckService
  ) {}

  @Get()
  @HealthCheck()
  async check(): Promise<HealthCheckResult> {
    return this.healthCheckService.check([
      () => this.prismaHealthIndicator.pingCheck('databaseAccessAvailable', prisma),
    ])
  }
}
