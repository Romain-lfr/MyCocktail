import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { Throttle } from '@nestjs/throttler';
import { LIMITE_AUTH } from '../securite';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Throttle(LIMITE_AUTH)
  @Post('login')
  login(@Body() body: LoginDto) {
    return this.authService.login(body.pseudoOrMail, body.mdp);
  }

  @Throttle(LIMITE_AUTH)
  @Post('register')
  register(@Body() body: RegisterDto) {
    return this.authService.register(
      body.pseudo,
      body.mail,
      body.mdp,
      body.dateNaissance,
    );
  }
}
