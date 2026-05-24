import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  login(@Body() body: { pseudo: string; mdp: string }) {
    return this.authService.login(body.pseudo, body.mdp);
  }
}