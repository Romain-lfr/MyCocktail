import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { getJwtSecret } from '../jwt-secret';
import type { PayloadJwt, UtilisateurConnecte } from '../utilisateur';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: getJwtSecret(),
    });
  }

  validate(payload: PayloadJwt): UtilisateurConnecte {
    return {
      idcompte: payload.sub,
      pseudo: payload.pseudo,
      role: payload.role,
      estMineur: payload.estMineur,
    };
  }
}
