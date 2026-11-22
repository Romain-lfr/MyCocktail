import { describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';
import PageIntrouvable from './PageIntrouvable';
import { emplacement, rendre } from '../test/utils';

describe('PageIntrouvable', () => {
  it('annonce la page introuvable et ramène à l’accueil', async () => {
    const { user } = rendre(<PageIntrouvable />, { route: '/nimportequoi' });
    expect(screen.getByRole('heading', { name: 'Page introuvable' })).toBeInTheDocument();
    await user.click(screen.getByRole('link', { name: "Retour à l'accueil" }));
    expect(emplacement()).toBe('/');
  });
});
