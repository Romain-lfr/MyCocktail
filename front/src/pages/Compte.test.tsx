import { describe, expect, it } from 'vitest';
import { screen, within } from '@testing-library/react';
import Compte from './Compte';
import { api, connecter, emplacement, rendre } from '../test/utils';

const compte = {
  idcompte: 'CPT-00001',
  pseudo: 'romain',
  mailcompte: 'romain@myxo.com',
  numtel: '0600000000',
  dateinscription: '2024-01-15T00:00:00.000Z',
  datenaissance: '2000-05-12T00:00:00.000Z',
  role: 'moderateur',
};

describe('Compte (profil)', () => {
  it('renvoie vers /login sans token', () => {
    rendre(<Compte />, { route: '/compte' });
    expect(emplacement()).toBe('/login');
    expect(api.get).not.toHaveBeenCalled();
  });

  it('affiche les informations du compte', async () => {
    connecter();
    api.get.mockResolvedValue({ data: compte });
    rendre(<Compte />, { route: '/compte' });
    expect(await screen.findByRole('heading', { name: 'romain' })).toBeInTheDocument();
    expect(api.get).toHaveBeenCalledWith('/api/compte/me', expect.objectContaining({ headers: expect.any(Object) }));
    expect(screen.getByText('Modérateur')).toBeInTheDocument();
    expect(screen.getByText('0600000000')).toBeInTheDocument();
    expect(screen.getByText('12/05/2000')).toBeInTheDocument();
    expect(screen.getByText('15/01/2024')).toBeInTheDocument();
  });

  it('n’affiche pas la ligne téléphone sans numéro et garde un rôle inconnu tel quel', async () => {
    connecter();
    api.get.mockResolvedValue({ data: { ...compte, numtel: null, role: 'superviseur' } });
    rendre(<Compte />, { route: '/compte' });
    expect(await screen.findByText('superviseur')).toBeInTheDocument();
    expect(screen.queryByText('Téléphone')).not.toBeInTheDocument();
  });

  it('affiche « Chargement… » pendant la requête', () => {
    connecter();
    api.get.mockReturnValue(new Promise(() => {}));
    rendre(<Compte />, { route: '/compte' });
    expect(screen.getByText('Chargement…')).toBeInTheDocument();
  });

  it('déconnecte si le token est refusé', async () => {
    connecter();
    api.get.mockRejectedValue(new Error('401'));
    rendre(<Compte />, { route: '/compte' });
    await screen.findByText((_, el) => el?.getAttribute('data-testid') === 'emplacement' && el.textContent === '/login');
    expect(localStorage.getItem('token')).toBeNull();
  });

  it('propose les liens de mon espace', async () => {
    connecter();
    api.get.mockResolvedValue({ data: compte });
    rendre(<Compte />, { route: '/compte' });
    await screen.findByRole('heading', { name: 'romain' });
    const espace = within(screen.getByRole('heading', { name: 'Mon espace' }).nextElementSibling as HTMLElement);
    expect(espace.getByRole('link', { name: /Mes cocktails/ })).toHaveAttribute('href', '/compte/cocktails');
    expect(espace.getByRole('link', { name: /Mes favoris/ })).toHaveAttribute('href', '/compte/favoris');
    expect(espace.getByRole('link', { name: /Mon frigo/ })).toHaveAttribute('href', '/compte/frigo');
    expect(espace.getByRole('link', { name: /Mes avis/ })).toHaveAttribute('href', '/compte/avis');
    expect(espace.getByRole('link', { name: /Mon frigo/ })).toHaveTextContent('Tes ingrédients et ce qu\'ils permettent');
  });

  it('affiche depuis quand le membre est inscrit (mois et année)', async () => {
    connecter();
    api.get.mockResolvedValue({ data: compte });
    rendre(<Compte />, { route: '/compte' });
    expect(await screen.findByText('Au bar depuis janvier 2024')).toBeInTheDocument();
  });

  it('« Modifier les informations » mène à /compte/modifier (route existante)', async () => {
    connecter();
    api.get.mockResolvedValue({ data: compte });
    const { user } = rendre(<Compte />, { route: '/compte' });
    await user.click(await screen.findByRole('button', { name: 'Modifier les informations' }));
    expect(emplacement()).toBe('/compte/modifier');
  });
});
