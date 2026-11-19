import { describe, expect, it } from 'vitest';
import { initiales } from './initiales';

describe('initiales', () => {
  it.each([
    ['romain', 'R'],
    ['jean_dupont', 'JD'],
    ['Marie Claire', 'MC'],
    ['anne-sophie', 'AS'],
    ['j.martin', 'JM'],
    ['mojitoLover', 'ML'],
    ['élodie', 'É'],
    ['  zoé  ', 'Z'],
    ['a b c', 'AB'],
    ['ROMAIN', 'R'],
    ['romain35', 'R'],
  ])('« %s » → « %s »', (pseudo, attendu) => {
    expect(initiales(pseudo)).toBe(attendu);
  });

  it.each([[''], ['   '], ['__'], [null], [undefined]])('pseudo vide (%s) → « ? »', (pseudo) => {
    expect(initiales(pseudo)).toBe('?');
  });
});
