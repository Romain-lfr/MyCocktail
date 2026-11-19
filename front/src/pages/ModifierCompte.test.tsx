import { describe, expect, it } from 'vitest';
import { screen, waitFor, within } from '@testing-library/react';
import ModifierCompte from './ModifierCompte';
import { api, connecter, emplacement, erreurApi, rendre } from '../test/utils';

const compte = {
  pseudo: 'romain',
  mailcompte: 'romain@mycocktail.com',
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

describe('ModifierCompte', () => {
  it('renvoie vers /login sans token', () => {
    rendre(<ModifierCompte />);
    expect(emplacement()).toBe('/login');
  });

  it('pré-remplit le formulaire', async () => {
    await ouvrir();
    expect(champs().mail).toHaveValue('romain@mycocktail.com');
    expect(champs().tel).toHaveValue('');
    expect(screen.getByLabelText('Date de naissance')).toHaveValue('2000-05-12');
  });

  it('la date de naissance est grisée et n’est jamais envoyée', async () => {
    const { user } = await ouvrir();
    expect(screen.getByLabelText('Date de naissance')).toBeDisabled();
    await user.click(enregistrer());
    expect(api.put).toHaveBeenCalledWith(
      '/api/compte/me',
      { pseudo: 'romain', mailcompte: 'romain@mycocktail.com', numtel: null },
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
});
