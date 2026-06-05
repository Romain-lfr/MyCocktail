import { IsString } from 'class-validator';

export class CreateUstensileDto {
  @IsString()
  idetape: string;

  @IsString()
  idustensile: string;
}