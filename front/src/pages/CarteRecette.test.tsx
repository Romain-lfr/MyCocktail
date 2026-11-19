import { describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';
import CarteRecette from './CarteRecette';
import { emplacement, imageIntrouvable, rendre } from '../test/utils';

const base = { idcocktail: 'COK-00001', nomcocktail: 'Piña Colada' };

describe('CarteRecette', () => {
  it('cliquer sur le nom ouvre la fiche (nom encodé)', async () => {
    const { user } = rendre(<ul><CarteRecette c={base} /></ul>);
    await user.click(screen.getByRole('button', { name: 'Piña Colada' }));
    expect(emplacement()).toBe('/cocktail/Pi%C3%B1a%20Colada');
  });

  it('cliquer ailleurs sur la carte ouvre la fiche, mais pas un bouton d’action', async () => {
    const { user } = rendre(<ul><CarteRecette c={{ ...base, description: 'Coco' }}><button>Action</button></CarteRecette></ul>);
    await user.click(screen.getByRole('button', { name: 'Action' }));
    expect(emplacement()).toBe('/');
    await user.click(screen.getByText('Coco'));
    expect(emplacement()).toBe('/cocktail/Pi%C3%B1a%20Colada');
  });

  it('affiche les infos fournies, et le statut seulement si demandé', () => {
    const c = { ...base, description: 'Coco', difficulte: 'Facile', duree: 5, alcool: true, statut: 'priv_' };
    const { unmount } = rendre(<ul><CarteRecette c={c} /></ul>);
    expect(screen.getByText('Coco')).toBeInTheDocument();
    expect(screen.getByText('Facile')).toBeInTheDocument();
    expect(screen.getByText('5 min')).toBeInTheDocument();
    expect(screen.getByText('Alcool')).toBeInTheDocument();
    expect(screen.queryByText('Privé')).not.toBeInTheDocument();
    unmount();
    rendre(<ul><CarteRecette c={c} avecStatut /></ul>);
    expect(screen.getByText('Privé')).toHaveClass('etat--privé');
  });

  it('affiche la note moyenne si les avis sont fournis', () => {
    const { unmount } = rendre(<ul><CarteRecette c={{ ...base, avis: [{ noteavis: 4 }, { noteavis: 5 }] }} /></ul>);
    expect(screen.getByText('4,5/5 (2 avis)')).toBeInTheDocument();
    unmount();
    rendre(<ul><CarteRecette c={{ ...base, avis: [] }} /></ul>);
    expect(screen.getByText('Aucun avis')).toBeInTheDocument();
  });

  it('photo si elle existe (texte alternatif = titre, sinon nom)', () => {
    rendre(<ul><CarteRecette c={{ ...base, image: [{ urlimage: '/public/images/1.webp' }] }} /></ul>);
    expect(screen.getByAltText('Piña Colada')).toHaveAttribute('src', '/api/public/images/1.webp');
  });

  it('sans photo : verre sur fond mangue (alcool) ou citron (sans alcool)', () => {
    const { container, unmount } = rendre(<ul><CarteRecette c={{ ...base, alcool: true }} /></ul>);
    expect(container.querySelector('.recette__visuel--alcool')).toBeInTheDocument();
    unmount();
    const r = rendre(<ul><CarteRecette c={{ ...base, alcool: false }} /></ul>);
    expect(r.container.querySelector('.recette__visuel--moktail')).toBeInTheDocument();
    expect(screen.getByText('Sans alcool')).toBeInTheDocument();
  });

  it.each([
    [true, '.recette__visuel--alcool'],
    [false, '.recette__visuel--moktail'],
  ])('photo introuvable (alcool = %s) : remplacée par le verre %s', (alcool, classe) => {
    const { container } = rendre(<ul><CarteRecette c={{ ...base, alcool, image: [{ urlimage: '/public/images/absente.webp' }] }} /></ul>);
    imageIntrouvable(screen.getByAltText('Piña Colada'));
    expect(screen.queryByAltText('Piña Colada')).not.toBeInTheDocument();
    expect(container.querySelector(classe)).toBeInTheDocument();
  });

  it('affiche les actions passées en enfants, et rien sinon', () => {
    const { container, unmount } = rendre(<ul><CarteRecette c={base} /></ul>);
    expect(container.querySelector('.recette__actions')).not.toBeInTheDocument();
    unmount();
    rendre(<ul><CarteRecette c={base}><button>Action</button></CarteRecette></ul>);
    expect(screen.getByRole('button', { name: 'Action' })).toBeInTheDocument();
  });
});
