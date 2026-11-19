import { describe, expect, it } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import InfoCompte from './InfoCompte';
import { api, connecter, emplacement, rendre } from '../test/utils';

const compte = {
  idcompte: 'CPT-00001',
  pseudo: 'romain',
  mailcompte: 'romain@mycocktail.com',
  numtel: null,
  dateinscription: '2024-01-15T00:00:00.000Z',
  datenaissance: '2000-05-12T00:00:00.000Z',
  role: 'user',
};

describe('InfoCompte', () => {
  it('renvoie vers /login sans token', () => {
    rendre(<InfoCompte />);
    expect(emplacement()).toBe('/login');
  });

  it('affiche le profil, avec « Non renseigné » sans téléphone', async () => {
    connecter();
    api.get.mockResolvedValue({ data: compte });
    rendre(<InfoCompte />);
    expect(await screen.findByText('Pseudo : romain')).toBeInTheDocument();
    expect(screen.getByText('Téléphone : Non renseigné')).toBeInTheDocument();
    expect(screen.getByText('Rôle : user')).toBeInTheDocument();
  });

  it('affiche le téléphone quand il existe', async () => {
    connecter();
    api.get.mockResolvedValue({ data: { ...compte, numtel: '0600000000' } });
    rendre(<InfoCompte />);
    expect(await screen.findByText('Téléphone : 0600000000')).toBeInTheDocument();
  });

  it('renvoie vers /login si l’API refuse', async () => {
    connecter();
    api.get.mockRejectedValue(new Error('401'));
    rendre(<InfoCompte />);
    await waitFor(() => expect(emplacement()).toBe('/login'));
  });

  it('boutons Retour et Modifier mon profil', async () => {
    connecter();
    api.get.mockResolvedValue({ data: compte });
    const { user } = rendre(<InfoCompte />);
    await user.click(await screen.findByRole('button', { name: 'Modifier mon profil' }));
    expect(emplacement()).toBe('/compte/modifier');
  });

  it('Retour mène à /compte', async () => {
    connecter();
    api.get.mockResolvedValue({ data: compte });
    const { user } = rendre(<InfoCompte />);
    await user.click(await screen.findByRole('button', { name: '← Retour' }));
    expect(emplacement()).toBe('/compte');
  });
});
