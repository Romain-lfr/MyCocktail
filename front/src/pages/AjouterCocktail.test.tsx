import { describe, expect, it, vi } from 'vitest';
import { screen, waitFor, within } from '@testing-library/react';
import AjouterCocktail from './AjouterCocktail';
import { api, connecter, emplacement, erreurApi, rendre } from '../test/utils';

const ingredients = [
  { idingredient: 'ING-00001', nomingredient: 'Menthe', categorie: 'autre' },
  { idingredient: 'ING-00002', nomingredient: 'Mangue', categorie: 'fruit' },
  { idingredient: 'ING-00003', nomingredient: 'Rhum', categorie: 'alcool' },
  { idingredient: 'ING-00004', nomingredient: 'Sirop', categorie: 'sirop' },
];
const ustensiles = [{ idustensile: 'UST-00001', nomustensile: 'Shaker' }];

type U = ReturnType<typeof rendre>['user'];

function repondre() {
  api.get.mockImplementation((url: string) =>
    Promise.resolve({ data: url.endsWith('/ingredients') ? ingredients : ustensiles }),
  );
  api.post.mockImplementation((url: string) => {
    if (url === '/api/cocktail') return Promise.resolve({ data: { idcocktail: 'COK-00010' } });
    if (url.endsWith('/etape')) return Promise.resolve({ data: { idetape: 'ETP-00010' } });
    return Promise.resolve({ data: {} });
  });
}

function ouvrir() {
  repondre();
  return rendre(<AjouterCocktail />, { route: '/cocktail/ajouter', depuis: '/compte/cocktails' });
}

async function remplirInfos(user: U, { nom = 'Mojito maison', description = 'Menthe, citron et beaucoup de glace' } = {}) {
  if (nom) await user.type(screen.getByLabelText('Nom du cocktail'), nom);
  if (description) await user.type(screen.getByLabelText('Description'), description);
}

// Passe l'étape 1 et arrive sur l'écran des étapes
async function allerAuxEtapes(user: U) {
  await remplirInfos(user);
  await user.click(screen.getByRole('button', { name: 'Suivant → Ajouter les étapes' }));
  await screen.findByRole('heading', { name: /Étapes du cocktail/ });
}

