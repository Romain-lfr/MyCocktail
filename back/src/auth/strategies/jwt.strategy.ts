import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: 'secret_mycocktail',
    });
  }

  async validate(payload: any) {
    return {
      idcompte: payload.sub,
      pseudo: payload.pseudo,
      role: payload.role,
      estMineur: payload.estMineur,
    };
  }
}