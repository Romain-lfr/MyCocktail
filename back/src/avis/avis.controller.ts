import { Controller, Post, Put, Delete, Body, Param, UseGuards, Request, ForbiddenException, NotFoundException } from '@nestjs/common';
import { AvisService } from './avis.service';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { CreateAvisDto } from './dto/create-avis.dto';

@Controller('avis')
export class AvisController {
  constructor(private avisService: AvisService) {}

  @Post(':idcocktail')
  @UseGuards(JwtAuthGuard)
  ajouterAvis(
    @Param('idcocktail') idcocktail: string,
    @Body() body: CreateAvisDto,
    @Request() req: any,
  ) {
    return this.avisService.ajouterAvis(idcocktail, req.user.idcompte, body);
  }

  @Put(':idavis')
  @UseGuards(JwtAuthGuard)
  async modifierAvis(
    @Param('idavis') idavis: string,
    @Body() body: CreateAvisDto,
    @Request() req: any,
  ) {
    try {
      return await this.avisService.modifierAvis(idavis, req.user.idcompte, body);
    } catch (e: any) {
      if (e.message === 'Non autorisé') throw new ForbiddenException();
      if (e.message === 'Avis introuvable') throw new NotFoundException();
      throw e;
    }
  }

  @Delete(':idavis')
  @UseGuards(JwtAuthGuard)
  async supprimerAvis(@Param('idavis') idavis: string, @Request() req: any) {
    try {
      return await this.avisService.supprimerAvis(idavis, req.user.idcompte);
    } catch (e: any) {
      if (e.message === 'Non autorisé') throw new ForbiddenException();
      if (e.message === 'Avis introuvable') throw new NotFoundException();
      throw e;
    }
  }
}