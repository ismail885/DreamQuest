import {
  generateRandomStats,
  getRandomAbility,
  getAbilitiesForLevel,
  generateCharacterName,
  generateAdventureTitle,
} from '@/lib/randomGenerator';
import { getPoolAbilityNames } from '@/lib/abilities';
import type { CharacterClass } from '@/types';

describe('randomGenerator', () => {
  describe('generateRandomStats', () => {
    it('retourne les 4 stats, toutes >= 1', () => {
      const stats = generateRandomStats('Guerrier', 1);
      expect(Object.keys(stats).sort()).toEqual(['agility', 'endurance', 'force', 'magie']);
      for (const value of Object.values(stats)) {
        expect(value).toBeGreaterThanOrEqual(1);
      }
    });

    it('applique un plancher plus élevé à haut niveau', () => {
      jest.spyOn(Math, 'random').mockReturnValue(0);
      const low = generateRandomStats('Guerrier', 1);
      const high = generateRandomStats('Guerrier', 30);
      expect(high.force).toBeGreaterThan(low.force);
      (Math.random as jest.Mock).mockRestore();
    });

    it('utilise un socle par défaut pour une classe inconnue', () => {
      const stats = generateRandomStats('ClasseBidon' as CharacterClass, 1);
      for (const value of Object.values(stats)) {
        expect(value).toBeGreaterThanOrEqual(1);
      }
    });
  });

  describe('getRandomAbility', () => {
    it('retourne une capacité appartenant au pool de la classe', () => {
      const pool = getPoolAbilityNames('Mage');
      const ability = getRandomAbility('Mage');
      expect(pool).toContain(ability);
    });

    it('évite les capacités déjà possédées quand c’est possible', () => {
      const pool = getPoolAbilityNames('Mage');
      const owned = pool.slice(0, pool.length - 1);
      expect(getRandomAbility('Mage', owned)).toBe(pool[pool.length - 1]);
    });

    it('retombe sur le pool complet si tout est déjà possédé', () => {
      const pool = getPoolAbilityNames('Mage');
      const ability = getRandomAbility('Mage', [...pool]);
      expect(pool).toContain(ability);
    });
  });

  describe('getAbilitiesForLevel', () => {
    it('ne débloque rien en dessous du premier palier', () => {
      expect(getAbilitiesForLevel('Guerrier', 1)).toEqual([]);
    });

    it('débloque un nombre croissant de capacités avec le niveau', () => {
      const lvl5 = getAbilitiesForLevel('Guerrier', 5);
      const lvl100 = getAbilitiesForLevel('Guerrier', 100);
      expect(lvl100.length).toBeGreaterThan(lvl5.length);
      expect(lvl100.length).toBeLessThanOrEqual(12);
    });
  });

  describe('generateCharacterName', () => {
    it('retourne une chaîne non vide', () => {
      for (let i = 0; i < 30; i++) {
        expect(generateCharacterName().length).toBeGreaterThan(0);
      }
    });
  });

  describe('generateAdventureTitle', () => {
    it('retourne une chaîne non vide', () => {
      for (let i = 0; i < 30; i++) {
        expect(generateAdventureTitle().length).toBeGreaterThan(0);
      }
    });
  });
});
