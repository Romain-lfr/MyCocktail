import { Controller, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
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
}