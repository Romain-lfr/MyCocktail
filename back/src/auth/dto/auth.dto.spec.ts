import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { LoginDto } from './login.dto';
import { RegisterDto } from './register.dto';

// Renvoie la liste des champs refusés par class-validator (comme le ValidationPipe)
const champsInvalides = async (Dto: new () => object, corps: object) =>
  (await validate(plainToInstance(Dto, corps))).map((e) => e.property);

describe('DTO auth', () => {
  describe('RegisterDto', () => {
    const valide = {
      pseudo: 'romain',
      mail: 'romain@myxo.com',
      mdp: 'Romain1234',
      dateNaissance: '2000-05-12',
    };

    it('accepte une inscription valide', async () => {
      expect(await champsInvalides(RegisterDto, valide)).toEqual([]);
    });

    it('refuse un pseudo de moins de 3 caractères', async () => {
      expect(
        await champsInvalides(RegisterDto, { ...valide, pseudo: 'ro' }),
      ).toEqual(['pseudo']);
    });

    it('refuse un email invalide', async () => {
      expect(
        await champsInvalides(RegisterDto, { ...valide, mail: 'pas-un-mail' }),
      ).toEqual(['mail']);
    });

    it('refuse un mot de passe de moins de 8 caractères (la base ne le vérifie pas)', async () => {
      expect(
        await champsInvalides(RegisterDto, { ...valide, mdp: '1234567' }),
      ).toEqual(['mdp']);
    });

    it('refuse une date de naissance invalide', async () => {
      expect(
        await champsInvalides(RegisterDto, {
          ...valide,
          dateNaissance: 'hier',
        }),
      ).toEqual(['dateNaissance']);
    });

    it('refuse un corps vide', async () => {
      expect((await champsInvalides(RegisterDto, {})).sort()).toEqual(
        ['dateNaissance', 'mail', 'mdp', 'pseudo'].sort(),
      );
    });
  });

  describe('LoginDto', () => {
    it('accepte un pseudo ou un email avec un mot de passe', async () => {
      expect(
        await champsInvalides(LoginDto, { pseudoOrMail: 'romain', mdp: 'x' }),
      ).toEqual([]);
    });

    it('refuse des champs vides ou absents', async () => {
      expect(
        (await champsInvalides(LoginDto, { pseudoOrMail: '' })).sort(),
      ).toEqual(['mdp', 'pseudoOrMail'].sort());
    });
  });
});
