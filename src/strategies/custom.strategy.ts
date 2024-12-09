import { PassportStrategy } from '@nestjs/passport'
import { BadRequestException, Injectable, ValidationError } from '@nestjs/common'
import { AuthService } from '../services/auth.service'
import { Strategy } from 'passport-custom'
import { Request } from 'express'
import { validate } from 'class-validator'
import { plainToInstance } from 'class-transformer'
import { UserAuthModel } from '../model/auth.model'

@Injectable()
export class CustomStrategy extends PassportStrategy(Strategy, 'custom') {
  constructor(private readonly authService: AuthService) {
    super()
  }

  async validate(req: Request): Promise<boolean> {
    const validationErrors: ValidationError[] = await validate(plainToInstance(UserAuthModel, req.body))

    if (validationErrors.length > 0) {
      throw new BadRequestException(validationErrors.map((item: ValidationError) => item.constraints))
    }

    return (await this.authService.getUserByLogin(req.body.login)) !== undefined
  }
}
