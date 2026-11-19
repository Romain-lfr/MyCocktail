import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { UpdateCompteDto } from './update-compte.dto';

const champsInvalides = async (corps: object) =>
  (await validate(plainToInstance(UpdateCompteDto, corps))).map((e) => e.property);

describe('UpdateCompteDto', () => {
  it('accepte une modification partielle (tous les champs sont optionnels)', async () => {
    expect(await champsInvalides({})).toEqual([]);
    expect(await champsInvalides({ pseudo: 'nouveau' })).toEqual([]);
  });

  it('accepte numtel à null (effacer le numéro)', async () => {
    expect(await champsInvalides({ numtel: null })).toEqual([]);
  });

  it('refuse un pseudo de moins de 3 caractères', async () => {
    expect(await champsInvalides({ pseudo: 'ro' })).toEqual(['pseudo']);
  });

  it('refuse un email invalide', async () => {
    expect(await champsInvalides({ mailcompte: 'pas-un-mail' })).toEqual(['mailcompte']);
  });

  it('ne déclare pas de champ date de naissance', () => {
    expect(Object.keys(plainToInstance(UpdateCompteDto, {}))).not.toContain('datenaissance');
  });
});
