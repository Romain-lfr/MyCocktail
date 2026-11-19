import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import ImageOuSecours from './ImageOuSecours';
import { imageIntrouvable } from '../test/utils';

const secours = <span>Verre</span>;

describe('ImageOuSecours', () => {
  it('sans URL : affiche le visuel de secours, aucune image', () => {
    render(<ImageOuSecours src={undefined} alt="Mojito" secours={secours} />);
    expect(screen.getByText('Verre')).toBeInTheDocument();
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });

  it('avec URL : affiche l’image avec sa classe', () => {
    render(<ImageOuSecours src="/api/public/images/m.webp" alt="Mojito" className="photo" secours={secours} />);
    const img = screen.getByAltText('Mojito');
    expect(img).toHaveAttribute('src', '/api/public/images/m.webp');
    expect(img).toHaveClass('photo');
    expect(screen.queryByText('Verre')).not.toBeInTheDocument();
  });

  it('image introuvable : bascule sur le visuel de secours', () => {
    render(<ImageOuSecours src="/api/public/images/absente.webp" alt="Mojito" secours={secours} />);
    imageIntrouvable(screen.getByAltText('Mojito'));
    expect(screen.queryByAltText('Mojito')).not.toBeInTheDocument();
    expect(screen.getByText('Verre')).toBeInTheDocument();
  });

  it('retente le chargement quand l’URL change après un échec', () => {
    const { rerender } = render(<ImageOuSecours src="/api/a.webp" alt="Mojito" secours={secours} />);
    imageIntrouvable(screen.getByAltText('Mojito'));
    rerender(<ImageOuSecours src="/api/b.webp" alt="Mojito" secours={secours} />);
    expect(screen.getByAltText('Mojito')).toHaveAttribute('src', '/api/b.webp');
  });
});
