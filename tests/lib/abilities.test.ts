import {
  ALL_ABILITIES,
  getCombatAbilitiesByClass,
  getPoolAbilityNames,
  getPoolAbilities,
  getAbilityById,
  getAbilityByName,
} from '@/lib/abilities';

describe('abilities', () => {
  describe('getCombatAbilitiesByClass', () => {
    it('ne retourne que des capacités de combat de la classe demandée', () => {
      const result = getCombatAbilitiesByClass('Guerrier');
      expect(result.length).toBeGreaterThan(0);
      for (const ability of result) {
        expect(ability.combat).toBeDefined();
        expect(ability.class).toBe('Guerrier');
      }
    });

    it('est insensible à la casse', () => {
      expect(getCombatAbilitiesByClass('guerrier')).toEqual(getCombatAbilitiesByClass('Guerrier'));
    });

    it('retourne un tableau vide pour une classe inconnue', () => {
      expect(getCombatAbilitiesByClass('Inexistant')).toEqual([]);
    });
  });

  describe('getPoolAbilityNames', () => {
    it('retourne les noms de toutes les capacités de la classe', () => {
      const names = getPoolAbilityNames('Mage');
      const expected = getPoolAbilities('Mage').map((a) => a.name);
      expect(names).toEqual(expected);
      expect(names.every((n) => typeof n === 'string')).toBe(true);
    });
  });

  describe('getPoolAbilities', () => {
    it('retourne uniquement les capacités de la classe demandée', () => {
      const result = getPoolAbilities('Assassin');
      expect(result.length).toBeGreaterThan(0);
      expect(result.every((a) => a.class === 'Assassin')).toBe(true);
    });
  });

  describe('getAbilityById', () => {
    it('trouve une capacité par son id', () => {
      const ability = getAbilityById('boule_feu');
      expect(ability?.name).toBe('Boule de Feu');
      expect(ability?.class).toBe('Mage');
    });

    it('retourne undefined pour un id inconnu', () => {
      expect(getAbilityById('id_inexistant')).toBeUndefined();
    });
  });

  describe('getAbilityByName', () => {
    it('trouve une capacité par son nom (insensible à la casse)', () => {
      expect(getAbilityByName('parade')?.id).toBe('parade');
      expect(getAbilityByName('PARADE')?.id).toBe('parade');
    });

    it('retourne undefined pour un nom inconnu', () => {
      expect(getAbilityByName('Nom Inexistant')).toBeUndefined();
    });
  });

  describe('ALL_ABILITIES (intégrité des données)', () => {
    it('a des identifiants uniques', () => {
      const ids = ALL_ABILITIES.map((a) => a.id);
      expect(new Set(ids).size).toBe(ids.length);
    });

    it('déclare une source valide pour chaque capacité', () => {
      for (const ability of ALL_ABILITIES) {
        expect(['combat', 'pool', 'both']).toContain(ability.source);
      }
    });
  });
});
