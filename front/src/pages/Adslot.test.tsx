import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

// Adslot lit VITE_ADSENSE_CLIENT au chargement : on recharge le module après chaque stubEnv
async function chargerAdslot(client?: string) {
  vi.resetModules();
  if (client) vi.stubEnv('VITE_ADSENSE_CLIENT', client);
  return import('./Adslot');
}

describe('Adslot', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    document.head.querySelectorAll('script[data-adsense]').forEach((s) => s.remove());
    delete window.adsbygoogle;
  });

  describe('pubAutorisee', () => {
    it('refuse toujours la pub à un mineur', async () => {
      localStorage.setItem('estMineur', 'true');
      const { pubAutorisee } = await chargerAdslot('ca-pub-123');
      expect(pubAutorisee('slot')).toBe(false);
    });

    it('réserve l’emplacement en développement', async () => {
      const { pubAutorisee } = await chargerAdslot();
      expect(pubAutorisee()).toBe(true);
    });
  });

  describe('AdSlot', () => {
    it('n’affiche rien à un mineur', async () => {
      localStorage.setItem('estMineur', 'true');
      const { default: AdSlot } = await chargerAdslot('ca-pub-123');
      const { container } = render(<AdSlot slot="42" />);
      expect(container).toBeEmptyDOMElement();
    });

    it('affiche un emplacement factice en développement sans identifiant AdSense', async () => {
      const { default: AdSlot } = await chargerAdslot();
      render(<AdSlot slot="42" />);
      expect(screen.getByText(/Emplacement publicitaire/)).toBeInTheDocument();
      expect(document.querySelector('script[data-adsense]')).toBeNull();
    });

    it('charge le script AdSense une seule fois et affiche la pub', async () => {
      const { default: AdSlot } = await chargerAdslot('ca-pub-123');
      render(<><AdSlot slot="42" /><AdSlot slot="43" /></>);
      expect(screen.getAllByText('Publicité')).toHaveLength(2);
      const scripts = document.querySelectorAll('script[data-adsense]');
      expect(scripts).toHaveLength(1);
      expect(scripts[0].getAttribute('src')).toContain('client=ca-pub-123');
      expect(window.adsbygoogle).toHaveLength(2);
      expect(document.querySelector('ins')).toHaveAttribute('data-ad-slot', '42');
    });

    it('ne plante pas si AdSense lève une erreur', async () => {
      const { default: AdSlot } = await chargerAdslot('ca-pub-123');
      const erreur = vi.spyOn(console, 'error').mockImplementation(() => {});
      window.adsbygoogle = { push: () => { throw new Error('bloqué'); } } as unknown as unknown[];
      render(<AdSlot slot="42" />);
      expect(screen.getByText('Publicité')).toBeInTheDocument();
      expect(erreur).toHaveBeenCalled();
    });
  });
});
