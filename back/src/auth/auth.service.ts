import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
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

        const estMineur = compte.datenaissance > new Date(
        new Date().setFullYear(new Date().getFullYear() - 18)
        );

        const token = this.jwt.sign({
        sub: compte.idcompte,
        pseudo: compte.pseudo,
        role: compte.role,
        estMineur,
        });

        return { access_token: token, estMineur };
    }
    async register(pseudo: string, mail: string, mdp: string, dateNaissance: string) {
    // Vérif pseudo
    const pseudoExiste = await this.prisma.compte.findUnique({
      where: { pseudo },
    });
    if (pseudoExiste) throw new ConflictException('Ce pseudo est déjà utilisé');

    // Vérif mail
    const mailExiste = await this.prisma.compte.findUnique({
      where: { mailcompte: mail.toLowerCase() },
    });
    if (mailExiste) throw new ConflictException('Cet email est déjà utilisé');

    const compte = await this.prisma.$queryRaw`
      SELECT * FROM inscrire_compte(${pseudo}, ${mail}, ${mdp}, ${dateNaissance}::date)
    `;
    return compte;
  }
}