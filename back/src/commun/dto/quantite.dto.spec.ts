import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { QuantiteDto } from './quantite.dto';

const champsInvalides = async (corps: object) =>
  (await validate(plainToInstance(QuantiteDto, corps))).map((e) => e.property);

describe('QuantiteDto', () => {
  it('accepte une quantité positive et une unité', async () => {
    expect(await champsInvalides({ quantite: 1.5, unite: 'cl' })).toEqual([]);
  });

  it.each([0, -2, null, '3'])('refuse la quantité %p', async (quantite) => {
    expect(await champsInvalides({ quantite, unite: 'cl' })).toEqual([
      'quantite',
    ]);
  });

  it.each(['', 'x'.repeat(21), 12, undefined])(
    'refuse l’unité %p',
    async (unite) => {
      expect(await champsInvalides({ quantite: 1, unite })).toEqual(['unite']);
    },
  );
});
