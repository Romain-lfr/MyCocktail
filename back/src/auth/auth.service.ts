import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
  ) {}

  async login(pseudo: string, mdp: string) {
    const compte = await this.prisma.compte.findUnique({
      where: { pseudo },
    });

    if (!compte) throw new UnauthorizedException('Compte introuvable');

    const mdpValide = await bcrypt.compare(mdp, compte.mdpcompte);
    if (!mdpValide) throw new UnauthorizedException('Mot de passe incorrect');

    const token = this.jwt.sign({
      sub: compte.idcompte,
      pseudo: compte.pseudo,
      role: compte.role,
    });

    return { access_token: token };
  }
}