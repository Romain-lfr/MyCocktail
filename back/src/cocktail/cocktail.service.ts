import {
  Injectable,
  ForbiddenException,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCocktailDto } from './dto/create-cocktail.dto';
import { CreateEtapeDto } from './dto/create-etape.dto';
import { CreateDosageDto } from './dto/create-dosage.dto';
import { CreateUstensileDto } from './dto/create-ustensile.dto';
import { StatutEnum, UpdateCocktailDto } from './dto/update-cocktail.dto';
import type { UtilisateurConnecte } from '../auth/utilisateur';

// Statuts qui rendent le cocktail « publié » (public ou privé) : au moins une étape obligatoire
const STATUTS_PUBLIES: StatutEnum[] = [StatutEnum.publie, StatutEnum.prive];

@Injectable()
export class CocktailService {
  constructor(private prisma: PrismaService) {}

  // Vérifie que le cocktail existe et appartient au compte connecté
  async verifierAuteur(idcocktail: string, idcompte: string) {
    const cocktail = await this.prisma.cocktail.findUnique({
      where: { idcocktail },
    });
    if (!cocktail) throw new NotFoundException('Cocktail introuvable');
    if (cocktail.idcompte !== idcompte)
      throw new ForbiddenException('Non autorisé');
    return cocktail;
  }

  // Vérifie que l'étape existe et que son cocktail appartient au compte connecté
  private async verifierAuteurEtape(idetape: string, idcompte: string) {
    const etape = await this.prisma.etape.findUnique({
      where: { idetape },
      include: { cocktail: true },
    });
    if (!etape) throw new NotFoundException('Etape introuvable');
    if (etape.cocktail.idcompte !== idcompte)
      throw new ForbiddenException('Non autorisé');
    return etape;
  }

  async findAll(
    alcool?: boolean,
    recherche?: string,
    ingredients?: string[],
    ustensiles?: string[],
  ) {
    return this.prisma.cocktail.findMany({
      where: {
        statut: 'publi_',
        ...(alcool !== undefined ? { alcool } : {}),
        ...(recherche
          ? { nomcocktail: { contains: recherche, mode: 'insensitive' } }
          : {}),
        ...(ingredients && ingredients.length > 0
          ? {
              AND: ingredients.map((idingredient) => ({
                dosage: { some: { idingredient } },
              })),
            }
          : {}),
        ...(ustensiles && ustensiles.length > 0
          ? {
              AND: [
                ...(ingredients && ingredients.length > 0
                  ? ingredients.map((idingredient) => ({
                      dosage: { some: { idingredient } },
                    }))
                  : []),
                ...ustensiles.map((idustensile) => ({
                  etape: {
                    some: {
                      etape_ustensile: { some: { idustensile } },
                    },
                  },
                })),
              ],
            }
          : {}),
      },
      include: {
        image: true,
        avis: { select: { noteavis: true } },
      },
    });
  }

  async findByNom(nom: string, user?: UtilisateurConnecte | null) {
    const cocktail = await this.prisma.cocktail.findFirst({
      where: { nomcocktail: { equals: nom, mode: 'insensitive' } },
      include: {
        image: true,
        etape: {
          orderBy: { numeroetape: 'asc' },
          include: {
            etape_ustensile: { include: { ustensile: true } },
            dosage: { include: { ingredient: true } },
          },
        },
        dosage: { include: { ingredient: true } },
        avis: {
          include: {
            compte: { select: { pseudo: true } },
            reponse: {
              include: { compte: { select: { pseudo: true } } },
            },
          },
          orderBy: { dateavis: 'desc' },
        },
      },
    });

    // Brouillon / privé / archivé : visible uniquement par son auteur
    if (
      cocktail &&
      cocktail.statut !== 'publi_' &&
      cocktail.idcompte !== user?.idcompte
    ) {
      throw new NotFoundException('Cocktail introuvable');
    }

    if (cocktail?.alcool && (!user || user.estMineur)) {
      throw new ForbiddenException('Accès refusé');
    }

    return cocktail;
  }

