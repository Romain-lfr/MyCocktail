import { describe, expect, it } from 'vitest';
import { libelleStatut } from './statut';

describe('libelleStatut', () => {
  it.each([
    ['brouillon', 'Brouillon'],
    ['publi_', 'Publié'],
    ['publié', 'Publié'],
    ['priv_', 'Privé'],
    ['archiv_', 'Archivé'],
    ['inconnu', 'inconnu'],
  ])('traduit %s en « %s »', (brut, libelle) => {
    expect(libelleStatut(brut)).toBe(libelle);
  });
});
