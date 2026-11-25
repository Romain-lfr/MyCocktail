import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Query,
  Param,
  Body,
  Request,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  ForbiddenException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import * as fs from 'fs';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import {
  TAILLE_MAX_IMAGE,
  nomFichierUpload,
  filtreImage,
} from '../commun/upload';
import { CocktailService } from './cocktail.service';
import { ImageService } from '../image/image.service';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt.guard';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { CreateDosageDto } from './dto/create-dosage.dto';
import { CreateUstensileDto } from './dto/create-ustensile.dto';
import { CreateEtapeDto } from './dto/create-etape.dto';
import { CreateCocktailDto } from './dto/create-cocktail.dto';
import { UpdateCocktailDto } from './dto/update-cocktail.dto';
import type { RequeteAuth, RequeteAuthOptionnelle } from '../auth/utilisateur';
import { messageErreur } from '../commun/erreurs';
import { ModifierEtapeDto } from './dto/modifier-etape.dto';
import { NouvelIngredientDto, NouvelUstensileDto } from './dto/liste.dto';
import { QuantiteDto } from '../commun/dto/quantite.dto';

// Réglages d'envoi partagés avec la photo de profil (réexportés pour les tests existants)
export { TAILLE_MAX_IMAGE, nomFichierUpload, filtreImage };

@Controller('cocktail')
export class CocktailController {
  constructor(
    private cocktailService: CocktailService,
    private imageService: ImageService,
  ) {}

  @Get()
  @UseGuards(OptionalJwtAuthGuard)
  findAll(
    @Query('alcool') alcool?: string,
    @Query('recherche') recherche?: string,
    @Query('ingredients') ingredients?: string,
    @Query('ustensiles') ustensiles?: string,
    @Request() req: RequeteAuthOptionnelle = {},
  ) {
    const user = req.user;
    const ingredientsList = ingredients ? ingredients.split(',') : [];
    const ustensilesList = ustensiles ? ustensiles.split(',') : [];
    if (!user || user.estMineur)
      return this.cocktailService.findAll(
        false,
        recherche,
        ingredientsList,
        ustensilesList,
      );
    if (alcool === 'true')
      return this.cocktailService.findAll(
        true,
        recherche,
        ingredientsList,
        ustensilesList,
      );
    if (alcool === 'false')
      return this.cocktailService.findAll(
        false,
        recherche,
        ingredientsList,
        ustensilesList,
      );
    return this.cocktailService.findAll(
      undefined,
      recherche,
      ingredientsList,
      ustensilesList,
    );
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() body: CreateCocktailDto, @Request() req: RequeteAuth) {
    return this.cocktailService.create(
      body,
      req.user.idcompte,
      req.user.estMineur,
    );
  }

