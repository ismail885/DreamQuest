jest.mock('@/lib/supabaseClient', () => ({ supabase: {} }));

import {
  getPrestigeTitle,
  getPrestigeTier,
  getLevelFromXP,
  getXPInCurrentLevel,
  getXPForNextLevel,
} from '@/lib/leveling';
import { MAX_LEVEL } from '@/lib/seasons';

describe('leveling - fonctions pures', () => {
  describe('getPrestigeTitle', () => {
    it('retourne le titre selon le meilleur niveau', () => {
      expect(getPrestigeTitle(0)).toBe('Apprenti Aventurier');
      expect(getPrestigeTitle(15)).toBe('Guerrier Prometteur');
      expect(getPrestigeTitle(25)).toBe('Aventurier Confirmé');
      expect(getPrestigeTitle(40)).toBe('Vétéran Aguerri');
      expect(getPrestigeTitle(55)).toBe('Élite Légendaire');
      expect(getPrestigeTitle(70)).toBe('Maître Absolu');
      expect(getPrestigeTitle(85)).toBe('Seigneur Suprême');
      expect(getPrestigeTitle(100)).toBe('Légende Vivante');
    });

    it('gère les bornes juste en dessous d’un palier', () => {
      expect(getPrestigeTitle(14)).toBe('Apprenti Aventurier');
      expect(getPrestigeTitle(99)).toBe('Seigneur Suprême');
    });
  });

  describe('getPrestigeTier', () => {
    it('retourne le palier numérique correspondant', () => {
      expect(getPrestigeTier(0)).toBe(0);
      expect(getPrestigeTier(15)).toBe(1);
      expect(getPrestigeTier(100)).toBe(7);
    });

    it('reste cohérent avec getPrestigeTitle sur les bornes', () => {
      expect(getPrestigeTier(14)).toBe(0);
      expect(getPrestigeTier(85)).toBe(6);
    });
  });

  describe('getLevelFromXP', () => {
    it('retourne le niveau 1 pour 0 XP', () => {
      expect(getLevelFromXP(0)).toBe(1);
    });

    it('est monotone croissant avec l’XP', () => {
      const low = getLevelFromXP(1000);
      const high = getLevelFromXP(1_000_000);
      expect(high).toBeGreaterThanOrEqual(low);
    });

    it('ne dépasse jamais MAX_LEVEL', () => {
      expect(getLevelFromXP(Number.MAX_SAFE_INTEGER)).toBe(MAX_LEVEL);
    });
  });

  describe('getXPInCurrentLevel', () => {
    it('vaut l’XP totale au niveau 1', () => {
      expect(getXPInCurrentLevel(1, 500)).toBe(500);
    });

    it('ne retourne jamais de valeur négative', () => {
      expect(getXPInCurrentLevel(50, 0)).toBe(0);
    });
  });

  describe('getXPForNextLevel', () => {
    it('retourne un coût strictement positif', () => {
      expect(getXPForNextLevel(1)).toBeGreaterThan(0);
      expect(getXPForNextLevel(10)).toBeGreaterThan(0);
    });
  });
});
