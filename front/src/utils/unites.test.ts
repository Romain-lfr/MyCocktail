import { describe, expect, it } from 'vitest';
import { unitesPourCategorie } from './unites';

describe('unitesPourCategorie', () => {
  it.each([
    ['alcool', ['cl', 'ml', 'l']],
    ['jus', ['cl', 'ml', 'l']],
    ['fruit', ['pièce', 'tranche', 'g']],
    ['autre', ['morceau', 'feuille', 'pincée', 'g']],
    ['inconnue', ['cl', 'ml', 'l']],
    [undefined, ['cl', 'ml', 'l']],
  ])('%s → %o', (categorie, unites) => {
    expect(unitesPourCategorie(categorie)).toEqual(unites);
  });
});
