import {
  BASE_MONSTERS,
  getMonsters,
  getRandomMonster,
  getMonsterById,
  addCustomMonster,
  removeMonster,
  resetMonsters,
  Monster,
} from '@/lib/monsters';

beforeEach(() => {
  localStorage.clear();
});

describe('monsters', () => {
  describe('getMonsters', () => {
    it('initialise avec les monstres de base si le stockage est vide', () => {
      expect(getMonsters()).toEqual(BASE_MONSTERS);
    });
  });

  describe('getMonsterById', () => {
    it('retrouve un monstre de base par son id', () => {
      expect(getMonsterById('loup')?.name).toBe('Loup affamé');
    });

    it('retourne undefined pour un id inconnu', () => {
      expect(getMonsterById('inconnu')).toBeUndefined();
    });
  });

  describe('getRandomMonster', () => {
    it('retourne un monstre adapté à la fourchette de niveau', () => {
      const monster = getRandomMonster(3);
      expect(monster).toBeDefined();
      expect(monster.level).toBeGreaterThanOrEqual(1);
      expect(monster.level).toBeLessThanOrEqual(6);
    });

    it('retombe sur une sélection élargie pour un niveau très bas', () => {
      const monster = getRandomMonster(0);
      expect(monster).toBeDefined();
      expect(BASE_MONSTERS.map((m) => m.id)).toContain(monster.id);
    });
  });

  describe('addCustomMonster / removeMonster / resetMonsters', () => {
    const custom: Monster = {
      id: 'custom_boss', name: 'Boss Test', level: 20,
      hp: 500, attack: 40, defense: 20, reward: 999, type: 'demon',
    };

    it('ajoute un monstre personnalisé', () => {
      addCustomMonster(custom);
      expect(getMonsterById('custom_boss')).toEqual(custom);
    });

    it('supprime un monstre par id', () => {
      addCustomMonster(custom);
      removeMonster('custom_boss');
      expect(getMonsterById('custom_boss')).toBeUndefined();
    });

    it('réinitialise aux monstres de base', () => {
      addCustomMonster(custom);
      resetMonsters();
      expect(getMonsters()).toEqual(BASE_MONSTERS);
    });
  });
});
