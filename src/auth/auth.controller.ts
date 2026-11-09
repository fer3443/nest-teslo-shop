import { Controller, Get, Post, Body, UseGuards, Req, SetMetadata } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto, LoginUserDto } from './dto';
import { AuthGuard } from '@nestjs/passport';
import { User } from './entities/user.entity';
import { Auth, GetUser, RawHeaders, RoleProtected } from './decorators';
import { UserRoleGuard } from './guards/user-role/user-role.guard';
import { ValidRoles } from './interfaces';
import { ApiResponse, ApiTags } from '@nestjs/swagger';

const tokenSchema = {
  type: 'object',
  properties: {
    token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' }
  }
} as const;

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('register')
  @ApiResponse({
    status: 201,
    description: 'User was registered',
    schema: {
      type: 'object',
      properties: {
        email: { type: 'string', example: 'user@example.com' },
        fullName: { type: 'string', example: 'John Doe' },
        token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' }
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Bad request. Invalid body or email already registered' })
  registerUser(@Body() createUserDto: CreateUserDto) {
    return this.authService.create(createUserDto);
  }

  @Post('login')
  @ApiResponse({ status: 201, description: 'Login successful, JWT returned', schema: tokenSchema })
  @ApiResponse({ status: 400, description: 'Bad request. Invalid body' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  loginUser(@Body() loginUserDto: LoginUserDto) {
    return this.authService.login(loginUserDto);
  }

  @Get('check-auth-status')
  @Auth()
  @ApiResponse({ status: 200, description: 'Token is valid, a renewed JWT is returned', schema: tokenSchema })
  @ApiResponse({ status: 401, description: 'Unauthorized. Missing, invalid or expired token' })
  checkAuthStatus(
    @GetUser() user:User
  ){
    return this.authService.checkAuthStatus(user);
  }

  @Get('private')
  @UseGuards(AuthGuard())
  @ApiResponse({ status: 200, description: 'Authenticated user, email and raw headers' })
  @ApiResponse({ status: 401, description: 'Unauthorized. Missing, invalid or expired token' })
  testingPrivateRoute(
    @GetUser() user: User,
    @GetUser('email') userEmail: string,
    @RawHeaders() rawHeaders: string[]
  ) {
    return { ok: true, message: 'Hola mundo private', user, userEmail, rawHeaders }
  }

  // @SetMetadata('roles', ['admin', 'super-user']) esto se usa en el decorador RoleProtected directamente
  @Get('private2')
  @RoleProtected(ValidRoles.superUser, ValidRoles.user)
  @UseGuards(AuthGuard(), UserRoleGuard)
  @ApiResponse({ status: 200, description: 'Authenticated user', type: User })
  @ApiResponse({ status: 401, description: 'Unauthorized. Missing, invalid or expired token' })
  @ApiResponse({ status: 403, description: 'Forbidden. User lacks a required role' })
  testingPrivateRoute2(
    @GetUser() user:User
  ){
    return user
  }

  @Get('private3')
  @Auth(ValidRoles.user)
  @ApiResponse({ status: 200, description: 'Authenticated user', type: User })
  @ApiResponse({ status: 401, description: 'Unauthorized. Missing, invalid or expired token' })
  @ApiResponse({ status: 403, description: 'Forbidden. User lacks a required role' })
  testingPrivateRoute3(
    @GetUser() user:User
  ){
    return user
  }

}
