import { describe, expect, it, vi } from 'vitest';
import { screen, waitFor, within } from '@testing-library/react';
import ModifierCocktail from './ModifierCocktail';
import { api, connecter, emplacement, erreurApi, rendre } from '../test/utils';

const ingredients = [
  { idingredient: 'ING-00001', nomingredient: 'Menthe', categorie: 'autre' },
  { idingredient: 'ING-00002', nomingredient: 'Rhum', categorie: 'alcool' },
];
const ustensiles = [{ idustensile: 'UST-00001', nomustensile: 'Shaker' }];

const cocktail = {
  idcocktail: 'COK-00001',
  nomcocktail: 'Mojito',
  description: 'Le classique cubain',
  difficulte: 'Moyen',
  alcool: true,
  duree: 5,
  statut: 'brouillon',
  etape: [
    {
      idetape: 'ETP-00001', numeroetape: 1, descriptionetape: 'Piler la menthe',
      dosage: [{ idingredient: 'ING-00001', quantite: 6, unite: 'feuille', ingredient: { nomingredient: 'Menthe' } }],
      etape_ustensile: [{ idustensile: 'UST-00001', ustensile: { nomustensile: 'Shaker' } }],
    },
    { idetape: 'ETP-00002', numeroetape: 2, descriptionetape: 'Ajouter le rhum', dosage: [], etape_ustensile: [] },
  ],
};

function repondre(donnees: unknown = cocktail) {
  api.get.mockImplementation((url: string) => {
    if (url.endsWith('/listes/ingredients')) return Promise.resolve({ data: ingredients });
    if (url.endsWith('/listes/ustensiles')) return Promise.resolve({ data: ustensiles });
    return Promise.resolve({ data: donnees });
  });
}

async function ouvrir() {
  connecter();
  repondre();
  const rendu = rendre(<ModifierCocktail />, { route: '/cocktail/Mojito/modifier', path: '/cocktail/:nom/modifier', depuis: '/compte/cocktails' });
  await screen.findByDisplayValue('Le classique cubain');
  return rendu;
}

// Bloc d'une étape (pour cibler ses champs)
const etape = (n: number) => within(screen.getByText(`Étape ${n}`).parentElement as HTMLElement);

