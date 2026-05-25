import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';


@Injectable()
export class CocktailService {
  constructor(private prisma: PrismaService) {}

  async findAll(alcool?: boolean) {
  return this.prisma.cocktail.findMany({
    where: alcool !== undefined ? { alcool } : {},
    include: {
      image_cocktail: {
        include: {
          image: true,
        },
      },
    },
  });
  }

  async findOne(id: string) {
  return this.prisma.cocktail.findUnique({
    where: { idcocktail: id },
    include: {
      image_cocktail: {
        include: { image: true },
      },
      etape: {
        orderBy: { numeroetape: 'asc' },
        include: {
          etape_ustensile: {
            include: { ustensile: true },
          },
        },
      },
      dosage: {
        include: { ingredient: true },
      },
    },
  });
  }

  async findByNom(nom: string, user?: any) {
  const cocktail = await this.prisma.cocktail.findFirst({
    where: { nomcocktail: { equals: nom, mode: 'insensitive' } },
    include: {
      image_cocktail: { include: { image: true } },
      etape: {
        orderBy: { numeroetape: 'asc' },
        include: { etape_ustensile: { include: { ustensile: true } } },
      },
      dosage: { include: { ingredient: true } },
    },
  });

  if (cocktail?.alcool && (!user || user.estMineur)) {
    throw new ForbiddenException('Accès refusé');
  }

  return cocktail;
}
  
}