import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  login(@Body() body: LoginDto) {
    return this.authService.login(body.pseudo, body.mdp);
  }

  @Post('register')
  register(@Body() body: RegisterDto) {
    return this.authService.register(body.pseudo, body.mail, body.mdp, body.dateNaissance);
  }
}