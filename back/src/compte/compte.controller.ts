import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { CompteService } from './compte.service';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { UpdateCompteDto } from './dto/update-compte.dto';
import type { RequeteAuth } from '../auth/utilisateur';
import { QuantiteDto } from '../commun/dto/quantite.dto';

@Controller('compte')
export class CompteController {
  constructor(private compteService: CompteService) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  getMonCompte(@Request() req: RequeteAuth) {
    return this.compteService.getMonCompte(req.user.idcompte);
  }

  @Get('mes-cocktails')
  @UseGuards(JwtAuthGuard)
  getMesCocktails(@Request() req: RequeteAuth) {
    return this.compteService.getMesCocktails(req.user.idcompte);
  }

  @Get('mes-favoris')
  @UseGuards(JwtAuthGuard)
  getMesFavoris(@Request() req: RequeteAuth) {
    return this.compteService.getMesFavoris(req.user.idcompte);
  }

  @Get('mes-avis')
  @UseGuards(JwtAuthGuard)
  getMesAvis(@Request() req: RequeteAuth) {
    return this.compteService.getMesAvis(req.user.idcompte);
  }

  @Get('favori/:idcocktail')
  @UseGuards(JwtAuthGuard)
  isFavori(
    @Param('idcocktail') idcocktail: string,
    @Request() req: RequeteAuth,
  ) {
    return this.compteService.isFavori(req.user.idcompte, idcocktail);
  }

  @Post('favori/:idcocktail')
  @UseGuards(JwtAuthGuard)
  ajouterFavori(
    @Param('idcocktail') idcocktail: string,
    @Request() req: RequeteAuth,
  ) {
    return this.compteService.ajouterFavori(req.user.idcompte, idcocktail);
  }

  @Delete('favori/:idcocktail')
  @UseGuards(JwtAuthGuard)
  supprimerFavori(
    @Param('idcocktail') idcocktail: string,
    @Request() req: RequeteAuth,
  ) {
    return this.compteService.supprimerFavori(req.user.idcompte, idcocktail);
  }

  @Get('recherche/:pseudo')
  rechercherComptes(@Param('pseudo') pseudo: string) {
    return this.compteService.rechercherComptes(pseudo);
  }

  @Put('me')
  @UseGuards(JwtAuthGuard)
  modifierCompte(@Body() body: UpdateCompteDto, @Request() req: RequeteAuth) {
    return this.compteService.modifierCompte(req.user.idcompte, body);
  }

  @Get('frigo')
  @UseGuards(JwtAuthGuard)
  getMonFrigo(@Request() req: RequeteAuth) {
    return this.compteService.getMonFrigo(req.user.idcompte);
  }

  @Post('frigo/:idingredient')
  @UseGuards(JwtAuthGuard)
  ajouterIngredientFrigo(
    @Param('idingredient') idingredient: string,
    @Body() body: QuantiteDto,
    @Request() req: RequeteAuth,
  ) {
    return this.compteService.ajouterIngredientFrigo(
      req.user.idcompte,
      idingredient,
      body.quantite,
      body.unite,
    );
  }

  @Delete('frigo/:idingredient')
  @UseGuards(JwtAuthGuard)
  supprimerIngredientFrigo(
    @Param('idingredient') idingredient: string,
    @Request() req: RequeteAuth,
  ) {
    return this.compteService.supprimerIngredientFrigo(
      req.user.idcompte,
      idingredient,
    );
  }

  @Get('frigo/cocktails')
  @UseGuards(JwtAuthGuard)
  getCocktailsRealisables(@Request() req: RequeteAuth) {
    return this.compteService.getCocktailsRealisables(
      req.user.idcompte,
      req.user.estMineur,
    );
  }
}
