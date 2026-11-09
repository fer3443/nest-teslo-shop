import { BadRequestException, Injectable, InternalServerErrorException, Logger, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt'
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto, LoginUserDto } from './dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { JwtService } from '@nestjs/jwt';


@Injectable()
export class AuthService {
  private readonly logger = new Logger();
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService
  ) { }
  async create(createUserDto: CreateUserDto) {
    try {
      const { password, ...rest } = createUserDto;
      const user = this.userRepository.create({
        ...rest,
        password: bcrypt.hashSync(password, 10)
      });
      await this.userRepository.save(user)
      return {
        ...rest,
        token: this.getJwtToken({ id: user.id })
      }
    } catch (error) {
      this.handleDBErrors(error)
    }
  }

  async login(loginUserDto: LoginUserDto) {
    const { email, password } = loginUserDto;
    const user = await this.userRepository.findOne({
      where: { email },
      select: { email: true, password: true, id: true }
    })
    if (!user)
      throw new UnauthorizedException('Credenciales inválidas');
    if (!bcrypt.compareSync(password, user.password))
      throw new UnauthorizedException('Credenciales invalidess')
    return {
      token: this.getJwtToken({ id: user.id })
    }
  }

  private getJwtToken(payload: JwtPayload) {
    const token = this.jwtService.sign(payload);
    return token
  }

  async checkAuthStatus(user: User) {
    return {
      token: this.getJwtToken({ id: user.id })
    }
  }

  private handleDBErrors(error: unknown): never {
    if (error instanceof QueryFailedError) {
      const driverError = error.driverError as { code?: string; detail?: string }
      if (driverError.code === '23505') {
        throw new BadRequestException(driverError.detail)
      }
      if (driverError.code === '23503') {
        throw new BadRequestException(driverError.detail)
      }
    }
    this.logger.error('Error inesperado revise los logs')
    throw new InternalServerErrorException('Please check server logs')
  }
}
