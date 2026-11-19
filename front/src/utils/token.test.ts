import { describe, expect, it } from 'vitest';
import { idCompteDuToken } from './token';
import { fauxToken } from '../test/utils';

describe('idCompteDuToken', () => {
  it('lit le sub du token', () => {
    expect(idCompteDuToken(fauxToken({ sub: 'CPT-00001' }))).toBe('CPT-00001');
  });

  it('lit un token encodé en base64url (caractères - et _)', () => {
    // ce contenu donne un « - » ou un « _ » une fois encodé : atob seul planterait
    const contenu = { sub: 'CPT-00042', pseudo: '>>>???~~~' };
    const token = fauxToken(contenu);
    expect(token.split('.')[1]).toMatch(/[-_]/);
    expect(idCompteDuToken(token)).toBe('CPT-00042');
  });

  it.each([null, '', 'pas-un-jwt', 'a.!!!.b'])('renvoie null pour un token absent ou illisible (%p)', (token) => {
    expect(idCompteDuToken(token)).toBeNull();
  });

  it('renvoie null si le token n’a pas de sub', () => {
    expect(idCompteDuToken(fauxToken({ pseudo: 'romain' }))).toBeNull();
  });
});
