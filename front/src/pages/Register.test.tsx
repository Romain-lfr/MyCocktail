import { describe, expect, it } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import Register from './Register';
import { api, emplacement, erreurApi, rendre } from '../test/utils';

type Champs = { pseudo?: string; mail?: string; mdp?: string; confirm?: string; date?: string };
const valides: Required<Champs> = {
  pseudo: 'romain',
  mail: 'romain@mycocktail.com',
  mdp: 'Romain1234',
  confirm: 'Romain1234',
  date: '2000-05-12',
};

async function remplirEtEnvoyer(user: ReturnType<typeof rendre>['user'], champs: Champs = {}) {
  const c = { ...valides, ...champs };
  if (c.pseudo) await user.type(screen.getByPlaceholderText('Pseudo'), c.pseudo);
  if (c.mail) await user.type(screen.getByPlaceholderText('Email'), c.mail);
  if (c.mdp) await user.type(screen.getByPlaceholderText('Mot de passe'), c.mdp);
  if (c.confirm) await user.type(screen.getByPlaceholderText('Confirmer le mot de passe'), c.confirm);
  if (c.date) await user.type(document.querySelector('input[type="date"]')!, c.date);
  await user.click(screen.getByRole('button', { name: 'Créer mon compte' }));
}

describe('Register', () => {
  it('inscrit puis renvoie vers la connexion', async () => {
    const { user } = rendre(<Register />, { route: '/register' });
    await remplirEtEnvoyer(user);
    expect(api.post).toHaveBeenCalledWith('/api/auth/register', {
      pseudo: 'romain',
      mail: 'romain@mycocktail.com',
      mdp: 'Romain1234',
      dateNaissance: '2000-05-12',
    });
    await waitFor(() => expect(emplacement()).toBe('/login'));
  });

  it.each([
    [{ pseudo: 'ro' }, 'Le pseudo doit faire au moins 3 caractères'],
    [{ mail: 'pas-un-mail' }, 'Email invalide'],
    [{ mdp: 'Court1', confirm: 'Court1' }, 'Le mot de passe doit faire au moins 8 caractères'],
    [{ mdp: 'romain1234', confirm: 'romain1234' }, 'Le mot de passe doit contenir au moins une majuscule'],
    [{ mdp: 'RomainRomain', confirm: 'RomainRomain' }, 'Le mot de passe doit contenir au moins un chiffre'],
    [{ confirm: 'Romain12345' }, 'Les mots de passe ne correspondent pas'],
    [{ date: '' }, 'La date de naissance est obligatoire'],
    [{ date: '2999-01-01' }, 'La date de naissance doit être dans le passé'],
  ])('refuse %o : « %s » sans appeler l’API', async (champs, message) => {
    const { user } = rendre(<Register />, { route: '/register' });
    await remplirEtEnvoyer(user, champs);
    expect(screen.getByText(message)).toBeInTheDocument();
    expect(api.post).not.toHaveBeenCalled();
  });

  it('affiche le message renvoyé par l’API (ex. pseudo déjà pris)', async () => {
    api.post.mockRejectedValue(erreurApi(409, 'Ce pseudo est déjà utilisé'));
    const { user } = rendre(<Register />, { route: '/register' });
    await remplirEtEnvoyer(user);
    expect(await screen.findByText('Ce pseudo est déjà utilisé')).toBeInTheDocument();
    expect(emplacement()).toBe('/register');
  });

  it('affiche un message générique si l’API ne précise rien', async () => {
    api.post.mockRejectedValue(new Error('Network Error'));
    const { user } = rendre(<Register />, { route: '/register' });
    await remplirEtEnvoyer(user);
    expect(await screen.findByText('Erreur lors de la création du compte')).toBeInTheDocument();
  });
});