  async create(data: CreateCocktailDto, idcompte: string, estMineur: boolean) {
    if (data.alcool && estMineur) {
      throw new ForbiddenException(
        'Les mineurs ne peuvent pas créer de cocktails alcoolisés',
      );
    }
    const result = await this.prisma.$queryRaw<Record<string, unknown>[]>`
      SELECT * FROM ajouter_cocktail(
        ${data.nomcocktail}::varchar,
        ${data.description}::text,
        ${data.duree}::int,
        ${idcompte}::varchar,
        ${data.difficulte}::difficulte_enum,
        ${data.alcool}::boolean,
        'brouillon'::statut_enum
      )
    `;
    return result[0];
  }

  async modifier(
    idcocktail: string,
    data: UpdateCocktailDto,
    idcompte: string,
    estMineur: boolean,
  ) {
    const cocktail = await this.prisma.cocktail.findUnique({
      where: { idcocktail },
    });
    if (!cocktail) throw new Error('Cocktail introuvable');
    if (cocktail.idcompte !== idcompte) throw new Error('Non autorisé');
    if (data.alcool && estMineur)
      throw new ForbiddenException(
        'Les mineurs ne peuvent pas créer de cocktails alcoolisés',
      );

    // Repasser en « sans alcool » est interdit tant qu'il reste un ingrédient alcoolisé
    if (!data.alcool) {
      const nbAlcool = await this.prisma.dosage.count({
        where: { idcocktail, ingredient: { categorie: 'alcool' } },
      });
      if (nbAlcool > 0) {
        throw new ConflictException(
          "Retire d'abord les ingrédients alcoolisés avant de passer le cocktail en sans alcool",
        );
      }
    }

    // Publier (en public ou en privé) exige au moins une étape
    if (data.statut && STATUTS_PUBLIES.includes(data.statut)) {
      const nbEtapes = await this.prisma.etape.count({ where: { idcocktail } });
      if (nbEtapes === 0) {
        throw new ConflictException(
          'Ajoute au moins une étape avant de publier le cocktail',
        );
      }
    }

    return this.prisma.cocktail.update({
      where: { idcocktail },
      data: {
        nomcocktail: data.nomcocktail,
        description: data.description,
        difficulte: data.difficulte,
        alcool: data.alcool,
        duree: data.duree,
        ...(data.statut ? { statut: data.statut } : {}),
      },
    });
  }

  async supprimer(idcocktail: string, idcompte: string) {
    const cocktail = await this.prisma.cocktail.findUnique({
      where: { idcocktail },
    });

    if (!cocktail) throw new Error('Cocktail introuvable');
    if (cocktail.idcompte !== idcompte) throw new Error('Non autorisé');

    return this.prisma.cocktail.delete({
      where: { idcocktail },
    });
  }

  async addEtape(idcocktail: string, data: CreateEtapeDto, idcompte: string) {
    await this.verifierAuteur(idcocktail, idcompte);
    const result = await this.prisma.$queryRaw<Record<string, unknown>[]>`
      SELECT * FROM ajouter_etape_cocktail(${idcocktail}, ${data.descriptionetape})
    `;
    return result[0];
  }

  async addDosage(idcocktail: string, data: CreateDosageDto, idcompte: string) {
    const cocktail = await this.verifierAuteur(idcocktail, idcompte);
    const ingredient = await this.prisma.ingredient.findUnique({
      where: { idingredient: data.idingredient },
    });

    if (!cocktail.alcool && ingredient?.categorie === 'alcool') {
      throw new ForbiddenException(
        "Impossible d'ajouter un ingrédient alcoolisé à un cocktail sans alcool",
      );
    }

    // Un ingrédient n'a qu'un dosage par cocktail : s'il est déjà utilisé
    // (ex. sucre aux étapes 1 et 3), on additionne les quantités.
    const existant = await this.prisma.dosage.findUnique({
      where: {
        idcocktail_idingredient: {
          idcocktail,
          idingredient: data.idingredient,
        },
      },
    });

    if (existant) {
      const memeUnite =
        existant.unite.trim().toLowerCase() === data.unite.trim().toLowerCase();
      if (!memeUnite) {
        throw new ConflictException(
          `Cet ingrédient est déjà dosé en « ${existant.unite} » : utilise la même unité pour additionner`,
        );
      }
      return this.prisma.dosage.update({
        where: {
          idcocktail_idingredient: {
            idcocktail,
            idingredient: data.idingredient,
          },
        },
        data: { quantite: { increment: data.quantite } },
      });
    }

    const result = await this.prisma.$queryRaw<Record<string, unknown>[]>`
      SELECT * FROM ajouter_dosage(
        ${idcocktail}::varchar,
        ${data.idingredient}::varchar,
        ${data.quantite}::numeric,
        ${data.unite}::varchar,
        ${data.idetape || null}::varchar
      )
    `;
    return result[0];
  }

