import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CreateReponseDto, ModifierReponseDto } from './reponse.dto';

const champsInvalides = async (classe: new () => object, corps: object) =>
  (await validate(plainToInstance(classe, corps))).map((e) => e.property);

describe('Réponses (DTO)', () => {
  it('accepte une réponse, avec ou sans parent', async () => {
    expect(
      await champsInvalides(CreateReponseDto, { commentaire: 'Merci !' }),
    ).toEqual([]);
    expect(
      await champsInvalides(CreateReponseDto, {
        commentaire: 'Pareil',
        idreponse_parent: 'REP-00001',
      }),
    ).toEqual([]);
  });

  it.each([CreateReponseDto, ModifierReponseDto])(
    '%p refuse un commentaire trop court ou absent',
    async (classe) => {
      expect(await champsInvalides(classe, { commentaire: 'a' })).toEqual([
        'commentaire',
      ]);
      expect(await champsInvalides(classe, {})).toEqual(['commentaire']);
    },
  );

  it('refuse un parent qui n’est pas un texte', async () => {
    expect(
      await champsInvalides(CreateReponseDto, {
        commentaire: 'Merci !',
        idreponse_parent: 42,
      }),
    ).toEqual(['idreponse_parent']);
  });
});
