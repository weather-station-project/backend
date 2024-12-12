import {
  Body,
  Controller,
  HttpCode,
  HttpException,
  HttpStatus,
  Logger,
  Post,
  UseGuards,
  VERSION_NEUTRAL,
} from '@nestjs/common'
import { AuthService } from '../services/auth.service'
import { CustomAuthGuard } from '../guards/custom-auth.guard'
import { IToken, UserAuthRequestModel, UserDto } from '../model/auth.model'
import * as bcrypt from 'bcrypt'

@Controller({ path: 'auth', version: VERSION_NEUTRAL })
export class AuthController {
  private readonly logger: Logger = new Logger(AuthController.name)

  constructor(private readonly authService: AuthService) {}

  @UseGuards(CustomAuthGuard)
  @Post()
  @HttpCode(200)
  async userAuth(@Body() body: UserAuthRequestModel): Promise<IToken> {
    this.logger.log(`Request userAuth with user '${body.login}'`)

    const entity = await this.authService.getUserByLogin(body.login)

    if (!entity) {
      throw new HttpException(`User with the login '${body.login}' not found`, HttpStatus.NOT_FOUND)
    }

    if (!(await bcrypt.compare(body.password, entity.password))) {
      throw new HttpException(`User with the login '${body.login}' not authorized`, HttpStatus.UNAUTHORIZED)
    }

    return this.authService.auth(UserDto.fromEntity(entity))
  }
}