  async addUstensile(data: CreateUstensileDto, idcompte: string) {
    await this.verifierAuteurEtape(data.idetape, idcompte);
    const result = await this.prisma.$queryRaw<Record<string, unknown>[]>`
      SELECT * FROM ajouter_ustensile_etape(${data.idetape}, ${data.idustensile})
    `;
    return result[0];
  }

  async getIngredients() {
    return this.prisma.ingredient.findMany({
      orderBy: { nomingredient: 'asc' },
    });
  }

  async getUstensiles() {
    return this.prisma.ustensile.findMany({
      orderBy: { nomustensile: 'asc' },
    });
  }

  async modifierEtape(
    idetape: string,
    descriptionetape: string,
    idcompte: string,
  ) {
    const etape = await this.prisma.etape.findUnique({
      where: { idetape },
      include: { cocktail: true },
    });

    if (!etape) throw new Error('Etape introuvable');
    if (etape.cocktail.idcompte !== idcompte) throw new Error('Non autorisé');

    return this.prisma.etape.update({
      where: { idetape },
      data: { descriptionetape },
    });
  }

  async supprimerEtape(idetape: string, idcompte: string) {
    const etape = await this.prisma.etape.findUnique({
      where: { idetape },
      include: { cocktail: true },
    });

    if (!etape) throw new Error('Etape introuvable');
    if (etape.cocktail.idcompte !== idcompte) throw new Error('Non autorisé');

    // Un cocktail publié ou privé doit garder au moins une étape
    if (STATUTS_PUBLIES.includes(etape.cocktail.statut as StatutEnum)) {
      const nbEtapes = await this.prisma.etape.count({
        where: { idcocktail: etape.idcocktail },
      });
      if (nbEtapes <= 1) {
        throw new ConflictException(
          'Un cocktail publié doit garder au moins une étape : repasse-le en brouillon pour supprimer la dernière',
        );
      }
    }

    return this.prisma.etape.delete({
      where: { idetape },
    });
  }

  async modifierDosage(
    idcocktail: string,
    idingredient: string,
    quantite: number,
    unite: string,
    idcompte: string,
  ) {
    await this.verifierAuteur(idcocktail, idcompte);
    return this.prisma.dosage.update({
      where: { idcocktail_idingredient: { idcocktail, idingredient } },
      data: { quantite, unite },
    });
  }

  // Retire un ingrédient du cocktail (un ingrédient n'apparaît qu'une fois par cocktail)
  async supprimerDosage(
    idcocktail: string,
    idingredient: string,
    idcompte: string,
  ) {
    await this.verifierAuteur(idcocktail, idcompte);
    const dosage = await this.prisma.dosage.findUnique({
      where: { idcocktail_idingredient: { idcocktail, idingredient } },
    });
    if (!dosage)
      throw new NotFoundException('Ingrédient introuvable dans ce cocktail');
    return this.prisma.dosage.delete({
      where: { idcocktail_idingredient: { idcocktail, idingredient } },
    });
  }

  async supprimerUstensileEtape(
    idetape: string,
    idustensile: string,
    idcompte: string,
  ) {
    await this.verifierAuteurEtape(idetape, idcompte);
    return this.prisma.etape_ustensile.delete({
      where: { idetape_idustensile: { idetape, idustensile } },
    });
  }

  async ajouterIngredient(nomingredient: string, categorie: string) {
    const result = await this.prisma.$queryRaw<Record<string, unknown>[]>`
      SELECT * FROM ajouter_ingredient(${nomingredient}::varchar, ${categorie}::categorie_enum)
    `;
    return result[0];
  }

  async ajouterUstensile(nomustensile: string) {
    const result = await this.prisma.$queryRaw<Record<string, unknown>[]>`
      SELECT * FROM ajouter_ustensile(${nomustensile}::varchar)
    `;
    return result[0];
  }
}