  @Post(':id/image')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './public/images',
        filename: nomFichierUpload,
      }),
      limits: { fileSize: TAILLE_MAX_IMAGE },
      fileFilter: filtreImage,
    }),
  )
  async uploadImage(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
    @Request() req: RequeteAuth,
  ) {
    if (!file) throw new BadRequestException('Aucune image reçue');
    try {
      await this.cocktailService.verifierAuteur(id, req.user.idcompte);
    } catch (e) {
      fs.unlinkSync(file.path); // multer a déjà écrit le fichier : on le supprime
      throw e;
    }
    return this.imageService.ajouterImageCocktail(
      id,
      file.path,
      file.originalname,
    );
  }

  @Get('listes/ingredients')
  getIngredients() {
    return this.cocktailService.getIngredients();
  }

  @Get('listes/ustensiles')
  getUstensiles() {
    return this.cocktailService.getUstensiles();
  }

  @Get(':nom')
  @UseGuards(OptionalJwtAuthGuard)
  findOne(@Param('nom') nom: string, @Request() req: RequeteAuthOptionnelle) {
    return this.cocktailService.findByNom(nom, req.user);
  }

  @Post(':id/etape')
  @UseGuards(JwtAuthGuard)
  addEtape(
    @Param('id') id: string,
    @Body() body: CreateEtapeDto,
    @Request() req: RequeteAuth,
  ) {
    return this.cocktailService.addEtape(id, body, req.user.idcompte);
  }

  @Post(':id/dosage')
  @UseGuards(JwtAuthGuard)
  addDosage(
    @Param('id') id: string,
    @Body() body: CreateDosageDto,
    @Request() req: RequeteAuth,
  ) {
    return this.cocktailService.addDosage(id, body, req.user.idcompte);
  }

  @Post('etape/ustensile')
  @UseGuards(JwtAuthGuard)
  addUstensile(@Body() body: CreateUstensileDto, @Request() req: RequeteAuth) {
    return this.cocktailService.addUstensile(body, req.user.idcompte);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  async modifier(
    @Param('id') id: string,
    @Body() body: UpdateCocktailDto,
    @Request() req: RequeteAuth,
  ) {
    try {
      return await this.cocktailService.modifier(
        id,
        body,
        req.user.idcompte,
        req.user.estMineur,
      );
    } catch (e: unknown) {
      if (messageErreur(e) === 'Non autorisé') throw new ForbiddenException();
      if (messageErreur(e) === 'Cocktail introuvable')
        throw new NotFoundException();
      throw e;
    }
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async supprimer(@Param('id') id: string, @Request() req: RequeteAuth) {
    try {
      return await this.cocktailService.supprimer(id, req.user.idcompte);
    } catch (e: unknown) {
      if (messageErreur(e) === 'Non autorisé') throw new ForbiddenException();
      if (messageErreur(e) === 'Cocktail introuvable')
        throw new NotFoundException();
      throw e;
    }
  }

  @Put('etape/:idetape')
  @UseGuards(JwtAuthGuard)
  async modifierEtape(
    @Param('idetape') idetape: string,
    @Body() body: ModifierEtapeDto,
    @Request() req: RequeteAuth,
  ) {
    try {
      return await this.cocktailService.modifierEtape(
        idetape,
        body.descriptionetape,
        req.user.idcompte,
      );
    } catch (e: unknown) {
      if (messageErreur(e) === 'Non autorisé') throw new ForbiddenException();
      if (messageErreur(e) === 'Etape introuvable')
        throw new NotFoundException();
      throw e;
    }
  }

  @Delete('etape/:idetape')
  @UseGuards(JwtAuthGuard)
  async supprimerEtape(
    @Param('idetape') idetape: string,
    @Request() req: RequeteAuth,
  ) {
    try {
      return await this.cocktailService.supprimerEtape(
        idetape,
        req.user.idcompte,
      );
    } catch (e: unknown) {
      if (messageErreur(e) === 'Non autorisé') throw new ForbiddenException();
      if (messageErreur(e) === 'Etape introuvable')
        throw new NotFoundException();
      throw e;
    }
  }

  @Put(':id/dosage/:idingredient')
  @UseGuards(JwtAuthGuard)
  modifierDosage(
    @Param('id') id: string,
    @Param('idingredient') idingredient: string,
    @Body() body: QuantiteDto,
    @Request() req: RequeteAuth,
  ) {
    return this.cocktailService.modifierDosage(
      id,
      idingredient,
      body.quantite,
      body.unite,
      req.user.idcompte,
    );
  }

  @Delete(':id/dosage/:idingredient')
  @UseGuards(JwtAuthGuard)
  supprimerDosage(
    @Param('id') id: string,
    @Param('idingredient') idingredient: string,
    @Request() req: RequeteAuth,
  ) {
    return this.cocktailService.supprimerDosage(
      id,
      idingredient,
      req.user.idcompte,
    );
  }

  @Delete('etape/:idetape/ustensile/:idustensile')
  @UseGuards(JwtAuthGuard)
  supprimerUstensileEtape(
    @Param('idetape') idetape: string,
    @Param('idustensile') idustensile: string,
    @Request() req: RequeteAuth,
  ) {
    return this.cocktailService.supprimerUstensileEtape(
      idetape,
      idustensile,
      req.user.idcompte,
    );
  }

  @Post('listes/ingredients')
  @UseGuards(JwtAuthGuard)
  ajouterIngredient(@Body() body: NouvelIngredientDto) {
    return this.cocktailService.ajouterIngredient(
      body.nomingredient,
      body.categorie,
    );
  }

  @Post('listes/ustensiles')
  @UseGuards(JwtAuthGuard)
  ajouterUstensile(@Body() body: NouvelUstensileDto) {
    return this.cocktailService.ajouterUstensile(body.nomustensile);
  }
}
