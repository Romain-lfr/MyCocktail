import { describe, expect, it, vi } from 'vitest';
import { screen, waitFor, within } from '@testing-library/react';
import CocktailDetail from './CocktailDetail';
import { api, connecter, emplacement, erreurApi, imageIntrouvable, rendre } from '../test/utils';

const reponse = (id: string, idcompte: string, commentaire: string, parent: string | null = null) => ({
  idreponse: id, idcompte, commentaire, datereponse: '2024-03-02T00:00:00.000Z',
  idreponse_parent: parent, compte: { pseudo: idcompte === 'CPT-00001' ? 'moi' : 'autre' },
});

const avisDe = (id: string, idcompte: string, note: number, reponses: ReturnType<typeof reponse>[] = []) => ({
  idavis: id, idcompte, noteavis: note, titreavis: `Titre ${id}`, descriptionavis: `Texte ${id}`,
  dateavis: '2024-03-01T00:00:00.000Z', compte: { pseudo: idcompte === 'CPT-00001' ? 'moi' : 'autre' },
  reponse: reponses,
});

const cocktail = (extra: Record<string, unknown> = {}) => ({
  idcocktail: 'COK-00001',
  nomcocktail: 'Piña Colada',
  description: 'Douceur coco-ananas',
  difficulte: 'Moyen',
  alcool: true,
  duree: 7,
  idcompte: 'CPT-00009',
  image: [],
  etape: [
    {
      idetape: 'ETP-00001', numeroetape: 1, descriptionetape: 'Verser dans le shaker',
      etape_ustensile: [{ ustensile: { nomustensile: 'Shaker' } }],
      dosage: [{ idingredient: 'ING-00001', quantite: 1.5, unite: 'cl', ingredient: { nomingredient: 'Rhum' } }],
    },
    {
      idetape: 'ETP-00002', numeroetape: 2, descriptionetape: 'Secouer fort',
      etape_ustensile: [{ ustensile: { nomustensile: 'Shaker' } }, { ustensile: { nomustensile: 'Passoire' } }],
      dosage: [],
    },
  ],
  dosage: [
    { idingredient: 'ING-00001', quantite: 1.5, unite: 'cl', ingredient: { nomingredient: 'Rhum' } },
    { idingredient: 'ING-00002', quantite: 12, unite: 'cl', ingredient: { nomingredient: 'Jus d’ananas' } },
  ],
  avis: [],
  ...extra,
});

function repondre(donnees: unknown, { favori = false } = {}) {
  api.get.mockImplementation((url: string) => {
    if (url.startsWith('/api/compte/favori/')) return Promise.resolve({ data: { isFavori: favori } });
    return Promise.resolve({ data: donnees });
  });
}

// Nombre de lectures de la fiche (1 au chargement, +1 après chaque action sur les avis)
const appelsFiche = () => api.get.mock.calls.filter((c) => c[0] === '/api/cocktail/Pi%C3%B1a%20Colada').length;

async function ouvrir(donnees: unknown = cocktail(), options?: { favori?: boolean }) {
  repondre(donnees, options);
  const rendu = rendre(<CocktailDetail />, { route: '/cocktail/Pi%C3%B1a%20Colada', path: '/cocktail/:nom', depuis: '/' });
  await screen.findByRole('heading', { level: 1, name: 'Piña Colada' });
  return rendu;
}