describe('ModifierCocktail', () => {
  describe('chargement', () => {
    it('renvoie vers /login sans token', () => {
      rendre(<ModifierCocktail />, { route: '/cocktail/Mojito/modifier', path: '/cocktail/:nom/modifier' });
      expect(emplacement()).toBe('/login');
    });

    it('pré-remplit le formulaire, statut compris', async () => {
      await ouvrir();
      expect(screen.getByDisplayValue('Mojito')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Moyen')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Brouillon (visible par moi seul)')).toBeInTheDocument();
      expect(screen.getByRole('checkbox')).toBeChecked();
      expect(screen.getByDisplayValue('Piler la menthe')).toBeInTheDocument();
      expect(screen.getByDisplayValue('6')).toBeInTheDocument();
    });

    it('renvoie à l’accueil si le cocktail ne peut pas être chargé', async () => {
      connecter();
      api.get.mockImplementation((url: string) =>
        url.includes('/listes/') ? Promise.resolve({ data: [] }) : Promise.reject(erreurApi(404)),
      );
      rendre(<ModifierCocktail />, { route: '/cocktail/X/modifier', path: '/cocktail/:nom/modifier' });
      await waitFor(() => expect(emplacement()).toBe('/'));
    });

    it('Retour revient à la page précédente', async () => {
      const { user } = await ouvrir();
      await user.click(screen.getByRole('button', { name: '← Retour' }));
      expect(emplacement()).toBe('/compte/cocktails');
    });
  });

  describe('informations et statut', () => {
    it('publie le cocktail (statut publi_) et revient à mes cocktails', async () => {
      const { user } = await ouvrir();
      await user.selectOptions(screen.getByDisplayValue('Brouillon (visible par moi seul)'), 'publi_');
      await user.selectOptions(screen.getByDisplayValue('Moyen'), 'Facile');
      await user.click(screen.getByRole('checkbox'));
      await user.click(screen.getAllByRole('button', { name: 'Sauvegarder' })[0]);
      expect(api.put).toHaveBeenCalledWith(
        '/api/cocktail/COK-00001',
        { nomcocktail: 'Mojito', description: 'Le classique cubain', difficulte: 'Facile', alcool: false, duree: 5, statut: 'publi_' },
        expect.any(Object),
      );
      await waitFor(() => expect(emplacement()).toBe('/compte/cocktails'));
    });

    it('valide les champs avant d’appeler l’API', async () => {
      const { user } = await ouvrir();
      await user.clear(screen.getByDisplayValue('Mojito'));
      await user.type(screen.getAllByRole('textbox')[0], 'M');
      await user.clear(screen.getByDisplayValue('Le classique cubain'));
      await user.clear(screen.getByDisplayValue('5'));
      await user.click(screen.getAllByRole('button', { name: 'Sauvegarder' })[0]);
      expect(screen.getByText('Le nom doit faire au moins 2 caractères')).toBeInTheDocument();
      expect(screen.getByText('La description doit faire au moins 10 caractères')).toBeInTheDocument();
      expect(screen.getByText('La durée doit être positive')).toBeInTheDocument();
      expect(api.put).not.toHaveBeenCalled();
    });

    it('affiche l’erreur de l’API (ex. ingrédients alcoolisés restants)', async () => {
      const { user } = await ouvrir();
      api.put.mockRejectedValue(erreurApi(409, 'Retire d\'abord les ingrédients alcoolisés'));
      await user.click(screen.getAllByRole('button', { name: 'Sauvegarder' })[0]);
      expect(await screen.findByText('Retire d\'abord les ingrédients alcoolisés')).toBeInTheDocument();
    });

    it('message générique si l’API ne précise rien', async () => {
      const { user } = await ouvrir();
      api.put.mockRejectedValue(new Error('Network Error'));
      await user.click(screen.getAllByRole('button', { name: 'Sauvegarder' })[0]);
      expect(await screen.findByText('Erreur lors de la modification')).toBeInTheDocument();
    });

    it('renvoie vers /login si le token disparaît avant l’envoi', async () => {
      const { user } = await ouvrir();
      localStorage.removeItem('token');
      await user.click(screen.getAllByRole('button', { name: 'Sauvegarder' })[0]);
      expect(emplacement()).toBe('/login');
    });
  });

  describe('suppression du cocktail', () => {
    it('supprime après confirmation et revient à l’accueil', async () => {
      const { user } = await ouvrir();
      await user.click(screen.getAllByRole('button', { name: 'Supprimer' })[0]);
      expect(api.delete).toHaveBeenCalledWith('/api/cocktail/COK-00001', expect.any(Object));
      await waitFor(() => expect(emplacement()).toBe('/'));
    });

    it('ne fait rien si on annule', async () => {
      const { user } = await ouvrir();
      vi.mocked(window.confirm).mockReturnValue(false);
      await user.click(screen.getAllByRole('button', { name: 'Supprimer' })[0]);
      expect(api.delete).not.toHaveBeenCalled();
    });

    it('affiche une erreur si la suppression échoue', async () => {
      const { user } = await ouvrir();
      api.delete.mockRejectedValue(erreurApi(403));
      await user.click(screen.getAllByRole('button', { name: 'Supprimer' })[0]);
      expect(await screen.findByText('Erreur lors de la suppression')).toBeInTheDocument();
    });

    it('renvoie vers /login sans token', async () => {
      const { user } = await ouvrir();
      localStorage.removeItem('token');
      await user.click(screen.getAllByRole('button', { name: 'Supprimer' })[0]);
      expect(emplacement()).toBe('/login');
    });
  });

  describe('étapes', () => {
    it('ajoute une étape via la boîte de saisie', async () => {
      const { user } = await ouvrir();
      vi.mocked(window.prompt).mockReturnValue('Servir bien frais');
      api.post.mockResolvedValue({ data: { idetape: 'ETP-00003', numeroetape: 3, descriptionetape: 'Servir bien frais' } });
      await user.click(screen.getByRole('button', { name: '+ Ajouter une étape' }));
      expect(api.post).toHaveBeenCalledWith('/api/cocktail/COK-00001/etape', { descriptionetape: 'Servir bien frais' }, expect.any(Object));
      expect(await screen.findByText('Étape 3')).toBeInTheDocument();
    });

    it.each([null, 'abc'])('refuse une description vide ou trop courte (%p)', async (saisie) => {
      const { user } = await ouvrir();
      vi.mocked(window.prompt).mockReturnValue(saisie);
      await user.click(screen.getByRole('button', { name: '+ Ajouter une étape' }));
      expect(window.alert).toHaveBeenCalledWith('La description doit faire au moins 5 caractères');
      expect(api.post).not.toHaveBeenCalled();
    });

    it('signale une erreur de l’API à l’ajout d’étape', async () => {
      const { user } = await ouvrir();
      vi.mocked(window.prompt).mockReturnValue('Servir bien frais');
      api.post.mockRejectedValue(erreurApi(403, 'Non autorisé'));
      await user.click(screen.getByRole('button', { name: '+ Ajouter une étape' }));
      await waitFor(() => expect(window.alert).toHaveBeenCalledWith('Non autorisé'));
    });

    it('message générique si l’ajout d’étape échoue sans détail', async () => {
      const { user } = await ouvrir();
      vi.mocked(window.prompt).mockReturnValue('Servir bien frais');
      api.post.mockRejectedValue(new Error('Network Error'));
      await user.click(screen.getByRole('button', { name: '+ Ajouter une étape' }));
      await waitFor(() => expect(window.alert).toHaveBeenCalledWith('Erreur lors de l\'ajout de l\'étape'));
    });

    it('modifie le texte d’une étape et la sauvegarde', async () => {
      const { user } = await ouvrir();
      const champ = screen.getByDisplayValue('Piler la menthe');
      await user.clear(champ);
      await user.type(champ, 'Piler doucement la menthe');
      await user.click(etape(1).getByRole('button', { name: 'Sauvegarder étape' }));
      expect(api.put).toHaveBeenCalledWith('/api/cocktail/etape/ETP-00001', { descriptionetape: 'Piler doucement la menthe' }, expect.any(Object));
      await waitFor(() => expect(window.alert).toHaveBeenCalledWith('Étape sauvegardée !'));
    });

    it('supprime une étape après confirmation, rien si on annule', async () => {
      const { user } = await ouvrir();
      vi.mocked(window.confirm).mockReturnValueOnce(false);
      await user.click(etape(2).getByRole('button', { name: 'Supprimer étape' }));
      expect(api.delete).not.toHaveBeenCalled();
      await user.click(etape(2).getByRole('button', { name: 'Supprimer étape' }));
      expect(api.delete).toHaveBeenCalledWith('/api/cocktail/etape/ETP-00002', expect.any(Object));
      await waitFor(() => expect(screen.queryByText('Étape 2')).not.toBeInTheDocument());
    });
  });

  describe('ingrédients d’une étape', () => {
    it('modifie la quantité et l’unité d’un dosage', async () => {
      const { user } = await ouvrir();
      const quantite = screen.getByDisplayValue('6');
      await user.clear(quantite);
      await user.type(quantite, '8');
      await user.selectOptions(screen.getByDisplayValue('feuille'), 'pincée');
      await user.click(etape(1).getByRole('button', { name: 'Sauvegarder' }));
      expect(api.put).toHaveBeenCalledWith('/api/cocktail/COK-00001/dosage/ING-00001', { quantite: 8, unite: 'pincée' }, expect.any(Object));
      await waitFor(() => expect(window.alert).toHaveBeenCalledWith('Ingrédient sauvegardé !'));
    });

    it('la recherche d’une étape n’ouvre pas la liste des autres étapes', async () => {
      const { user } = await ouvrir();
      await user.type(etape(1).getByPlaceholderText('Rechercher un ingrédient...'), 'rh');
      expect(etape(1).getByText('Rhum')).toBeInTheDocument();
      expect(etape(2).queryByText('Rhum')).not.toBeInTheDocument();
      expect(etape(2).getByPlaceholderText('Rechercher un ingrédient...')).toHaveValue('');
    });

    it('ajoute un ingrédient à l’étape avec l’unité par défaut', async () => {
      const { user } = await ouvrir();
      await user.type(etape(2).getByPlaceholderText('Rechercher un ingrédient...'), 'rh');
      await user.click(etape(2).getByText('Rhum'));
      expect(api.post).toHaveBeenCalledWith(
        '/api/cocktail/COK-00001/dosage',
        { idingredient: 'ING-00002', quantite: 1, unite: 'cl', idetape: 'ETP-00002' },
        expect.any(Object),
      );
      await waitFor(() => expect(window.location.reload).toHaveBeenCalled());
    });

    it('affiche le refus de l’API (unités différentes)', async () => {
      const { user } = await ouvrir();
      api.post.mockRejectedValue(erreurApi(409, 'Cet ingrédient est déjà dosé en « feuille »'));
      await user.type(etape(2).getByPlaceholderText('Rechercher un ingrédient...'), 'men');
      await user.click(etape(2).getByText('Menthe'));
      expect(await screen.findByText('Cet ingrédient est déjà dosé en « feuille »')).toBeInTheDocument();
      expect(window.location.reload).not.toHaveBeenCalled();
    });

    it('message générique si l’ajout échoue sans détail', async () => {
      const { user } = await ouvrir();
      api.post.mockRejectedValue(new Error('Network Error'));
      await user.type(etape(2).getByPlaceholderText('Rechercher un ingrédient...'), 'rh');
      await user.click(etape(2).getByText('Rhum'));
      expect(await screen.findByText('Erreur lors de l\'ajout de l\'ingrédient')).toBeInTheDocument();
    });

    it('crée un nouvel ingrédient dans la bonne catégorie puis l’ajoute à l’étape', async () => {
      const { user } = await ouvrir();
      api.post
        .mockResolvedValueOnce({ data: { idingredient: 'ING-00099', nomingredient: 'Basilic', categorie: 'fruit' } })
        .mockResolvedValueOnce({ data: {} });
      await user.type(etape(2).getByPlaceholderText('Rechercher un ingrédient...'), 'Basilic');
      await user.selectOptions(etape(2).getByDisplayValue('autre'), 'fruit');
      await user.click(etape(2).getByRole('button', { name: '+ Ajouter "Basilic"' }));
      expect(api.post).toHaveBeenNthCalledWith(1, '/api/cocktail/listes/ingredients', { nomingredient: 'Basilic', categorie: 'fruit' }, expect.any(Object));
      await waitFor(() => expect(api.post).toHaveBeenCalledTimes(2));
      expect(api.post.mock.calls[1][0]).toBe('/api/cocktail/COK-00001/dosage');
      expect(api.post.mock.calls[1][1]).toMatchObject({ idingredient: 'ING-00099', idetape: 'ETP-00002' });
    });
  });

  describe('ustensiles d’une étape', () => {
    it('retire un ustensile', async () => {
      const { user } = await ouvrir();
      await user.click(etape(1).getByRole('button', { name: 'Supprimer' }));
      expect(api.delete).toHaveBeenCalledWith('/api/cocktail/etape/ETP-00001/ustensile/UST-00001', expect.any(Object));
      await waitFor(() => expect(etape(1).queryByText('Shaker')).not.toBeInTheDocument());
    });

    it('ajoute un ustensile existant', async () => {
      const { user } = await ouvrir();
      await user.type(etape(2).getByPlaceholderText('Rechercher un ustensile...'), 'sha');
      await user.click(etape(2).getByText('Shaker'));
      expect(api.post).toHaveBeenCalledWith('/api/cocktail/etape/ustensile', { idetape: 'ETP-00002', idustensile: 'UST-00001' }, expect.any(Object));
      await waitFor(() => expect(window.location.reload).toHaveBeenCalled());
    });

    it('crée un nouvel ustensile puis l’ajoute', async () => {
      const { user } = await ouvrir();
      api.post.mockResolvedValueOnce({ data: { idustensile: 'UST-00099', nomustensile: 'Pilon' } });
      await user.type(etape(2).getByPlaceholderText('Rechercher un ustensile...'), 'Pilon');
      expect(etape(2).getByText('Aucun résultat pour "Pilon"')).toBeInTheDocument();
      await user.click(etape(2).getByRole('button', { name: '+ Ajouter "Pilon"' }));
      expect(api.post).toHaveBeenNthCalledWith(1, '/api/cocktail/listes/ustensiles', { nomustensile: 'Pilon' }, expect.any(Object));
      await waitFor(() =>
        expect(api.post).toHaveBeenCalledWith('/api/cocktail/etape/ustensile', { idetape: 'ETP-00002', idustensile: 'UST-00099' }, expect.any(Object)),
      );
    });
  });
});
