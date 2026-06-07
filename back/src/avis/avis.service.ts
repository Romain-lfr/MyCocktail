import { Injectable, ConflictException } from '@nestjs/common';
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
}