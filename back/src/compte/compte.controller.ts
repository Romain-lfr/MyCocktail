import { Controller, Get, Post, Delete, Param, UseGuards, Request } from '@nestjs/common';
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
}