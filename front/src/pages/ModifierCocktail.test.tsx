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
const etape = (n: number) => within(screen.getByRole('listitem', { name: `Étape ${n}` }));
const enregistrer = () => screen.getByRole('button', { name: 'Enregistrer les modifications' });
const supprimerCocktail = () => screen.getByRole('button', { name: 'Supprimer le cocktail' });

describe('ModifierCocktail', () => {
  describe('chargement', () => {
    it('renvoie vers /login sans token', () => {
      rendre(<ModifierCocktail />, { route: '/cocktail/Mojito/modifier', path: '/cocktail/:nom/modifier' });
      expect(emplacement()).toBe('/login');
    });

    it('pré-remplit le formulaire, statut compris', async () => {
      await ouvrir();
      expect(screen.getByLabelText('Nom du cocktail')).toHaveValue('Mojito');
      expect(screen.getByRole('button', { name: 'Moyen' })).toHaveAttribute('aria-pressed', 'true');
      expect(screen.getByRole('button', { name: 'Brouillon' })).toHaveAttribute('aria-pressed', 'true');
      expect(screen.getByText('Visible par toi seul·e, le temps de la peaufiner.')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Avec alcool' })).toHaveAttribute('aria-pressed', 'true');
      expect(screen.getByLabelText('Durée')).toHaveValue(5);
      expect(screen.getByLabelText("Description de l'étape 1")).toHaveValue('Piler la menthe');
      expect(etape(1).getByLabelText('Quantité de Menthe')).toHaveValue(6);
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

    it('mineur : « Avec alcool » est désactivé', async () => {
      connecter({ estMineur: true });
      repondre({ ...cocktail, alcool: false });
      rendre(<ModifierCocktail />, { route: '/cocktail/Mojito/modifier', path: '/cocktail/:nom/modifier' });
      await screen.findByDisplayValue('Le classique cubain');
      expect(screen.getByRole('button', { name: 'Avec alcool' })).toBeDisabled();
      expect(screen.getByText('Réservé aux majeurs.')).toBeInTheDocument();
    });
  });

  describe('informations et statut', () => {
    it('publie le cocktail (statut publi_) et revient à mes cocktails', async () => {
      const { user } = await ouvrir();
      await user.click(screen.getByRole('button', { name: 'Publié' }));
      expect(screen.getByText("Visible par tout le monde sur l'accueil.")).toBeInTheDocument();
      await user.click(screen.getByRole('button', { name: 'Facile' }));
      await user.click(screen.getByRole('button', { name: 'Sans alcool' }));
      await user.click(enregistrer());
      expect(api.put).toHaveBeenCalledWith(
        '/api/cocktail/COK-00001',
        { nomcocktail: 'Mojito', description: 'Le classique cubain', difficulte: 'Facile', alcool: false, duree: 5, statut: 'publi_' },
        expect.any(Object),
      );
      await waitFor(() => expect(emplacement()).toBe('/compte/cocktails'));
    });

    it.each([['Privé', 'priv_'], ['Archivé', 'archiv_']])('statut « %s » envoie %s', async (libelle, valeur) => {
      const { user } = await ouvrir();
      await user.click(screen.getByRole('button', { name: libelle }));
      await user.click(enregistrer());
      expect(api.put).toHaveBeenCalledWith('/api/cocktail/COK-00001', expect.objectContaining({ statut: valeur }), expect.any(Object));
    });

    it('sans étape : Publié et Privé sont bloqués et expliqués', async () => {
      connecter();
      repondre({ ...cocktail, etape: [] });
      rendre(<ModifierCocktail />, { route: '/cocktail/Mojito/modifier', path: '/cocktail/:nom/modifier' });
      await screen.findByDisplayValue('Le classique cubain');
      for (const nom of ['Publié', 'Privé']) {
        expect(screen.getByRole('button', { name: nom })).toBeDisabled();
        expect(screen.getByRole('button', { name: nom })).toHaveAccessibleDescription('Ajoute au moins une étape pour publier, même en privé.');
      }
      expect(screen.getByRole('button', { name: 'Archivé' })).toBeEnabled();
    });

    it('cocktail déjà publié sans étape : refuse d’enregistrer tant qu’il reste publié', async () => {
      connecter();
      repondre({ ...cocktail, statut: 'publi_', etape: [] });
      const { user } = rendre(<ModifierCocktail />, { route: '/cocktail/Mojito/modifier', path: '/cocktail/:nom/modifier' });
      await screen.findByDisplayValue('Le classique cubain');
      expect(screen.getByRole('button', { name: 'Publié' })).toBeEnabled(); // pour pouvoir en sortir
      await user.click(enregistrer());
      expect(screen.getByRole('alert')).toHaveTextContent('Ajoute au moins une étape avant de publier le cocktail');
      expect(api.put).not.toHaveBeenCalled();
      await user.click(screen.getByRole('button', { name: 'Brouillon' }));
      await user.click(enregistrer());
      expect(api.put).toHaveBeenCalledWith('/api/cocktail/COK-00001', expect.objectContaining({ statut: 'brouillon' }), expect.any(Object));
    });

    it('valide les champs avant d’appeler l’API', async () => {
      const { user } = await ouvrir();
      await user.clear(screen.getByLabelText('Nom du cocktail'));
      await user.type(screen.getByLabelText('Nom du cocktail'), 'M');
      await user.clear(screen.getByLabelText('Description'));
      await user.clear(screen.getByLabelText('Durée'));
      await user.click(enregistrer());
      expect(screen.getByLabelText('Nom du cocktail')).toHaveAccessibleDescription('Le nom doit faire au moins 2 caractères');
      expect(screen.getByLabelText('Description')).toHaveAccessibleDescription('La description doit faire au moins 10 caractères');
      expect(screen.getByLabelText('Durée')).toHaveAccessibleDescription('La durée doit être positive');
      expect(api.put).not.toHaveBeenCalled();
    });

    it('affiche l’erreur de l’API (ex. ingrédients alcoolisés restants)', async () => {
      const { user } = await ouvrir();
      api.put.mockRejectedValue(erreurApi(409, 'Retire d\'abord les ingrédients alcoolisés'));
      await user.click(enregistrer());
      expect(await screen.findByRole('alert')).toHaveTextContent('Retire d\'abord les ingrédients alcoolisés');
    });

    it('message générique si l’API ne précise rien', async () => {
      const { user } = await ouvrir();
      api.put.mockRejectedValue(new Error('Network Error'));
      await user.click(enregistrer());
      expect(await screen.findByText('Erreur lors de la modification')).toBeInTheDocument();
    });

    it('renvoie vers /login si le token disparaît avant l’envoi', async () => {
      const { user } = await ouvrir();
      localStorage.removeItem('token');
      await user.click(enregistrer());
      expect(emplacement()).toBe('/login');
    });
  });

  describe('suppression du cocktail', () => {
    it('supprime après confirmation et revient à l’accueil', async () => {
      const { user } = await ouvrir();
      await user.click(supprimerCocktail());
      expect(api.delete).toHaveBeenCalledWith('/api/cocktail/COK-00001', expect.any(Object));
      await waitFor(() => expect(emplacement()).toBe('/'));
    });

    it('ne fait rien si on annule', async () => {
      const { user } = await ouvrir();
      vi.mocked(window.confirm).mockReturnValue(false);
      await user.click(supprimerCocktail());
      expect(api.delete).not.toHaveBeenCalled();
    });

    it('affiche une erreur si la suppression échoue', async () => {
      const { user } = await ouvrir();
      api.delete.mockRejectedValue(erreurApi(403));
      await user.click(supprimerCocktail());
      expect(await screen.findByText('Erreur lors de la suppression')).toBeInTheDocument();
    });

    it('renvoie vers /login sans token', async () => {
      const { user } = await ouvrir();
      localStorage.removeItem('token');
      await user.click(supprimerCocktail());
      expect(emplacement()).toBe('/login');
    });
  });

  describe('étapes', () => {
    const ouvrirNouvelleEtape = async (user: Awaited<ReturnType<typeof ouvrir>>['user'], texte: string) => {
      await user.click(screen.getByRole('button', { name: '+ Ajouter une étape' }));
      if (texte) await user.type(screen.getByLabelText('Description de la nouvelle étape'), texte);
      await user.click(screen.getByRole('button', { name: "Ajouter l'étape" }));
    };

    it('ajoute une étape via le formulaire intégré', async () => {
      const { user } = await ouvrir();
      api.post.mockResolvedValue({ data: { idetape: 'ETP-00003', numeroetape: 3, descriptionetape: 'Servir bien frais' } });
      await ouvrirNouvelleEtape(user, 'Servir bien frais');
      expect(api.post).toHaveBeenCalledWith('/api/cocktail/COK-00001/etape', { descriptionetape: 'Servir bien frais' }, expect.any(Object));
      expect(await screen.findByRole('listitem', { name: 'Étape 3' })).toBeInTheDocument();
      expect(screen.queryByLabelText('Description de la nouvelle étape')).not.toBeInTheDocument();
      expect(window.prompt).not.toHaveBeenCalled();
    });

    it.each(['', 'abc'])('refuse une description vide ou trop courte (%p)', async (saisie) => {
      const { user } = await ouvrir();
      await ouvrirNouvelleEtape(user, saisie);
      expect(screen.getByLabelText('Description de la nouvelle étape')).toHaveAccessibleDescription('La description doit faire au moins 5 caractères');
      expect(api.post).not.toHaveBeenCalled();
    });

    it('Annuler ferme le formulaire sans rien envoyer', async () => {
      const { user } = await ouvrir();
      await user.click(screen.getByRole('button', { name: '+ Ajouter une étape' }));
      await user.click(screen.getByRole('button', { name: 'Annuler' }));
      expect(screen.queryByLabelText('Description de la nouvelle étape')).not.toBeInTheDocument();
      expect(api.post).not.toHaveBeenCalled();
    });

    it('signale une erreur de l’API à l’ajout d’étape', async () => {
      const { user } = await ouvrir();
      api.post.mockRejectedValue(erreurApi(403, 'Non autorisé'));
      await ouvrirNouvelleEtape(user, 'Servir bien frais');
      expect(await screen.findByText('Non autorisé')).toBeInTheDocument();
    });

    it('message générique si l’ajout d’étape échoue sans détail', async () => {
      const { user } = await ouvrir();
      api.post.mockRejectedValue(new Error('Network Error'));
      await ouvrirNouvelleEtape(user, 'Servir bien frais');
      expect(await screen.findByText('Erreur lors de l\'ajout de l\'étape')).toBeInTheDocument();
    });

    it('modifie le texte d’une étape et la sauvegarde', async () => {
      const { user } = await ouvrir();
      const champ = screen.getByLabelText("Description de l'étape 1");
      await user.clear(champ);
      await user.type(champ, 'Piler doucement la menthe');
      await user.click(etape(1).getByRole('button', { name: "Enregistrer l'étape" }));
      expect(api.put).toHaveBeenCalledWith('/api/cocktail/etape/ETP-00001', { descriptionetape: 'Piler doucement la menthe' }, expect.any(Object));
      expect(await etape(1).findByRole('status')).toHaveTextContent('Enregistré ✓');
      expect(window.alert).not.toHaveBeenCalled();
    });

    it('affiche le refus de supprimer la dernière étape d’un cocktail publié', async () => {
      const { user } = await ouvrir();
      api.delete.mockRejectedValue(erreurApi(409, 'Un cocktail publié doit garder au moins une étape'));
      await user.click(etape(2).getByRole('button', { name: "Supprimer l'étape" }));
      expect(await etape(2).findByRole('alert')).toHaveTextContent('Un cocktail publié doit garder au moins une étape');
      expect(screen.getByRole('listitem', { name: 'Étape 2' })).toBeInTheDocument();
    });

    it('message générique si la suppression d’étape échoue sans détail', async () => {
      const { user } = await ouvrir();
      api.delete.mockRejectedValue(new Error('Network Error'));
      await user.click(etape(2).getByRole('button', { name: "Supprimer l'étape" }));
      expect(await etape(2).findByRole('alert')).toHaveTextContent("Erreur lors de la suppression de l'étape");
    });

    it('supprime une étape après confirmation, rien si on annule', async () => {
      const { user } = await ouvrir();
      vi.mocked(window.confirm).mockReturnValueOnce(false);
      await user.click(etape(2).getByRole('button', { name: "Supprimer l'étape" }));
      expect(api.delete).not.toHaveBeenCalled();
      await user.click(etape(2).getByRole('button', { name: "Supprimer l'étape" }));
      expect(api.delete).toHaveBeenCalledWith('/api/cocktail/etape/ETP-00002', expect.any(Object));
      await waitFor(() => expect(screen.queryByRole('listitem', { name: 'Étape 2' })).not.toBeInTheDocument());
    });
  });

  describe('ingrédients d’une étape', () => {
    it('modifie la quantité et l’unité d’un dosage', async () => {
      const { user } = await ouvrir();
      const quantite = etape(1).getByLabelText('Quantité de Menthe');
      await user.clear(quantite);
      await user.type(quantite, '8');
      await user.selectOptions(etape(1).getByLabelText('Unité de Menthe'), 'pincée');
      await user.click(etape(1).getByRole('button', { name: 'Enregistrer Menthe' }));
      expect(api.put).toHaveBeenCalledWith('/api/cocktail/COK-00001/dosage/ING-00001', { quantite: 8, unite: 'pincée' }, expect.any(Object));
      expect(await etape(1).findByRole('status')).toHaveTextContent('Enregistré ✓');
    });

    it('retire un ingrédient après confirmation, rien si on annule', async () => {
      const { user } = await ouvrir();
      vi.mocked(window.confirm).mockReturnValueOnce(false);
      await user.click(etape(1).getByRole('button', { name: 'Retirer Menthe' }));
      expect(api.delete).not.toHaveBeenCalled();
      expect(window.confirm).toHaveBeenCalledWith('Retirer Menthe de la recette ?');

      await user.click(etape(1).getByRole('button', { name: 'Retirer Menthe' }));
      expect(api.delete).toHaveBeenCalledWith('/api/cocktail/COK-00001/dosage/ING-00001', expect.any(Object));
      await waitFor(() => expect(etape(1).queryByLabelText('Quantité de Menthe')).not.toBeInTheDocument());
      expect(window.location.reload).not.toHaveBeenCalled();
    });

    it.each([
      [erreurApi(403, 'Non autorisé'), 'Non autorisé'],
      [new Error('Network Error'), 'Erreur lors du retrait de l\'ingrédient'],
    ])('affiche l’erreur si le retrait échoue et garde l’ingrédient (%#)', async (erreur, texte) => {
      const { user } = await ouvrir();
      api.delete.mockRejectedValue(erreur);
      await user.click(etape(1).getByRole('button', { name: 'Retirer Menthe' }));
      expect(await etape(1).findByRole('alert')).toHaveTextContent(texte);
      expect(etape(1).getByLabelText('Quantité de Menthe')).toBeInTheDocument();
    });

    it('renvoie la quantité en nombre même si l’API la fournit en texte (Decimal)', async () => {
      connecter();
      const etape1 = { ...cocktail.etape[0], dosage: [{ ...cocktail.etape[0].dosage[0], quantite: '6' as unknown as number }] };
      repondre({ ...cocktail, etape: [etape1, cocktail.etape[1]] });
      const { user } = rendre(<ModifierCocktail />, { route: '/cocktail/Mojito/modifier', path: '/cocktail/:nom/modifier' });
      await screen.findByDisplayValue('Le classique cubain');
      await user.click(etape(1).getByRole('button', { name: 'Enregistrer Menthe' }));
      expect(api.put).toHaveBeenCalledWith('/api/cocktail/COK-00001/dosage/ING-00001', { quantite: 6, unite: 'feuille' }, expect.any(Object));
    });

    it('la recherche d’une étape n’ouvre pas la liste des autres étapes', async () => {
      const { user } = await ouvrir();
      await user.type(etape(1).getByRole('textbox', { name: /Rechercher un ingrédient/ }), 'rh');
      expect(etape(1).getByText('Rhum')).toBeInTheDocument();
      expect(etape(2).queryByText('Rhum')).not.toBeInTheDocument();
      expect(etape(2).getByRole('textbox', { name: /Rechercher un ingrédient/ })).toHaveValue('');
    });

    it('ajoute un ingrédient à l’étape, l’affiche sans recharger et garde les textes non enregistrés', async () => {
      const { user } = await ouvrir();
      // texte modifié mais pas encore enregistré dans l'étape 1 : il ne doit pas être perdu
      await user.type(screen.getByLabelText("Description de l'étape 1"), ' en douceur');
      const rhum = { idingredient: 'ING-00002', quantite: 1, unite: 'cl', ingredient: { nomingredient: 'Rhum' } };
      repondre({ ...cocktail, etape: [cocktail.etape[0], { ...cocktail.etape[1], dosage: [rhum] }] });
      await user.type(etape(2).getByRole('textbox', { name: /Rechercher un ingrédient/ }), 'rh');
      await user.click(etape(2).getByText('Rhum'));
      expect(api.post).toHaveBeenCalledWith(
        '/api/cocktail/COK-00001/dosage',
        { idingredient: 'ING-00002', quantite: 1, unite: 'cl', idetape: 'ETP-00002' },
        expect.any(Object),
      );
      expect(await etape(2).findByLabelText('Quantité de Rhum')).toHaveValue(1);
      expect(screen.getByLabelText("Description de l'étape 1")).toHaveValue('Piler la menthe en douceur');
      expect(window.location.reload).not.toHaveBeenCalled();
    });

    it('affiche le refus de l’API (unités différentes) dans l’étape concernée', async () => {
      const { user } = await ouvrir();
      api.post.mockRejectedValue(erreurApi(409, 'Cet ingrédient est déjà dosé en « feuille »'));
      await user.type(etape(2).getByRole('textbox', { name: /Rechercher un ingrédient/ }), 'men');
      await user.click(etape(2).getByText('Menthe'));
      expect(await etape(2).findByRole('alert')).toHaveTextContent('Cet ingrédient est déjà dosé en « feuille »');
      expect(window.location.reload).not.toHaveBeenCalled();
    });

    it('message générique si l’ajout échoue sans détail', async () => {
      const { user } = await ouvrir();
      api.post.mockRejectedValue(new Error('Network Error'));
      await user.type(etape(2).getByRole('textbox', { name: /Rechercher un ingrédient/ }), 'rh');
      await user.click(etape(2).getByText('Rhum'));
      expect(await screen.findByText('Erreur lors de l\'ajout de l\'ingrédient')).toBeInTheDocument();
    });

    it('crée un nouvel ingrédient dans la bonne catégorie puis l’ajoute à l’étape', async () => {
      const { user } = await ouvrir();
      api.post
        .mockResolvedValueOnce({ data: { idingredient: 'ING-00099', nomingredient: 'Basilic', categorie: 'fruit' } })
        .mockResolvedValueOnce({ data: {} });
      await user.type(etape(2).getByRole('textbox', { name: /Rechercher un ingrédient/ }), 'Basilic');
      await user.selectOptions(etape(2).getByLabelText('Catégorie'), 'fruit');
      await user.click(etape(2).getByRole('button', { name: '+ Créer « Basilic »' }));
      expect(api.post).toHaveBeenNthCalledWith(1, '/api/cocktail/listes/ingredients', { nomingredient: 'Basilic', categorie: 'fruit' }, expect.any(Object));
      await waitFor(() => expect(api.post).toHaveBeenCalledTimes(2));
      expect(api.post.mock.calls[1][0]).toBe('/api/cocktail/COK-00001/dosage');
      // l'unité par défaut vient de la catégorie choisie (fruit → pièce), même si la liste n'est pas encore à jour
      expect(api.post.mock.calls[1][1]).toMatchObject({ idingredient: 'ING-00099', idetape: 'ETP-00002', unite: 'pièce' });
    });
  });

  describe('ustensiles d’une étape', () => {
    it('retire un ustensile', async () => {
      const { user } = await ouvrir();
      await user.click(etape(1).getByRole('button', { name: 'Retirer Shaker' }));
      expect(api.delete).toHaveBeenCalledWith('/api/cocktail/etape/ETP-00001/ustensile/UST-00001', expect.any(Object));
      await waitFor(() => expect(etape(1).queryByText('Shaker')).not.toBeInTheDocument());
    });

    it('ajoute un ustensile existant et l’affiche sans recharger', async () => {
      const { user } = await ouvrir();
      const shaker = { idustensile: 'UST-00001', ustensile: { nomustensile: 'Shaker' } };
      repondre({ ...cocktail, etape: [cocktail.etape[0], { ...cocktail.etape[1], etape_ustensile: [shaker] }] });
      await user.type(etape(2).getByRole('textbox', { name: /Rechercher un ustensile/ }), 'sha');
      await user.click(etape(2).getByText('Shaker'));
      expect(api.post).toHaveBeenCalledWith('/api/cocktail/etape/ustensile', { idetape: 'ETP-00002', idustensile: 'UST-00001' }, expect.any(Object));
      expect(await etape(2).findByRole('button', { name: 'Retirer Shaker' })).toBeInTheDocument();
      expect(window.location.reload).not.toHaveBeenCalled();
    });

    it('crée un nouvel ustensile puis l’ajoute', async () => {
      const { user } = await ouvrir();
      api.post.mockResolvedValueOnce({ data: { idustensile: 'UST-00099', nomustensile: 'Pilon' } });
      await user.type(etape(2).getByRole('textbox', { name: /Rechercher un ustensile/ }), 'Pilon');
      expect(etape(2).getByText('Aucun résultat pour « Pilon »')).toBeInTheDocument();
      await user.click(etape(2).getByRole('button', { name: '+ Créer « Pilon »' }));
      expect(api.post).toHaveBeenNthCalledWith(1, '/api/cocktail/listes/ustensiles', { nomustensile: 'Pilon' }, expect.any(Object));
      await waitFor(() =>
        expect(api.post).toHaveBeenCalledWith('/api/cocktail/etape/ustensile', { idetape: 'ETP-00002', idustensile: 'UST-00099' }, expect.any(Object)),
      );
    });
  });
});
