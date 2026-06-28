import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards, Request } from '@nestjs/common';
import { CompteService } from './compte.service';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';

@Controller('compte')
export class CompteController {
  constructor(private compteService: CompteService) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  getMonCompte(@Request() req: any) {
    return this.compteService.getMonCompte(req.user.idcompte);
  }

  @Get('mes-cocktails')
  @UseGuards(JwtAuthGuard)
  getMesCocktails(@Request() req: any) {
    return this.compteService.getMesCocktails(req.user.idcompte);
  }

  @Get('mes-favoris')
  @UseGuards(JwtAuthGuard)
  getMesFavoris(@Request() req: any) {
    return this.compteService.getMesFavoris(req.user.idcompte);
  }

  @Get('mes-avis')
  @UseGuards(JwtAuthGuard)
  getMesAvis(@Request() req: any) {
    return this.compteService.getMesAvis(req.user.idcompte);
  }

  @Get('favori/:idcocktail')
  @UseGuards(JwtAuthGuard)
  isFavori(@Param('idcocktail') idcocktail: string, @Request() req: any) {
    return this.compteService.isFavori(req.user.idcompte, idcocktail);
  }

  @Post('favori/:idcocktail')
  @UseGuards(JwtAuthGuard)
  ajouterFavori(@Param('idcocktail') idcocktail: string, @Request() req: any) {
    return this.compteService.ajouterFavori(req.user.idcompte, idcocktail);
  }

  @Delete('favori/:idcocktail')
  @UseGuards(JwtAuthGuard)
  supprimerFavori(@Param('idcocktail') idcocktail: string, @Request() req: any) {
    return this.compteService.supprimerFavori(req.user.idcompte, idcocktail);
  }

  @Get('recherche/:pseudo')
  rechercherComptes(@Param('pseudo') pseudo: string) {
    return this.compteService.rechercherComptes(pseudo);
  }

  @Put('me')
  @UseGuards(JwtAuthGuard)
  modifierCompte(@Body() body: { pseudo?: string; mailcompte?: string; numtel?: string }, @Request() req: any) {
    return this.compteService.modifierCompte(req.user.idcompte, body);
  }

  @Get('frigo')
  @UseGuards(JwtAuthGuard)
  getMonFrigo(@Request() req: any) {
    return this.compteService.getMonFrigo(req.user.idcompte);
  }

  @Post('frigo/:idingredient')
  @UseGuards(JwtAuthGuard)
  ajouterIngredientFrigo(
    @Param('idingredient') idingredient: string,
    @Body() body: { quantite: number; unite: string },
    @Request() req: any,
  ) {
    return this.compteService.ajouterIngredientFrigo(req.user.idcompte, idingredient, body.quantite, body.unite);
  }

  @Delete('frigo/:idingredient')
  @UseGuards(JwtAuthGuard)
  supprimerIngredientFrigo(@Param('idingredient') idingredient: string, @Request() req: any) {
    return this.compteService.supprimerIngredientFrigo(req.user.idcompte, idingredient);
  }

  @Get('frigo/cocktails')
  @UseGuards(JwtAuthGuard)
  getCocktailsRealisables(@Request() req: any) {
    return this.compteService.getCocktailsRealisables(req.user.idcompte);
  }
}