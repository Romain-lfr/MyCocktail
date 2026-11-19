import { describe, expect, it } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import AjouterAvis from './AjouterAvis';
import { api, connecter, emplacement, erreurApi, rendre } from '../test/utils';

const ouvrir = () => rendre(<AjouterAvis />, { route: '/cocktail/Pi%C3%B1a%20Colada/avis', path: '/cocktail/:nom/avis' });

async function remplir(user: ReturnType<typeof rendre>['user'], titre = 'Excellent', description = 'Frais et parfaitement dosé') {
  if (titre) await user.type(screen.getByPlaceholderText('Titre de votre avis'), titre);
  if (description) await user.type(screen.getByPlaceholderText('Votre avis...'), description);
}

describe('AjouterAvis', () => {
  it('affiche le nom du cocktail', () => {
    ouvrir();
    expect(screen.getByRole('heading', { name: /Laisser un avis sur Piña Colada/ })).toBeInTheDocument();
  });

  it('récupère l’id du cocktail puis publie l’avis', async () => {
    connecter();
    api.get.mockResolvedValue({ data: { idcocktail: 'COK-00001' } });
    const { user } = ouvrir();
    await remplir(user);
    await user.selectOptions(screen.getByRole('combobox'), '4');
    await user.click(screen.getByRole('button', { name: 'Publier l\'avis' }));
    await waitFor(() => expect(emplacement()).toBe('/cocktail/Pi%C3%B1a%20Colada'));

    expect(api.get).toHaveBeenCalledWith('/api/cocktail/Pi%C3%B1a%20Colada', expect.any(Object));
    expect(api.post).toHaveBeenCalledWith(
      '/api/avis/COK-00001',
      { noteavis: 4, titreavis: 'Excellent', descriptionavis: 'Frais et parfaitement dosé' },
      expect.any(Object),
    );
  });

  it('note 5 par défaut', async () => {
    connecter();
    api.get.mockResolvedValue({ data: { idcocktail: 'COK-00001' } });
    const { user } = ouvrir();
    await remplir(user);
    await user.click(screen.getByRole('button', { name: 'Publier l\'avis' }));
    expect(api.post.mock.calls[0][1]).toMatchObject({ noteavis: 5 });
  });

  it('valide le titre et la description avant tout appel', async () => {
    connecter();
    const { user } = ouvrir();
    await remplir(user, 'Ok', 'Court');
    await user.click(screen.getByRole('button', { name: 'Publier l\'avis' }));
    expect(screen.getByText('Le titre doit faire au moins 3 caractères')).toBeInTheDocument();
    expect(screen.getByText('La description doit faire au moins 10 caractères')).toBeInTheDocument();
    expect(api.get).not.toHaveBeenCalled();
  });

  it('renvoie vers /login si non connecté', async () => {
    const { user } = ouvrir();
    await remplir(user);
    await user.click(screen.getByRole('button', { name: 'Publier l\'avis' }));
    expect(emplacement()).toBe('/login');
  });

  it('affiche l’erreur de l’API (avis déjà laissé)', async () => {
    connecter();
    api.get.mockResolvedValue({ data: { idcocktail: 'COK-00001' } });
    api.post.mockRejectedValue(erreurApi(409, 'Vous avez déjà laissé un avis pour ce cocktail'));
    const { user } = ouvrir();
    await remplir(user);
    await user.click(screen.getByRole('button', { name: 'Publier l\'avis' }));
    expect(await screen.findByText('Vous avez déjà laissé un avis pour ce cocktail')).toBeInTheDocument();
  });

  it('affiche un message générique si l’API ne précise rien', async () => {
    connecter();
    api.get.mockRejectedValue(new Error('Network Error'));
    const { user } = ouvrir();
    await remplir(user);
    await user.click(screen.getByRole('button', { name: 'Publier l\'avis' }));
    expect(await screen.findByText('Erreur lors de l\'ajout de l\'avis')).toBeInTheDocument();
  });
});
