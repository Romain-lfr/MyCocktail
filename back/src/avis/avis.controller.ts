import {
  Controller,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { AvisService } from './avis.service';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { CreateAvisDto } from './dto/create-avis.dto';
import type { RequeteAuth } from '../auth/utilisateur';
import { messageErreur } from '../commun/erreurs';
import { CreateReponseDto, ModifierReponseDto } from './dto/reponse.dto';

@Controller('avis')
export class AvisController {
  constructor(private avisService: AvisService) {}

  @Post(':idcocktail')
  @UseGuards(JwtAuthGuard)
  ajouterAvis(
    @Param('idcocktail') idcocktail: string,
    @Body() body: CreateAvisDto,
    @Request() req: RequeteAuth,
  ) {
    return this.avisService.ajouterAvis(idcocktail, req.user.idcompte, body);
  }

  @Put(':idavis')
  @UseGuards(JwtAuthGuard)
  async modifierAvis(
    @Param('idavis') idavis: string,
    @Body() body: CreateAvisDto,
    @Request() req: RequeteAuth,
  ) {
    try {
      return await this.avisService.modifierAvis(
        idavis,
        req.user.idcompte,
        body,
      );
    } catch (e: unknown) {
      if (messageErreur(e) === 'Non autorisé') throw new ForbiddenException();
      if (messageErreur(e) === 'Avis introuvable')
        throw new NotFoundException();
      throw e;
    }
  }

  @Delete(':idavis')
  @UseGuards(JwtAuthGuard)
  async supprimerAvis(
    @Param('idavis') idavis: string,
    @Request() req: RequeteAuth,
  ) {
    try {
      return await this.avisService.supprimerAvis(idavis, req.user.idcompte);
    } catch (e: unknown) {
      if (messageErreur(e) === 'Non autorisé') throw new ForbiddenException();
      if (messageErreur(e) === 'Avis introuvable')
        throw new NotFoundException();
      throw e;
    }
  }

  @Post(':idavis/reponse')
  @UseGuards(JwtAuthGuard)
  ajouterReponse(
    @Param('idavis') idavis: string,
    @Body() body: CreateReponseDto,
    @Request() req: RequeteAuth,
  ) {
    return this.avisService.ajouterReponse(
      idavis,
      req.user.idcompte,
      body.commentaire,
      body.idreponse_parent,
    );
  }

  @Put('reponse/:idreponse')
  @UseGuards(JwtAuthGuard)
  async modifierReponse(
    @Param('idreponse') idreponse: string,
    @Body() body: ModifierReponseDto,
    @Request() req: RequeteAuth,
  ) {
    try {
      return await this.avisService.modifierReponse(
        idreponse,
        req.user.idcompte,
        body.commentaire,
      );
    } catch (e: unknown) {
      if (messageErreur(e) === 'Non autorisé') throw new ForbiddenException();
      if (messageErreur(e) === 'Réponse introuvable')
        throw new NotFoundException();
      throw e;
    }
  }

  @Delete('reponse/:idreponse')
  @UseGuards(JwtAuthGuard)
  async supprimerReponse(
    @Param('idreponse') idreponse: string,
    @Request() req: RequeteAuth,
  ) {
    try {
      return await this.avisService.supprimerReponse(
        idreponse,
        req.user.idcompte,
      );
    } catch (e: unknown) {
      if (messageErreur(e) === 'Non autorisé') throw new ForbiddenException();
      if (messageErreur(e) === 'Réponse introuvable')
        throw new NotFoundException();
      throw e;
    }
  }
}
