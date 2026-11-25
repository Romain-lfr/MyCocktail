import { describe, expect, it, vi } from 'vitest';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ModifierCompte from './ModifierCompte';
import { api, connecter, emplacement, erreurApi, rendre } from '../test/utils';

const compte = {
  pseudo: 'romain',
  mailcompte: 'romain@myxo.com',
  numtel: null,
  datenaissance: '2000-05-12T00:00:00.000Z',
};

const champs = () => ({
  pseudo: screen.getByLabelText('Pseudo'),
  mail: screen.getByLabelText('E-mail'),
  tel: screen.getByLabelText(/Téléphone/),
});
const enregistrer = () => screen.getByRole('button', { name: 'Enregistrer' });

async function ouvrir() {
  connecter();
  api.get.mockResolvedValue({ data: compte });
  const rendu = rendre(<ModifierCompte />);
  await waitFor(() => expect(champs().pseudo).toHaveValue('romain'));
  return rendu;
}

/** Photo de profil affichée (img décorative : alt vide, donc pas de rôle « img ») */
const photo = (classe: string) => waitFor(() => { const img = document.querySelector(`img.${classe}`); expect(img).not.toBeNull(); return img as HTMLElement; });

describe('ModifierCompte', () => {
  it('renvoie vers /login sans token', () => {
    rendre(<ModifierCompte />);
    expect(emplacement()).toBe('/login');
  });

  it('pré-remplit le formulaire', async () => {
    await ouvrir();
    expect(champs().mail).toHaveValue('romain@myxo.com');
    expect(champs().tel).toHaveValue('');
    expect(screen.getByLabelText('Date de naissance')).toHaveValue('2000-05-12');
  });

  it('la date de naissance est grisée et n’est jamais envoyée', async () => {
    const { user } = await ouvrir();
    expect(screen.getByLabelText('Date de naissance')).toBeDisabled();
    await user.click(enregistrer());
    expect(api.put).toHaveBeenCalledWith(
      '/api/compte/me',
      { pseudo: 'romain', mailcompte: 'romain@myxo.com', numtel: null },
      expect.any(Object),
    );
    expect(await screen.findByRole('status')).toHaveTextContent('Profil mis à jour !');
    expect(screen.getByLabelText('Date de naissance')).toHaveAccessibleDescription('La date de naissance n\'est pas modifiable.');
  });

  it('l’aperçu suit le pseudo saisi', async () => {
    const { user } = await ouvrir();
    const apercu = within(screen.getByRole('region', { name: 'Aperçu du profil' }));
    expect(apercu.getByText('romain')).toBeInTheDocument();
    await user.clear(champs().pseudo);
    expect(apercu.getByText('Ton pseudo')).toBeInTheDocument();
    await user.type(champs().pseudo, 'Zoé');
    expect(apercu.getByText('Zoé')).toBeInTheDocument();
    expect(apercu.getByText('Z')).toBeInTheDocument();
    await user.type(champs().pseudo, '_martin');
    expect(apercu.getByText('ZM')).toBeInTheDocument();
  });

  it('désactive le bouton pendant l’enregistrement', async () => {
    api.put.mockReturnValue(new Promise(() => {}));
    const { user } = await ouvrir();
    await user.click(enregistrer());
    expect(screen.getByRole('button', { name: 'Enregistrement…' })).toBeDisabled();
  });

  it('envoie le téléphone saisi', async () => {
    const { user } = await ouvrir();
    await user.type(champs().tel, '+33 6 12 34 56 78');
    await user.click(enregistrer());
    expect(api.put.mock.calls[0][1]).toMatchObject({ numtel: '+33 6 12 34 56 78' });
  });

  it.each([
    ['pseudo', 'ro', 'Le pseudo doit faire au moins 3 caractères'],
    ['mail', 'pas-un-mail', 'Email invalide'],
    ['tel', 'abc', 'Numéro de téléphone invalide'],
  ] as const)('refuse un %s invalide sans appeler l’API', async (champ, valeur, message) => {
    const { user } = await ouvrir();
    await user.clear(champs()[champ]);
    await user.type(champs()[champ], valeur);
    await user.click(enregistrer());
    expect(champs()[champ]).toHaveAttribute('aria-invalid', 'true');
    expect(champs()[champ]).toHaveAccessibleDescription(message);
    expect(api.put).not.toHaveBeenCalled();
  });

  it('affiche l’erreur de l’API (pseudo déjà pris)', async () => {
    api.put.mockRejectedValue(erreurApi(409, 'Ce pseudo ou cet email est déjà utilisé'));
    const { user } = await ouvrir();
    await user.click(enregistrer());
    expect(await screen.findByText('Ce pseudo ou cet email est déjà utilisé')).toBeInTheDocument();
  });

  it('affiche un message générique si l’API ne précise rien', async () => {
    api.put.mockRejectedValue(new Error('Network Error'));
    const { user } = await ouvrir();
    await user.click(enregistrer());
    expect(await screen.findByText('Erreur lors de la modification')).toBeInTheDocument();
  });

  it('renvoie vers /login si le token disparaît avant l’envoi', async () => {
    const { user } = await ouvrir();
    localStorage.removeItem('token');
    await user.click(enregistrer());
    expect(emplacement()).toBe('/login');
  });

  it('renvoie vers /login si le chargement échoue', async () => {
    connecter();
    api.get.mockRejectedValue(new Error('401'));
    rendre(<ModifierCompte />);
    await waitFor(() => expect(emplacement()).toBe('/login'));
  });

  it('Retour mène à /compte', async () => {
    const { user } = await ouvrir();
    await user.click(screen.getByRole('button', { name: '← Retour' }));
    expect(emplacement()).toBe('/compte');
  });

  describe('photo de profil', () => {
    const image = (nom = 'moi.png', type = 'image/png', taille = 1000) => {
      const f = new File(['x'], nom, { type });
      Object.defineProperty(f, 'size', { value: taille });
      return f;
    };
    const avatar = () => document.querySelector('.profil__avatar');

    it('sans photo : initiales et bouton « Ajouter une photo », pas de « Retirer »', async () => {
      await ouvrir();
      expect(avatar()).toHaveTextContent('R');
      expect(screen.getByLabelText('Ajouter une photo')).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'Retirer' })).not.toBeInTheDocument();
    });

    it('affiche la photo existante', async () => {
      connecter();
      api.get.mockResolvedValue({ data: { ...compte, photo: '/public/images/moi.webp' } });
      rendre(<ModifierCompte />);
      expect(await photo('profil__avatar')).toHaveAttribute('src', '/api/public/images/moi.webp');
      expect(screen.getByLabelText('Changer la photo')).toBeInTheDocument();
    });

    it('envoie la photo choisie (champ « image ») et met l’aperçu à jour', async () => {
      const { user } = await ouvrir();
      api.post.mockResolvedValue({ data: { photo: '/public/images/nouvelle.webp' } });
      const fichier = image();
      await user.upload(screen.getByLabelText('Ajouter une photo'), fichier);
      expect(await screen.findByRole('status')).toHaveTextContent('Photo mise à jour !');
      const [url, corps, options] = api.post.mock.calls[0];
      expect(url).toBe('/api/compte/me/photo');
      expect((corps as FormData).get('image')).toBe(fichier);
      expect(options).toEqual(expect.objectContaining({ headers: expect.objectContaining({ Authorization: expect.stringMatching(/^Bearer /) }) }));
      expect(await photo('profil__avatar')).toHaveAttribute('src', '/api/public/images/nouvelle.webp');
      expect(screen.getByRole('button', { name: 'Retirer' })).toBeInTheDocument();
    });

    it.each([
      ['un format non supporté', image('moi.gif', 'image/gif'), 'Format non supporté (jpg, png ou webp)'],
      ['une image de plus de 5 Mo', image('grosse.jpg', 'image/jpeg', 5 * 1024 * 1024 + 1), 'Image trop lourde (5 Mo maximum)'],
    ])('refuse %s avant tout envoi', async (_cas, fichier, message) => {
      await ouvrir();
      // Le navigateur peut laisser passer un fichier hors « accept » (« Tous les fichiers ») : la page doit le refuser elle-même
      const user = userEvent.setup({ applyAccept: false });
      await user.upload(screen.getByLabelText('Ajouter une photo'), fichier);
      expect(await screen.findByRole('alert')).toHaveTextContent(message);
      expect(api.post).not.toHaveBeenCalled();
    });

    it('affiche l’erreur de l’API', async () => {
      const { user } = await ouvrir();
      api.post.mockRejectedValue(erreurApi(400, 'Format non supporté (jpg, png ou webp)'));
      await user.upload(screen.getByLabelText('Ajouter une photo'), image());
      expect(await screen.findByRole('alert')).toHaveTextContent('Format non supporté (jpg, png ou webp)');
    });

    it('message générique si l’API ne précise rien', async () => {
      const { user } = await ouvrir();
      api.post.mockRejectedValue(erreurApi(500));
      await user.upload(screen.getByLabelText('Ajouter une photo'), image());
      expect(await screen.findByRole('alert')).toHaveTextContent("Erreur lors de l'envoi de la photo");
    });

    it('retire la photo après confirmation, rien sans confirmation', async () => {
      connecter();
      api.get.mockResolvedValue({ data: { ...compte, photo: '/public/images/moi.webp' } });
      const { user } = rendre(<ModifierCompte />);
      const retirer = await screen.findByRole('button', { name: 'Retirer' });

      vi.mocked(window.confirm).mockReturnValueOnce(false);
      await user.click(retirer);
      expect(api.delete).not.toHaveBeenCalled();

      vi.mocked(window.confirm).mockReturnValueOnce(true);
      api.delete.mockResolvedValue({ data: { photo: null } });
      await user.click(retirer);
      expect(await screen.findByRole('status')).toHaveTextContent('Photo retirée.');
      expect(api.delete).toHaveBeenCalledWith('/api/compte/me/photo', expect.objectContaining({ headers: expect.any(Object) }));
      expect(document.querySelector('img.profil__avatar')).toBeNull();
      expect(screen.getByLabelText('Ajouter une photo')).toBeInTheDocument();
    });

    it('affiche l’erreur si le retrait échoue', async () => {
      connecter();
      api.get.mockResolvedValue({ data: { ...compte, photo: '/public/images/moi.webp' } });
      const { user } = rendre(<ModifierCompte />);
      vi.mocked(window.confirm).mockReturnValueOnce(true);
      api.delete.mockRejectedValue(erreurApi(500));
      await user.click(await screen.findByRole('button', { name: 'Retirer' }));
      expect(await screen.findByRole('alert')).toHaveTextContent('Erreur lors du retrait de la photo');
    });
  });
});
