import { describe, expect, it } from 'vitest';
import { formatNote, formatQuantite, noteMoyenne } from './format';

describe('format', () => {
  it.each([[1.5, '1,5'], [12, '12'], [0.333, '0,33']])('formatQuantite(%p) → %s', (q, texte) => {
    expect(formatQuantite(q)).toBe(texte);
  });

  it('noteMoyenne : moyenne des notes, 0 sans avis', () => {
    expect(noteMoyenne([{ noteavis: 4 }, { noteavis: 5 }])).toBe(4.5);
    expect(noteMoyenne([])).toBe(0);
  });

  it('formatNote : une décimale, virgule française', () => {
    expect(formatNote(4.5)).toBe('4,5');
    expect(formatNote(3)).toBe('3,0');
  });
});
