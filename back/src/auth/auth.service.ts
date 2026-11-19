import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';

import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
  ) {}

  async login(pseudoOrMail: string, mdp: string) {
    const compte = await this.prisma.compte.findFirst({
      where: {
        OR: [
          { pseudo: { equals: pseudoOrMail, mode: 'insensitive' } },
          { mailcompte: pseudoOrMail.toLowerCase() },
        ],
      },
    });

    // Même message dans les deux cas : on ne révèle pas si le compte existe
    const mdpValide = compte
      ? await bcrypt.compare(mdp, compte.mdpcompte)
      : false;
    if (!compte || !mdpValide)
      throw new UnauthorizedException('Identifiants incorrects');

    const estMineur =
      compte.datenaissance >
      new Date(new Date().setFullYear(new Date().getFullYear() - 18));

    const token = this.jwt.sign({
      sub: compte.idcompte,
      pseudo: compte.pseudo,
      role: compte.role,
      estMineur,
    });

    return { access_token: token, estMineur };
  }

  async register(
    pseudo: string,
    mail: string,
    mdp: string,
    dateNaissance: string,
  ) {
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
