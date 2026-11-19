import { describe, expect, it } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import Login from './Login';
import { api, connecter, emplacement, erreurApi, rendre } from '../test/utils';

const remplir = async (user: ReturnType<typeof rendre>['user'], email = 'Romain@MyCocktail.com ', mdp = 'Romain1234') => {
  await user.type(screen.getByLabelText('E-mail'), email);
  await user.type(screen.getByLabelText('Mot de passe'), mdp);
};

describe('Login', () => {
  it('renvoie vers l’accueil si déjà connecté', () => {
    connecter();
    rendre(<Login />, { route: '/login' });
    expect(emplacement()).toBe('/');
  });

  it('désactive le bouton tant que les champs sont vides', async () => {
    const { user } = rendre(<Login />, { route: '/login' });
    const bouton = screen.getByRole('button', { name: 'Se connecter' });
    expect(bouton).toBeDisabled();
    await remplir(user);
    expect(bouton).toBeEnabled();
  });

  it('connecte, stocke le token et estMineur puis va à l’accueil', async () => {
    api.post.mockResolvedValue({ data: { access_token: 'jwt', estMineur: true } });
    const { user } = rendre(<Login />, { route: '/login' });
    await remplir(user);
    await user.click(screen.getByRole('button', { name: 'Se connecter' }));
    await waitFor(() => expect(emplacement()).toBe('/'));

    expect(api.post).toHaveBeenCalledWith('/api/auth/login', {
      pseudoOrMail: 'romain@mycocktail.com', // nettoyé et en minuscules
      mdp: 'Romain1234',
    });
    expect(localStorage.getItem('token')).toBe('jwt');
    expect(localStorage.getItem('estMineur')).toBe('true');
  });

  it.each([400, 401, 404])('affiche « identifiants incorrects » pour une erreur %i', async (status) => {
    api.post.mockRejectedValue(erreurApi(status));
    const { user } = rendre(<Login />, { route: '/login' });
    await remplir(user);
    await user.click(screen.getByRole('button', { name: 'Se connecter' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('E-mail ou mot de passe incorrect.');
    expect(screen.getByLabelText('E-mail')).toHaveAttribute('aria-invalid', 'true');
    expect(localStorage.getItem('token')).toBeNull();
  });

  it('affiche un message générique si le serveur ne répond pas', async () => {
    api.post.mockRejectedValue(new Error('Network Error'));
    const { user } = rendre(<Login />, { route: '/login' });
    await remplir(user);
    await user.click(screen.getByRole('button', { name: 'Se connecter' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Connexion impossible pour le moment');
  });

  it('affiche ou masque le mot de passe', async () => {
    const { user } = rendre(<Login />, { route: '/login' });
    const champ = screen.getByLabelText('Mot de passe');
    expect(champ).toHaveAttribute('type', 'password');
    await user.click(screen.getByRole('button', { name: 'Afficher' }));
    expect(champ).toHaveAttribute('type', 'text');
    await user.click(screen.getByRole('button', { name: 'Masquer' }));
    expect(champ).toHaveAttribute('type', 'password');
  });

  it('propose un lien vers l’inscription', () => {
    rendre(<Login />, { route: '/login' });
    expect(screen.getByRole('link', { name: 'Créer un compte' })).toHaveAttribute('href', '/register');
  });
});
