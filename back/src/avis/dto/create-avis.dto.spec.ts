import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CreateAvisDto } from './create-avis.dto';

const champsInvalides = async (corps: object) =>
  (await validate(plainToInstance(CreateAvisDto, corps))).map(
    (e) => e.property,
  );

describe('CreateAvisDto', () => {
  const valide = {
    noteavis: 4,
    titreavis: 'Très bon',
    descriptionavis: 'Frais et bien dosé',
  };

  it('accepte un avis valide', async () => {
    expect(await champsInvalides(valide)).toEqual([]);
  });

  it.each([0, 6, 3.5])(
    'refuse la note %p (entier de 1 à 5)',
    async (noteavis) => {
      expect(await champsInvalides({ ...valide, noteavis })).toEqual([
        'noteavis',
      ]);
    },
  );

  it('accepte les notes limites 1 et 5', async () => {
    expect(await champsInvalides({ ...valide, noteavis: 1 })).toEqual([]);
    expect(await champsInvalides({ ...valide, noteavis: 5 })).toEqual([]);
  });

  it('refuse un titre de moins de 3 caractères', async () => {
    expect(await champsInvalides({ ...valide, titreavis: 'Ok' })).toEqual([
      'titreavis',
    ]);
  });

  it('refuse une description de moins de 10 caractères', async () => {
    expect(
      await champsInvalides({ ...valide, descriptionavis: 'Bof' }),
    ).toEqual(['descriptionavis']);
  });
});
