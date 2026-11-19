import { codePrisma, messageErreur, messageSql } from './erreurs';

describe('erreurs', () => {
  it('messageErreur lit le message d’une Error, rien sinon', () => {
    expect(messageErreur(new Error('Non autorisé'))).toBe('Non autorisé');
    expect(messageErreur('texte')).toBe('');
    expect(messageErreur(null)).toBe('');
  });

  it('messageSql lit e.meta.message, rien sinon', () => {
    expect(messageSql({ meta: { message: 'already exists' } })).toBe(
      'already exists',
    );
    expect(messageSql({ meta: { message: 42 } })).toBe('');
    expect(messageSql({})).toBe('');
    expect(messageSql(undefined)).toBe('');
  });

  it('codePrisma lit e.code, undefined sinon', () => {
    expect(codePrisma({ code: 'P2002' })).toBe('P2002');
    expect(codePrisma({ code: 2002 })).toBeUndefined();
    expect(codePrisma(null)).toBeUndefined();
  });
});