async function ajouterEtape(user: U, description = 'Piler la menthe') {
  await user.click(screen.getByRole('button', { name: '+ Ajouter une étape' }));
  const champs = screen.getAllByLabelText(/^Description de l'étape/);
  if (description) await user.type(champs[champs.length - 1], description);
}

describe('AjouterCocktail', () => {
  describe('étape 1 : informations', () => {
    it('valide les champs avant d’appeler l’API', async () => {
      connecter();
      const { user } = ouvrir();
      await remplirInfos(user, { nom: 'M', description: 'Court' });
      await user.clear(screen.getByLabelText('Durée'));
      await user.click(screen.getByRole('button', { name: 'Suivant → Ajouter les étapes' }));
      expect(screen.getByLabelText('Nom du cocktail')).toHaveAttribute('aria-invalid', 'true');
      expect(screen.getByText('Le nom doit faire au moins 2 caractères')).toBeInTheDocument();
      expect(screen.getByText('La description doit faire au moins 10 caractères')).toBeInTheDocument();
      expect(screen.getByText('La durée doit être positive')).toBeInTheDocument();
      expect(api.post).not.toHaveBeenCalled();
    });

    it('renvoie vers /login si non connecté', async () => {
      const { user } = ouvrir();
      await remplirInfos(user);
      await user.click(screen.getByRole('button', { name: 'Suivant → Ajouter les étapes' }));
      expect(emplacement()).toBe('/login');
    });

    it('crée le cocktail avec les valeurs saisies puis passe aux étapes', async () => {
      connecter();
      const { user } = ouvrir();
      await remplirInfos(user);
      await user.click(screen.getByRole('button', { name: 'Difficile' }));
      expect(screen.getByRole('button', { name: 'Difficile' })).toHaveAttribute('aria-pressed', 'true');
      await user.click(screen.getByRole('button', { name: 'Avec alcool' }));
      await user.clear(screen.getByLabelText('Durée'));
      await user.type(screen.getByLabelText('Durée'), '8');
      await user.click(screen.getByRole('button', { name: 'Suivant → Ajouter les étapes' }));

      expect(api.post).toHaveBeenCalledWith(
        '/api/cocktail',
        { nomcocktail: 'Mojito maison', description: 'Menthe, citron et beaucoup de glace', difficulte: 'Difficile', alcool: true, duree: 8 },
        expect.any(Object),
      );
      expect(await screen.findByRole('heading', { name: /Étapes du cocktail/ })).toBeInTheDocument();
    });

    it('envoie l’image choisie', async () => {
      connecter();
      const { user } = ouvrir();
      await remplirInfos(user);
      const fichier = new File(['img'], 'mojito.png', { type: 'image/png' });
      await user.upload(screen.getByLabelText('Choisir une photo'), fichier);
      expect(screen.getByText('mojito.png')).toBeInTheDocument();
      await user.click(screen.getByRole('button', { name: 'Suivant → Ajouter les étapes' }));
      await screen.findByRole('heading', { name: /Étapes du cocktail/ });

      const envoi = api.post.mock.calls.find((c) => c[0] === '/api/cocktail/COK-00010/image')!;
      expect((envoi[1] as FormData).get('image')).toBe(fichier);
      expect(envoi[2]).toMatchObject({ headers: { 'Content-Type': 'multipart/form-data' } });
    });

    it('affiche l’erreur de l’API et reste sur l’étape 1', async () => {
      connecter();
      const { user } = ouvrir();
      api.post.mockRejectedValue(erreurApi(403, 'Les mineurs ne peuvent pas créer de cocktails alcoolisés'));
      await remplirInfos(user);
      await user.click(screen.getByRole('button', { name: 'Suivant → Ajouter les étapes' }));
      expect(await screen.findByRole('alert')).toHaveTextContent('Les mineurs ne peuvent pas créer de cocktails alcoolisés');
    });

    it('message générique si l’API ne précise rien', async () => {
      connecter();
      const { user } = ouvrir();
      api.post.mockRejectedValue(new Error('Network Error'));
      await remplirInfos(user);
      await user.click(screen.getByRole('button', { name: 'Suivant → Ajouter les étapes' }));
      expect(await screen.findByText('Erreur lors de l\'ajout des étapes')).toBeInTheDocument();
    });

    it('mineur : « Avec alcool » est désactivé et expliqué', () => {
      connecter({ estMineur: true });
      ouvrir();
      const avec = screen.getByRole('button', { name: 'Avec alcool' });
      expect(avec).toBeDisabled();
      expect(avec).toHaveAccessibleDescription('Réservé aux majeurs.');
      expect(screen.getByRole('button', { name: 'Sans alcool' })).toHaveAttribute('aria-pressed', 'true');
    });

    it('indique l’étape en cours dans la progression', async () => {
      connecter();
      const { user } = ouvrir();
      const progression = () => within(screen.getByRole('list', { name: 'Progression' }));
      expect(progression().getByText(/Informations/)).toHaveAttribute('aria-current', 'step');
      await allerAuxEtapes(user);
      expect(progression().getByText(/Étapes/)).toHaveAttribute('aria-current', 'step');
      expect(progression().getByText(/Informations/)).not.toHaveAttribute('aria-current');
      expect(screen.getByText(/Décris la préparation étape par étape/)).toBeInTheDocument();
    });

    it('met à jour l’aperçu de la carte pendant la saisie', async () => {
      const { user } = ouvrir();
      const apercu = within(screen.getByRole('complementary', { name: 'Aperçu de la carte' }));
      expect(apercu.getByText('Nom du cocktail')).toBeInTheDocument();
      expect(apercu.getByText('Sans alcool')).toBeInTheDocument();
      await remplirInfos(user);
      await user.click(screen.getByRole('button', { name: 'Moyen' }));
      await user.click(screen.getByRole('button', { name: 'Avec alcool' }));
      expect(apercu.getByText('Mojito maison')).toBeInTheDocument();
      expect(apercu.getByText('Menthe, citron et beaucoup de glace')).toBeInTheDocument();
      expect(apercu.getByText('Moyen')).toBeInTheDocument();
      expect(apercu.getByText('Alcool')).toBeInTheDocument();
    });

    it('montre la photo choisie dans l’aperçu', async () => {
      const creer = vi.fn(() => 'blob:apercu');
      const liberer = vi.fn();
      Object.assign(URL, { createObjectURL: creer, revokeObjectURL: liberer });
      try {
        const { user, unmount } = ouvrir();
        await user.upload(screen.getByLabelText('Choisir une photo'), new File(['img'], 'mojito.png', { type: 'image/png' }));
        expect(await screen.findByAltText('Aperçu de la photo')).toHaveAttribute('src', 'blob:apercu');
        unmount();
        expect(liberer).toHaveBeenCalledWith('blob:apercu');
      } finally {
        Object.assign(URL, { createObjectURL: undefined, revokeObjectURL: undefined });
      }
    });

    it('Retour revient à la page précédente', async () => {
      const { user } = ouvrir();
      await user.click(screen.getByRole('button', { name: '← Retour' }));
      expect(emplacement()).toBe('/compte/cocktails');
    });
  });

  describe('étape 2 : étapes, ingrédients, ustensiles', () => {
    it.each([
      ['Menthe', 'morceau', ['morceau', 'feuille', 'pincée', 'g']],
      ['Mangue', 'pièce', ['pièce', 'tranche', 'g']],
      ['Sirop', 'cl', ['cl', 'ml', 'l']],
    ])('ajoute %s avec l’unité par défaut %s et les bonnes unités', async (nom, unite, unites) => {
      connecter();
      const { user } = ouvrir();
      await allerAuxEtapes(user);
      await ajouterEtape(user);
      await user.type(screen.getByRole('textbox', { name: /Rechercher un ingrédient/ }), nom.slice(0, 3));
      await user.click(screen.getByText(nom));
      expect(screen.getByRole('textbox', { name: /Rechercher un ingrédient/ })).toHaveValue('');
      const select = screen.getByRole('combobox', { name: `Unité de ${nom}` }) as HTMLSelectElement;
      expect(select).toHaveValue(unite);
      expect(Array.from(select.options).map((o) => o.value)).toEqual(unites);
    });

    it('crée tout dans l’ordre : étape, dosages, ustensiles, puis ouvre la fiche', async () => {
      connecter();
      const { user } = ouvrir();
      await allerAuxEtapes(user);
      await ajouterEtape(user, 'Piler la menthe');
      await user.type(screen.getByRole('textbox', { name: /Rechercher un ingrédient/ }), 'men');
      await user.click(screen.getByText('Menthe'));
      const quantite = screen.getByRole('spinbutton', { name: 'Quantité de Menthe' });
      await user.clear(quantite);
      await user.type(quantite, '6');
      await user.selectOptions(screen.getByRole('combobox', { name: 'Unité de Menthe' }), 'feuille');
      await user.type(screen.getByRole('textbox', { name: /Rechercher un ustensile/ }), 'sha');
      await user.click(screen.getByText('Shaker'));
      await user.click(screen.getByRole('button', { name: 'Publier' }));

      await waitFor(() => expect(emplacement()).toBe('/cocktail/Mojito%20maison'));
      const appels = api.post.mock.calls.slice(1).map((c) => [c[0], c[1]]);
      expect(appels).toEqual([
        ['/api/cocktail/COK-00010/etape', { numeroetape: 1, descriptionetape: 'Piler la menthe' }],
        ['/api/cocktail/COK-00010/dosage', { idingredient: 'ING-00001', quantite: 6, unite: 'feuille', idetape: 'ETP-00010' }],
        ['/api/cocktail/etape/ustensile', { idetape: 'ETP-00010', idustensile: 'UST-00001' }],
      ]);
      expect(api.put).toHaveBeenCalledWith('/api/cocktail/COK-00010', {
        nomcocktail: 'Mojito maison', description: 'Menthe, citron et beaucoup de glace',
        difficulte: 'Facile', alcool: false, duree: 1, statut: 'publi_',
      }, expect.any(Object));
    });

    it('« Continuer plus tard » enregistre les étapes, reste en brouillon et mène à Mes cocktails', async () => {
      connecter();
      const { user } = ouvrir();
      await allerAuxEtapes(user);
      await ajouterEtape(user, 'Piler la menthe');
      await user.click(screen.getByRole('button', { name: 'Continuer plus tard' }));
      await waitFor(() => expect(emplacement()).toBe('/compte/cocktails'));
      expect(api.post).toHaveBeenCalledWith('/api/cocktail/COK-00010/etape', { numeroetape: 1, descriptionetape: 'Piler la menthe' }, expect.any(Object));
      expect(api.put).not.toHaveBeenCalled();
    });

    it('sans étape : « Publier » et « Publier en privé » sont bloqués, « Continuer plus tard » reste possible', async () => {
      connecter();
      const { user } = ouvrir();
      await allerAuxEtapes(user);
      for (const nom of ['Publier', 'Publier en privé']) {
        const bouton = screen.getByRole('button', { name: nom });
        expect(bouton).toBeDisabled();
        expect(bouton).toHaveAccessibleDescription('Ajoute au moins une étape pour pouvoir publier, même en privé.');
      }
      expect(screen.getByRole('button', { name: 'Continuer plus tard' })).toBeEnabled();
      await ajouterEtape(user);
      expect(screen.getByRole('button', { name: 'Publier' })).toBeEnabled();
      expect(screen.queryByText(/Ajoute au moins une étape/)).not.toBeInTheDocument();
    });

    it('« Publier en privé » passe le cocktail en privé puis ouvre sa fiche', async () => {
      connecter();
      const { user } = ouvrir();
      await allerAuxEtapes(user);
      await ajouterEtape(user);
      await user.click(screen.getByRole('button', { name: 'Publier en privé' }));
      await waitFor(() => expect(emplacement()).toBe('/cocktail/Mojito%20maison'));
      expect(api.put).toHaveBeenCalledWith('/api/cocktail/COK-00010', expect.objectContaining({ statut: 'priv_' }), expect.any(Object));
    });

    it('les règles des étapes s’appliquent aussi à « Continuer plus tard »', async () => {
      connecter();
      const { user } = ouvrir();
      await allerAuxEtapes(user);
      await ajouterEtape(user, 'Pil');
      await user.click(screen.getByRole('button', { name: 'Continuer plus tard' }));
      expect(screen.getByRole('alert')).toHaveTextContent('L\'étape 1 doit avoir une description d\'au moins 5 caractères');
      expect(emplacement()).toBe('/cocktail/ajouter');
    });

    it('« Précédent » revient aux informations sans rien perdre, puis met à jour au lieu de recréer', async () => {
      connecter();
      const { user } = ouvrir();
      await remplirInfos(user);
      const fichier = new File(['img'], 'mojito.png', { type: 'image/png' });
      await user.upload(screen.getByLabelText('Choisir une photo'), fichier);
      await user.click(screen.getByRole('button', { name: 'Suivant → Ajouter les étapes' }));
      await screen.findByRole('heading', { name: /Étapes du cocktail/ });
      await ajouterEtape(user, 'Piler la menthe');

      await user.click(screen.getByRole('button', { name: '← Précédent' }));
      expect(screen.getByLabelText('Nom du cocktail')).toHaveValue('Mojito maison');
      await user.type(screen.getByLabelText('Nom du cocktail'), ' 2');
      await user.click(screen.getByRole('button', { name: 'Suivant → Ajouter les étapes' }));
      await screen.findByRole('heading', { name: /Étapes du cocktail/ });

      expect(screen.getByLabelText("Description de l'étape 1")).toHaveValue('Piler la menthe');
      expect(api.post.mock.calls.filter((c) => c[0] === '/api/cocktail')).toHaveLength(1);
      expect(api.post.mock.calls.filter((c) => String(c[0]).endsWith('/image'))).toHaveLength(1);
      expect(api.put).toHaveBeenCalledWith('/api/cocktail/COK-00010', expect.objectContaining({ nomcocktail: 'Mojito maison 2' }), expect.any(Object));
    });

    it('retire un ingrédient et un ustensile', async () => {
      connecter();
      const { user } = ouvrir();
      await allerAuxEtapes(user);
      await ajouterEtape(user);
      await user.type(screen.getByRole('textbox', { name: /Rechercher un ingrédient/ }), 'men');
      await user.click(screen.getByText('Menthe'));
      await user.type(screen.getByRole('textbox', { name: /Rechercher un ustensile/ }), 'sha');
      await user.click(screen.getByText('Shaker'));
      await user.click(screen.getByRole('button', { name: 'Retirer Shaker' }));
      await user.click(screen.getByRole('button', { name: 'Retirer Menthe' }));
      expect(screen.queryByText('Menthe')).not.toBeInTheDocument();
      expect(screen.queryByText('Shaker')).not.toBeInTheDocument();
    });

    it('supprimer une étape renumérote les suivantes', async () => {
      connecter();
      const { user } = ouvrir();
      await allerAuxEtapes(user);
      await ajouterEtape(user, 'Première étape');
      await ajouterEtape(user, 'Deuxième étape');
      await ajouterEtape(user, 'Troisième étape');
      await user.click(screen.getAllByRole('button', { name: /Supprimer l'étape/ })[0]);
      expect(screen.getAllByRole('heading', { level: 3 }).map((h) => h.textContent)).toEqual(['Étape 1', 'Étape 2']);
      expect(screen.getByDisplayValue('Deuxième étape')).toBeInTheDocument();
      expect(screen.queryByDisplayValue('Première étape')).not.toBeInTheDocument();
    });

    it('crée un nouvel ingrédient s’il n’existe pas', async () => {
      connecter();
      const { user } = ouvrir();
      await allerAuxEtapes(user);
      await ajouterEtape(user);
      api.post.mockResolvedValueOnce({ data: { idingredient: 'ING-00099', nomingredient: 'Basilic', categorie: 'fruit' } });
      await user.type(screen.getByRole('textbox', { name: /Rechercher un ingrédient/ }), 'Basilic');
      expect(screen.getByText('Aucun résultat pour « Basilic »')).toBeInTheDocument();
      await user.selectOptions(screen.getByLabelText('Catégorie'), 'fruit');
      await user.click(screen.getByRole('button', { name: '+ Créer « Basilic »' }));
      expect(api.post).toHaveBeenCalledWith('/api/cocktail/listes/ingredients', { nomingredient: 'Basilic', categorie: 'fruit' }, expect.any(Object));
      expect(await screen.findByText('Basilic')).toBeInTheDocument();
      expect(screen.getByRole('combobox', { name: 'Unité de Basilic' })).toHaveValue('pièce');
      // l'unité est bien enregistrée (pas seulement affichée) : c'est elle qui part à l'API
      await user.click(screen.getByRole('button', { name: 'Publier' }));
      await waitFor(() => expect(api.post).toHaveBeenCalledWith(
        '/api/cocktail/COK-00010/dosage', expect.objectContaining({ idingredient: 'ING-00099', unite: 'pièce' }), expect.any(Object),
      ));
    });

    it('crée un nouvel ustensile s’il n’existe pas', async () => {
      connecter();
      const { user } = ouvrir();
      await allerAuxEtapes(user);
      await ajouterEtape(user);
      api.post.mockResolvedValueOnce({ data: { idustensile: 'UST-00099', nomustensile: 'Pilon' } });
      await user.type(screen.getByRole('textbox', { name: /Rechercher un ustensile/ }), 'Pilon');
      await user.click(screen.getByRole('button', { name: '+ Créer « Pilon »' }));
      expect(api.post).toHaveBeenCalledWith('/api/cocktail/listes/ustensiles', { nomustensile: 'Pilon' }, expect.any(Object));
      expect(await screen.findByText('Pilon')).toBeInTheDocument();
    });

    it('refuse une étape de moins de 5 caractères', async () => {
      connecter();
      const { user } = ouvrir();
      await allerAuxEtapes(user);
      await ajouterEtape(user, 'Pil');
      await user.click(screen.getByRole('button', { name: 'Publier' }));
      expect(screen.getByText('L\'étape 1 doit avoir une description d\'au moins 5 caractères')).toBeInTheDocument();
      expect(api.post).toHaveBeenCalledTimes(1); // seulement la création du cocktail
    });

    it('bloque un ingrédient alcoolisé pour un mineur', async () => {
      connecter({ estMineur: true });
      const { user } = ouvrir();
      await allerAuxEtapes(user);
      await ajouterEtape(user);
      await user.type(screen.getByRole('textbox', { name: /Rechercher un ingrédient/ }), 'rhu');
      await user.click(screen.getByText('Rhum'));
      await user.click(screen.getByRole('button', { name: 'Publier' }));
      expect(screen.getByText('Impossible d\'ajouter des ingrédients alcoolisés en tant que mineur')).toBeInTheDocument();
      expect(api.post).toHaveBeenCalledTimes(1);
    });

    it('désactive « Terminer » pendant l’enregistrement', async () => {
      connecter();
      const { user } = ouvrir();
      await allerAuxEtapes(user);
      await ajouterEtape(user);
      api.post.mockReturnValueOnce(new Promise(() => {}));
      await user.click(screen.getByRole('button', { name: 'Publier' }));
      expect(screen.getByRole('button', { name: 'Enregistrement…' })).toBeDisabled();
    });

    it('affiche l’erreur de l’API pendant l’enregistrement des étapes', async () => {
      connecter();
      const { user } = ouvrir();
      await allerAuxEtapes(user);
      await ajouterEtape(user);
      api.post.mockRejectedValueOnce(erreurApi(403, 'Non autorisé'));
      await user.click(screen.getByRole('button', { name: 'Publier' }));
      expect(await screen.findByText('Non autorisé')).toBeInTheDocument();
      expect(emplacement()).toBe('/cocktail/ajouter');
    });

    it('message générique si l’enregistrement échoue sans détail', async () => {
      connecter();
      const { user } = ouvrir();
      await allerAuxEtapes(user);
      await ajouterEtape(user);
      api.post.mockRejectedValueOnce(new Error('Network Error'));
      await user.click(screen.getByRole('button', { name: 'Publier' }));
      expect(await screen.findByText('Erreur lors de l\'ajout des étapes')).toBeInTheDocument();
    });

    it('renvoie vers /login si le token disparaît avant l’enregistrement', async () => {
      connecter();
      const { user } = ouvrir();
      await allerAuxEtapes(user);
      await ajouterEtape(user);
      localStorage.removeItem('token');
      await user.click(screen.getByRole('button', { name: 'Publier' }));
      expect(emplacement()).toBe('/login');
    });
  });
});
