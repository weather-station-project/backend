import { Length } from 'class-validator'
import { User } from '@prisma/client'

// https://github.com/typestack/class-validator#validation-decorators

export interface IToken {
  access_token: string
}

export interface ITokenPayload {
  sub: string
  user: UserDto
}

export class UserAuthModel {
  @Length(1, 20)
  login: string

  @Length(1, 64)
  password: string
}

export type TUserRole = 'write' | 'read'

export class UserDto {
  login: string
  role: TUserRole

  public static fromEntity(entity: User): UserDto {
    return {
      login: entity.login,
      role: entity.role as TUserRole,
    }
  }
}
