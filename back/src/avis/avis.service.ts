import { Injectable, ConflictException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAvisDto } from './dto/create-avis.dto';

@Injectable()
export class AvisService {
  constructor(private prisma: PrismaService) {}

  async ajouterAvis(idcocktail: string, idcompte: string, data: CreateAvisDto) {
    try {
      const result = await this.prisma.$queryRaw<any[]>`
        SELECT * FROM ajouter_avis(
          ${idcocktail}::varchar,
          ${idcompte}::varchar,
          ${data.noteavis}::int,
          ${data.titreavis}::varchar,
          ${data.descriptionavis}::text
        )
      `;
      return result[0];
    } catch (e: any) {
      if (e?.meta?.message?.includes('already exists')) {
        throw new ConflictException('Vous avez déjà laissé un avis pour ce cocktail');
      }
      if (e?.meta?.message?.includes('ne peut pas noter son propre cocktail')) {
        throw new ConflictException('Vous ne pouvez pas noter votre propre cocktail');
      }
      throw e;
    }
  }

  async modifierAvis(idavis: string, idcompte: string, data: CreateAvisDto) {
    const avis = await this.prisma.avis.findUnique({ where: { idavis } });
    if (!avis) throw new Error('Avis introuvable');
    if (avis.idcompte !== idcompte) throw new Error('Non autorisé');

    return this.prisma.avis.update({
      where: { idavis },
      data: {
        noteavis: data.noteavis,
        titreavis: data.titreavis,
        descriptionavis: data.descriptionavis,
      },
    });
  }

  async supprimerAvis(idavis: string, idcompte: string) {
    const avis = await this.prisma.avis.findUnique({ where: { idavis } });
    if (!avis) throw new Error('Avis introuvable');
    if (avis.idcompte !== idcompte) throw new Error('Non autorisé');

    return this.prisma.avis.delete({ where: { idavis } });
  }

  async ajouterReponse(idavis: string, idcompte: string, commentaire: string, idreponse_parent?: string) {
    const parent = idreponse_parent || null;

    // Vérif : on ne peut pas répondre à sa propre réponse
    if (parent) {
      const reponseParent = await this.prisma.reponse.findUnique({ where: { idreponse: parent } });
      if (reponseParent?.idcompte === idcompte) {
        throw new ForbiddenException('Impossible de répondre à sa propre réponse');
      }
    }

    try {
      const result = await this.prisma.$queryRaw<any[]>`
        SELECT * FROM ajouter_reponse(
          ${idavis}::varchar,
          ${idcompte}::varchar,
          ${commentaire}::text,
          ${parent}::varchar
        )
      `;
      return result[0];
    } catch (e: any) {
      if (e?.meta?.message?.includes('chk_reponse_self')) {
        throw new ForbiddenException('Impossible de répondre à sa propre réponse');
      }
      throw e;
    }
  }

  async modifierReponse(idreponse: string, idcompte: string, commentaire: string) {
    const reponse = await this.prisma.reponse.findUnique({ where: { idreponse } });
    if (!reponse) throw new Error('Réponse introuvable');
    if (reponse.idcompte !== idcompte) throw new Error('Non autorisé');
    return this.prisma.reponse.update({
      where: { idreponse },
      data: { commentaire },
    });
  }

  async supprimerReponse(idreponse: string, idcompte: string) {
    const reponse = await this.prisma.reponse.findUnique({ where: { idreponse } });
    if (!reponse) throw new Error('Réponse introuvable');
    if (reponse.idcompte !== idcompte) throw new Error('Non autorisé');
    return this.prisma.reponse.delete({ where: { idreponse } });
  }
}