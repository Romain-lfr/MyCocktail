import { describe, expect, it } from 'vitest';
import { avecToken, messageApi, tokenSiConnecte } from './api';

describe('api', () => {
  it('avecToken lit le token au moment de l’appel', () => {
    localStorage.setItem('token', 'abc');
    expect(avecToken()).toEqual({ headers: { Authorization: 'Bearer abc' } });
    localStorage.setItem('token', 'def');
    expect(avecToken().headers.Authorization).toBe('Bearer def');
  });

  it('tokenSiConnecte n’envoie rien pour un visiteur', () => {
    expect(tokenSiConnecte()).toEqual({ headers: {} });
    localStorage.setItem('token', 'abc');
    expect(tokenSiConnecte()).toEqual({ headers: { Authorization: 'Bearer abc' } });
  });

  it.each([
    [{ response: { data: { message: 'Déjà pris' } } }, 'Déjà pris'],
    [{ response: { data: { message: ['tableau'] } } }, undefined],
    [{ response: { data: {} } }, undefined],
    [new Error('Network Error'), undefined],
    [null, undefined],
  ])('messageApi(%o) → %p', (erreur, attendu) => {
    expect(messageApi(erreur)).toBe(attendu);
  });
});