describe('CocktailDetail', () => {
  describe('chargement', () => {
    it('demande le cocktail par son nom, sans token pour un visiteur', async () => {
      await ouvrir();
      expect(api.get).toHaveBeenCalledWith('/api/cocktail/Pi%C3%B1a%20Colada', { headers: {} });
    });

    it('envoie le token quand on est connecté', async () => {
      connecter();
      await ouvrir();
      expect(api.get.mock.calls[0][1]).toEqual({ headers: { Authorization: expect.stringMatching(/^Bearer /) } });
    });

    it('affiche « Chargement… » pendant la requête', () => {
      api.get.mockReturnValue(new Promise(() => {}));
      rendre(<CocktailDetail />, { route: '/cocktail/X', path: '/cocktail/:nom' });
      expect(screen.getByText('Chargement…')).toBeInTheDocument();
    });

    it('403 (alcool pour un mineur ou visiteur) : renvoie vers /login', async () => {
      api.get.mockRejectedValue(erreurApi(403));
      rendre(<CocktailDetail />, { route: '/cocktail/X', path: '/cocktail/:nom' });
      await waitFor(() => expect(emplacement()).toBe('/login'));
    });

    it('404 (brouillon d’un autre) : affiche « Cocktail introuvable. »', async () => {
      api.get.mockRejectedValue(erreurApi(404));
      rendre(<CocktailDetail />, { route: '/cocktail/X', path: '/cocktail/:nom' });
      expect(await screen.findByText('Cocktail introuvable.')).toBeInTheDocument();
    });

    it('cocktail inexistant (réponse vide) : affiche « Cocktail introuvable. »', async () => {
      api.get.mockResolvedValue({ data: null });
      rendre(<CocktailDetail />, { route: '/cocktail/X', path: '/cocktail/:nom' });
      expect(await screen.findByText('Cocktail introuvable.')).toBeInTheDocument();
    });
  });

  describe('recette', () => {
    it('affiche les infos, les ingrédients, le matériel et les étapes', async () => {
      await ouvrir();
      expect(screen.getByText('Moyen')).toBeInTheDocument();
      expect(screen.getByText('7 min')).toBeInTheDocument();
      expect(screen.getByText('Alcool')).toBeInTheDocument();
      expect(screen.getByText('Douceur coco-ananas')).toBeInTheDocument();

      const ingredients = within(screen.getByRole('heading', { name: 'Ingrédients' }).parentElement!);
      expect(ingredients.getByText('Jus d’ananas')).toBeInTheDocument();
      expect(ingredients.getByText('1,5')).toBeInTheDocument(); // format français

      // matériel sans doublon
      const materiel = screen.getByRole('heading', { name: 'Matériel' }).nextElementSibling!;
      expect(Array.from(materiel.querySelectorAll('li')).map((li) => li.textContent)).toEqual(['Shaker', 'Passoire']);

      expect(screen.getByText('Avec : Rhum (1,5 cl)')).toBeInTheDocument();
      expect(ingredients.getByText('2 ingrédients')).toBeInTheDocument();
      expect(screen.getByText('Matériel : Shaker, Passoire')).toBeInTheDocument();
      expect(screen.getByText('Secouer fort')).toBeInTheDocument();
    });

    it('coche une étape faite, compte la progression et la décoche', async () => {
      const { user } = await ouvrir();
      expect(screen.getByText('0/2 étapes faites')).toBeInTheDocument();
      expect(screen.getByText('Coche chaque étape au fur et à mesure de ta préparation.')).toBeInTheDocument();
      const etape1 = screen.getByRole('button', { name: 'Étape 1 faite' });
      expect(etape1).toHaveAttribute('aria-pressed', 'false');

      await user.click(etape1);
      expect(etape1).toHaveAttribute('aria-pressed', 'true');
      expect(etape1.closest('li')).toHaveClass('etape--faite');
      expect(screen.getByText('1/2 étapes faites')).toBeInTheDocument();

      await user.click(screen.getByRole('button', { name: 'Étape 2 faite' }));
      expect(screen.getByText('2/2 étapes faites')).toBeInTheDocument();
      expect(screen.getByText('Santé ! Tout est prêt.')).toBeInTheDocument();

      await user.click(etape1);
      expect(etape1).toHaveAttribute('aria-pressed', 'false');
      expect(etape1.closest('li')).not.toHaveClass('etape--faite');
      expect(screen.getByText('1/2 étapes faites')).toBeInTheDocument();
    });

    it('accorde au singulier avec une seule étape et un seul ingrédient', async () => {
      const c = cocktail();
      await ouvrir({ ...c, etape: [c.etape[0]], dosage: [c.dosage[0]] });
      expect(screen.getByText('0/1 étape faite')).toBeInTheDocument();
      expect(screen.getByText('1 ingrédient')).toBeInTheDocument();
    });

    it('cache la section Matériel sans ustensile', async () => {
      await ouvrir(cocktail({ etape: [] }));
      expect(screen.queryByRole('heading', { name: 'Matériel' })).not.toBeInTheDocument();
    });

    it('affiche la photo si elle existe, sinon un verre', async () => {
      await ouvrir(cocktail({ image: [{ urlimage: '/public/images/p.webp', titleimage: 'Photo' }] }));
      expect(screen.getByAltText('Photo')).toHaveAttribute('src', '/api/public/images/p.webp');
    });

    it('photo introuvable : remplacée par le verre (alcool)', async () => {
      await ouvrir(cocktail({ alcool: true, image: [{ urlimage: '/public/images/absente.webp', titleimage: 'Photo' }] }));
      imageIntrouvable(screen.getByAltText('Photo'));
      expect(screen.queryByAltText('Photo')).not.toBeInTheDocument();
      expect(document.querySelector('.fiche__photo--vide.recette__visuel--alcool')).toBeInTheDocument();
    });

    it('verre « mocktail » pour un cocktail sans alcool', async () => {
      await ouvrir(cocktail({ alcool: false }));
      expect(within(document.querySelector('.fiche__meta') as HTMLElement).getByText('Sans alcool')).toBeInTheDocument();
      expect(document.querySelector('.recette__visuel--moktail')).toBeInTheDocument();
    });

    it('Retour revient à la page précédente', async () => {
      const { user } = await ouvrir();
      await user.click(screen.getByRole('button', { name: '← Retour' }));
      expect(emplacement()).toBe('/');
    });
  });

  describe('favori', () => {
    it('visiteur : renvoyé vers /login', async () => {
      const { user } = await ouvrir();
      await user.click(screen.getByRole('button', { name: 'Ajouter aux favoris' }));
      expect(emplacement()).toBe('/login');
    });

    it('connecté : charge l’état puis ajoute et retire', async () => {
      connecter();
      const { user } = await ouvrir();
      await waitFor(() => expect(api.get).toHaveBeenCalledWith('/api/compte/favori/COK-00001', expect.any(Object)));
      await user.click(screen.getByRole('button', { name: 'Ajouter aux favoris' }));
      expect(api.post).toHaveBeenCalledWith('/api/compte/favori/COK-00001', {}, expect.any(Object));
      await user.click(await screen.findByRole('button', { name: 'Dans mes favoris' }));
      expect(api.delete).toHaveBeenCalledWith('/api/compte/favori/COK-00001', expect.any(Object));
    });

    it('affiche « Dans mes favoris » si déjà en favori', async () => {
      connecter();
      await ouvrir(cocktail(), { favori: true });
      expect(await screen.findByRole('button', { name: 'Dans mes favoris' })).toHaveAttribute('aria-pressed', 'true');
    });
  });

  describe('avis', () => {
    it('sans avis : message, et pas de bouton pour un visiteur', async () => {
      await ouvrir();
      expect(screen.getByText('Aucun avis pour le moment.')).toBeInTheDocument();
      expect(screen.getByText('Aucun avis')).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'Laisser un avis' })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'Répondre' })).not.toBeInTheDocument();      expect(screen.getByRole('link', { name: 'Connecte-toi' })).toHaveAttribute('href', '/login');
    });

    it('affiche la moyenne et les avis', async () => {
      await ouvrir(cocktail({ avis: [avisDe('AVS-00001', 'CPT-00002', 4), avisDe('AVS-00002', 'CPT-00003', 5)] }));
      expect(screen.getByText('4,5/5 (2 avis)')).toBeInTheDocument();
      expect(screen.getByText('2 avis')).toBeInTheDocument();
      expect(screen.getByText('Titre AVS-00001')).toBeInTheDocument();
      expect(screen.getAllByText('autre, le 01/03/2024')).toHaveLength(2);
    });

    it('auteur de la recette : pas de « Laisser un avis », lien pour modifier', async () => {
      connecter({ sub: 'CPT-00009' }); // CPT-00009 = auteur du cocktail de test
      const { user } = await ouvrir();
      expect(screen.getByText('C\'est ta recette')).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'Laisser un avis' })).not.toBeInTheDocument();
      await user.click(screen.getByRole('button', { name: 'Modifier ma recette' }));
      expect(emplacement()).toBe('/cocktail/Pi%C3%B1a%20Colada/modifier');
    });

    it('signale les réponses écrites par l’auteur de la recette', async () => {
      await ouvrir(cocktail({
        avis: [avisDe('AVS-00001', 'CPT-00002', 4, [
          reponse('REP-00001', 'CPT-00009', 'Merci beaucoup !'),
          reponse('REP-00002', 'CPT-00003', 'Pareil pour moi'),
        ])],
      }));
      expect(screen.getAllByText('Auteur de la recette')).toHaveLength(1);
      expect(screen.getByText('Auteur de la recette').closest('.reponse')).toHaveTextContent('Merci beaucoup !');
    });

    it('« Laisser un avis » mène au formulaire (nom encodé)', async () => {
      connecter();
      const { user } = await ouvrir();
      await user.click(screen.getByRole('button', { name: 'Laisser un avis' }));
      expect(emplacement()).toBe('/cocktail/Pi%C3%B1a%20Colada/avis');
    });

    it('seul l’auteur peut modifier ou supprimer son avis', async () => {
      connecter({ sub: 'CPT-00001' });
      await ouvrir(cocktail({ avis: [avisDe('AVS-00001', 'CPT-00001', 4), avisDe('AVS-00002', 'CPT-00002', 3)] }));
      expect(screen.getAllByRole('button', { name: 'Modifier' })).toHaveLength(1);
      expect(screen.getAllByRole('button', { name: 'Supprimer' })).toHaveLength(1);
    });

    it('modifie son avis', async () => {
      connecter({ sub: 'CPT-00001' });
      const { user } = await ouvrir(cocktail({ avis: [avisDe('AVS-00001', 'CPT-00001', 4)] }));
      await user.click(screen.getByRole('button', { name: 'Modifier' }));
      await user.selectOptions(screen.getByRole('combobox', { name: 'Note' }), '2');
      await user.clear(screen.getByRole('textbox', { name: 'Titre' }));
      await user.type(screen.getByRole('textbox', { name: 'Titre' }), 'Finalement bof');
      // L'API renvoie désormais l'avis modifié : la fiche est relue, pas rechargée
      repondre(cocktail({ avis: [{ ...avisDe('AVS-00001', 'CPT-00001', 2), titreavis: 'Finalement bof' }] }));
      await user.click(screen.getByRole('button', { name: 'Sauvegarder' }));
      expect(api.put).toHaveBeenCalledWith(
        '/api/avis/AVS-00001',
        { noteavis: 2, titreavis: 'Finalement bof', descriptionavis: 'Texte AVS-00001' },
        expect.any(Object),
      );
      expect(await screen.findByText('Finalement bof')).toBeInTheDocument();
      expect(appelsFiche()).toBe(2);
      expect(window.location.reload).not.toHaveBeenCalled();
    });

    it('annuler la modification de l’avis', async () => {
      connecter({ sub: 'CPT-00001' });
      const { user } = await ouvrir(cocktail({ avis: [avisDe('AVS-00001', 'CPT-00001', 4)] }));
      await user.click(screen.getByRole('button', { name: 'Modifier' }));
      await user.click(screen.getByRole('button', { name: 'Annuler' }));
      expect(screen.getByText('Titre AVS-00001')).toBeInTheDocument();
    });

    it('supprime son avis après confirmation, rien si on annule', async () => {
      connecter({ sub: 'CPT-00001' });
      const { user } = await ouvrir(cocktail({ avis: [avisDe('AVS-00001', 'CPT-00001', 4)] }));
      vi.mocked(window.confirm).mockReturnValueOnce(false);
      await user.click(screen.getByRole('button', { name: 'Supprimer' }));
      expect(api.delete).not.toHaveBeenCalled();
      repondre(cocktail({ avis: [] }));
      await user.click(screen.getByRole('button', { name: 'Supprimer' }));
      expect(api.delete).toHaveBeenCalledWith('/api/avis/AVS-00001', expect.any(Object));
      expect(await screen.findByText('Aucun avis pour le moment.')).toBeInTheDocument();
      expect(window.location.reload).not.toHaveBeenCalled();
    });
  });

  describe('réponses', () => {
    it('répond à un avis', async () => {
      connecter({ sub: 'CPT-00001' });
      const { user } = await ouvrir(cocktail({ avis: [avisDe('AVS-00001', 'CPT-00002', 4)] }));
      await user.click(screen.getByRole('button', { name: 'Répondre' }));
      await user.type(screen.getByRole('textbox', { name: 'Votre réponse' }), 'Merci pour l’astuce');
      repondre(cocktail({ avis: [avisDe('AVS-00001', 'CPT-00002', 4, [reponse('REP-00001', 'CPT-00001', 'Merci pour l’astuce')])] }));
      await user.click(screen.getByRole('button', { name: 'Envoyer' }));
      expect(api.post).toHaveBeenCalledWith('/api/avis/AVS-00001/reponse', { commentaire: 'Merci pour l’astuce' }, expect.any(Object));
      expect(await screen.findByText('Merci pour l’astuce')).toBeInTheDocument();
      expect(screen.queryByRole('textbox', { name: 'Votre réponse' })).not.toBeInTheDocument();
      expect(window.location.reload).not.toHaveBeenCalled();
    });

    it('n’envoie pas une réponse de moins de 2 caractères', async () => {
      connecter({ sub: 'CPT-00001' });
      const { user } = await ouvrir(cocktail({ avis: [avisDe('AVS-00001', 'CPT-00002', 4)] }));
      await user.click(screen.getByRole('button', { name: 'Répondre' }));
      await user.type(screen.getByRole('textbox', { name: 'Votre réponse' }), 'a');
      await user.click(screen.getByRole('button', { name: 'Envoyer' }));
      expect(api.post).not.toHaveBeenCalled();
    });

    it('annuler ferme le formulaire de réponse', async () => {
      connecter({ sub: 'CPT-00001' });
      const { user } = await ouvrir(cocktail({ avis: [avisDe('AVS-00001', 'CPT-00002', 4)] }));
      await user.click(screen.getByRole('button', { name: 'Répondre' }));
      await user.click(screen.getByRole('button', { name: 'Annuler' }));
      expect(screen.queryByRole('textbox', { name: 'Votre réponse' })).not.toBeInTheDocument();
    });

    it('affiche le fil et permet de répondre à la réponse d’un autre (avec le parent)', async () => {
      connecter({ sub: 'CPT-00001' });
      const fil = [
        reponse('REP-00001', 'CPT-00002', 'Première réponse'),
        reponse('REP-00002', 'CPT-00003', 'Sous-réponse', 'REP-00001'),
      ];
      const { user } = await ouvrir(cocktail({ avis: [avisDe('AVS-00001', 'CPT-00002', 4, fil)] }));
      expect(screen.getByText('Première réponse')).toBeInTheDocument();
      expect(screen.getByText('Sous-réponse')).toBeInTheDocument();

      // « Répondre » de l'avis + celui de la 1re réponse (pas de bouton sur la sous-réponse)
      const boutons = screen.getAllByRole('button', { name: 'Répondre' });
      expect(boutons).toHaveLength(2);
      await user.click(boutons[1]);
      await user.type(screen.getByRole('textbox', { name: 'Votre réponse' }), 'Je confirme');
      await user.click(screen.getByRole('button', { name: 'Envoyer' }));
      expect(api.post).toHaveBeenCalledWith(
        '/api/avis/AVS-00001/reponse',
        { commentaire: 'Je confirme', idreponse_parent: 'REP-00001' },
        expect.any(Object),
      );
    });

    it('pas de bouton « Répondre » sur sa propre réponse, mais Modifier / Supprimer', async () => {
      connecter({ sub: 'CPT-00001' });
      const fil = [reponse('REP-00001', 'CPT-00001', 'Ma réponse')];
      await ouvrir(cocktail({ avis: [avisDe('AVS-00001', 'CPT-00002', 4, fil)] }));
      const bloc = within(screen.getByText('Ma réponse').closest('.reponse') as HTMLElement);
      expect(bloc.queryByRole('button', { name: 'Répondre' })).not.toBeInTheDocument();
      expect(bloc.getByRole('button', { name: 'Modifier' })).toBeInTheDocument();
      expect(bloc.getByRole('button', { name: 'Supprimer' })).toBeInTheDocument();
    });

    it('modifie sa réponse', async () => {
      connecter({ sub: 'CPT-00001' });
      const fil = [reponse('REP-00001', 'CPT-00001', 'Ma réponse')];
      const { user } = await ouvrir(cocktail({ avis: [avisDe('AVS-00001', 'CPT-00002', 4, fil)] }));
      await user.click(screen.getByRole('button', { name: 'Modifier' }));
      const champ = screen.getByRole('textbox', { name: 'Modifier la réponse' });
      await user.clear(champ);
      await user.type(champ, 'Réponse corrigée');
      repondre(cocktail({ avis: [avisDe('AVS-00001', 'CPT-00002', 4, [reponse('REP-00001', 'CPT-00001', 'Réponse corrigée')])] }));
      await user.click(screen.getByRole('button', { name: 'Sauvegarder' }));
      expect(api.put).toHaveBeenCalledWith('/api/avis/reponse/REP-00001', { commentaire: 'Réponse corrigée' }, expect.any(Object));
      expect(await screen.findByText('Réponse corrigée')).toBeInTheDocument();
      expect(window.location.reload).not.toHaveBeenCalled();
    });

    it('annuler la modification de sa réponse', async () => {
      connecter({ sub: 'CPT-00001' });
      const fil = [reponse('REP-00001', 'CPT-00001', 'Ma réponse')];
      const { user } = await ouvrir(cocktail({ avis: [avisDe('AVS-00001', 'CPT-00002', 4, fil)] }));
      await user.click(screen.getByRole('button', { name: 'Modifier' }));
      await user.click(screen.getByRole('button', { name: 'Annuler' }));
      expect(screen.getByText('Ma réponse')).toBeInTheDocument();
    });

    it('supprime sa réponse après confirmation, rien si on annule', async () => {
      connecter({ sub: 'CPT-00001' });
      const fil = [reponse('REP-00001', 'CPT-00001', 'Ma réponse')];
      const { user } = await ouvrir(cocktail({ avis: [avisDe('AVS-00001', 'CPT-00002', 4, fil)] }));
      vi.mocked(window.confirm).mockReturnValueOnce(false);
      await user.click(screen.getByRole('button', { name: 'Supprimer' }));
      expect(api.delete).not.toHaveBeenCalled();
      repondre(cocktail({ avis: [avisDe('AVS-00001', 'CPT-00002', 4)] }));
      await user.click(screen.getByRole('button', { name: 'Supprimer' }));
      expect(api.delete).toHaveBeenCalledWith('/api/avis/reponse/REP-00001', expect.any(Object));
      await waitFor(() => expect(screen.queryByText('Ma réponse')).not.toBeInTheDocument());
      expect(window.location.reload).not.toHaveBeenCalled();
    });
  });
});
