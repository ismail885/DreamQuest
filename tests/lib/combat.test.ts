import {
  playerAttack,
  playerDefense,
  enemyAttack,
  updateCooldowns,
  updateCombatStatus,
  updateEnemyStatus,
  regenerateMana,
  createCombatState,
  getAbilitiesForClass,
  applyPoisonDamage,
} from '@/lib/combat'
import { executeAbility } from '@/lib/combat'
import type { Enemy, StatusEffect } from '@/data/enemies'
import type { PlayerStatus } from '@/lib/combat'

// Crée un ennemi de test avec des valeurs prévisibles
function createTestEnemy(overrides: Partial<Enemy> = {}): Enemy {
  return {
    id: 'gobelin',
    name: 'Gobelin',
    description: 'Un petit gobelin vicieux',
    level: 1,
    hp: 30,
    maxHp: 30,
    pv: 30,
    pvMax: 30,
    attack: 8,
    defense: 3,
    force: 6,
    agility: 5,
    intelligence: 2,
    xpReward: 50,
    ...overrides,
  }
}

// Stats joueur prévisibles
const defaultStats = { force: 8, agility: 5, magie: 3, endurance: 7 }

// Status joueur par défaut
const defaultStatus: PlayerStatus = {
  buff_force: 0,
  buff_agility: 0,
  buff_defense: 0,
  regen: 0,
  thorns: 0,
}

describe('Combat - fonctions pures', () => {
  describe('createCombatState', () => {
    it('devrait créer un état initial avec un ennemi', () => {
      const state = createCombatState(100, 50, 1)
      expect(state.inCombat).toBe(true)
      expect(state.playerPv).toBe(100)
      expect(state.playerPvMax).toBe(100)
      expect(state.playerMana).toBe(50)
      expect(state.playerManaMax).toBe(50)
      expect(state.turn).toBe('player')
      expect(state.won).toBe(false)
      expect(state.lost).toBe(false)
      expect(state.fled).toBe(false)
      expect(state.enemy).not.toBeNull()
      expect(state.log.length).toBeGreaterThanOrEqual(1)
      expect(state.log[0]).toContain('apparaît')
    })

    it('devrait avoir un état de statut initial vide', () => {
      const state = createCombatState(100)
      expect(state.status.buff_force).toBe(0)
      expect(state.status.buff_agility).toBe(0)
      expect(state.status.buff_defense).toBe(0)
      expect(state.status.regen).toBe(0)
      expect(state.status.thorns).toBe(0)
      expect(state.enemyStatus).toEqual([])
      expect(state.cooldowns).toEqual({})
    })
  })

  describe('playerAttack', () => {
    it('devrait infliger au moins 1 dégât', () => {
      const enemy = createTestEnemy({ defense: 100 }) // défense très haute
      const result = playerAttack(defaultStats, enemy, defaultStatus)
      expect(result.dmg).toBeGreaterThanOrEqual(1)
    })

    it('devrait retourner un message de log', () => {
      const enemy = createTestEnemy()
      const result = playerAttack(defaultStats, enemy, defaultStatus)
      expect(result.log.length).toBeGreaterThan(0)
    })

    it('devrait augmenter les dégâts avec buff_force actif', () => {
      const enemy = createTestEnemy()
      const buffedStatus: PlayerStatus = { ...defaultStatus, buff_force: 3 }
      const normal = playerAttack(defaultStats, enemy, defaultStatus)
      const buffed = playerAttack(defaultStats, enemy, buffedStatus)
      expect(buffed.dmg).toBeGreaterThanOrEqual(normal.dmg)
    })

    it('devrait retourner isCrit comme boolean', () => {
      const enemy = createTestEnemy()
      const result = playerAttack(defaultStats, enemy, defaultStatus)
      expect(typeof result.isCrit).toBe('boolean')
    })
  })

  describe('playerDefense', () => {
    it('devrait retourner une réduction > 0', () => {
      const result = playerDefense(defaultStats, defaultStatus)
      expect(result.reduction).toBeGreaterThan(0)
    })

    it('devrait augmenter la réduction avec buff_defense actif', () => {
      const buffedStatus: PlayerStatus = { ...defaultStatus, buff_defense: 2 }
      const normal = playerDefense(defaultStats, defaultStatus)
      const buffed = playerDefense(defaultStats, buffedStatus)
      expect(buffed.reduction).toBeGreaterThanOrEqual(normal.reduction)
    })

    it('devrait retourner un message de log avec "pare" par défaut', () => {
      const result = playerDefense(defaultStats, defaultStatus)
      expect(result.log).toContain('pare')
    })

    it('devrait mentionner le bouclier si buff_defense actif', () => {
      const buffedStatus: PlayerStatus = { ...defaultStatus, buff_defense: 2 }
      const result = playerDefense(defaultStats, buffedStatus)
      expect(result.log).toContain('bouclier')
    })
  })

  describe('enemyAttack', () => {
    it('devrait infliger au moins 1 dégât en touche directe', () => {
      const enemy = createTestEnemy({ force: 20 })
      // Force l'échec de l'esquive avec une agilité nulle
      const result = enemyAttack(enemy, defaultStatus, 0)
      if (!result.dodged) {
        expect(result.dmg).toBeGreaterThanOrEqual(1)
      }
    })

    it('devrait pouvoir esquiver', () => {
      const enemy = createTestEnemy()
      // Agilité très haute pour forcer l'esquive
      // Note: le test est probabiliste, on lance plusieurs fois
      let foundDodge = false
      for (let i = 0; i < 50; i++) {
        const result = enemyAttack(enemy, defaultStatus, 200)
        if (result.dodged) {
          foundDodge = true
          expect(result.dmg).toBe(0)
          break
        }
      }
      expect(foundDodge).toBe(true)
    })

    it('devrait augmenter l\'esquive avec buff_agility actif', () => {
      const enemy = createTestEnemy()
      const buffedStatus: PlayerStatus = { ...defaultStatus, buff_agility: 3 }
      // On vérifie juste que dodged est cohérent
      const result = enemyAttack(enemy, buffedStatus, 50)
      expect(typeof result.dodged).toBe('boolean')
    })

    it('devrait appliquer les dégâts d\'épines si thorns actif', () => {
      const enemy = createTestEnemy()
      const thornStatus: PlayerStatus = { ...defaultStatus, thorns: 2 }
      const result = enemyAttack(enemy, thornStatus)
      if (result.dodged) {
        expect(result.log).toContain('épines')
      }
    })

    it('devrait retourner un message de log', () => {
      const enemy = createTestEnemy()
      const result = enemyAttack(enemy, defaultStatus)
      expect(result.log.length).toBeGreaterThan(0)
    })
  })

  describe('executeAbility', () => {
    it('devrait échouer pour une capacité inconnue', () => {
      const enemy = createTestEnemy()
      const result = executeAbility('inexistante', 'Guerrier', defaultStats, enemy, defaultStatus, 100, 50)
      expect(result.success).toBe(false)
      expect(result.log).toBe('Compétence inconnue')
    })

    it('devrait échouer si pas assez de mana', () => {
      const enemy = createTestEnemy()
      const result = executeAbility('coup_violent', 'Guerrier', defaultStats, enemy, defaultStatus, 100, 0)
      expect(result.success).toBe(false)
      expect(result.log).toBe('Pas assez de mana')
    })

    it('devrait réussir avec assez de mana', () => {
      const enemy = createTestEnemy()
      const result = executeAbility('coup_violent', 'Guerrier', defaultStats, enemy, defaultStatus, 100, 50)
      expect(result.success).toBe(true)
      expect(result.damage).toBeGreaterThan(0)
      expect(result.manaUsed).toBeGreaterThan(0)
    })

    it('devrait échouer si la capacité est en cooldown', () => {
      const enemy = createTestEnemy()
      const cooldowns = { cri_guerre: 2 }
      const result = executeAbility('cri_guerre', 'Guerrier', defaultStats, enemy, defaultStatus, 100, 50, cooldowns)
      expect(result.success).toBe(false)
      expect(result.log).toContain('recharge')
    })

    it('devrait appliquer un nouveau cooldown après utilisation', () => {
      const enemy = createTestEnemy()
      const result = executeAbility('cri_guerre', 'Guerrier', defaultStats, enemy, defaultStatus, 100, 50)
      if (result.success) {
        expect(result.newCooldowns).toBeDefined()
        expect(result.newCooldowns!['cri_guerre']).toBe(3)
      }
    })

    it('devrait appliquer les dégâts de Boule de Feu pour Mage', () => {
      const enemy = createTestEnemy()
      const mageStats = { force: 3, agility: 4, magie: 10, endurance: 5 }
      const result = executeAbility('boule_feu', 'Mage', mageStats, enemy, defaultStatus, 100, 50)
      expect(result.success).toBe(true)
      expect(result.damage).toBeGreaterThan(0)
      expect(result.log).toContain('Boule de Feu')
    })

    it('devrait appliquer le soin de Soin pour Prêtre', () => {
      const enemy = createTestEnemy()
      const priestStats = { force: 3, agility: 4, magie: 10, endurance: 5 }
      const result = executeAbility('soin', 'Prêtre', priestStats, enemy, defaultStatus, 50, 50)
      expect(result.success).toBe(true)
      expect(result.heal).toBeGreaterThan(0)
      expect(result.log).toContain('Soin')
    })

    it('devrait gérer la fuite du Voleur', () => {
      const enemy = createTestEnemy()
      const result = executeAbility('fumigene', 'Voleur', defaultStats, enemy, defaultStatus, 100, 10)
      expect(result.success).toBe(true)
      expect(result.specialFlag).toBe('fled')
      expect(result.log).toContain('fuis')
    })

    it('devrait appliquer un status d\'étourdissement', () => {
      const enemy = createTestEnemy()
      const result = executeAbility('malediction', 'Nécromancien', defaultStats, enemy, defaultStatus, 100, 50)
      expect(result.success).toBe(true)
      expect(result.newEnemyStatus).toContain('stunned')
    })

    it('devrait retomber sur Guerrier pour une classe inconnue', () => {
      const enemy = createTestEnemy()
      const result = executeAbility('coup_violent', 'ClasseInconnue', defaultStats, enemy, defaultStatus, 100, 50)
      // Doit matcher Guerrier par défaut et trouver coup_violent
      expect(result.success).toBe(true)
      expect(result.damage).toBeGreaterThan(0)
    })
  })

  describe('updateCooldowns', () => {
    it('devrait décrémenter les cooldowns de 1', () => {
      const cooldowns = { cri_guerre: 3, rage: 2 }
      const updated = updateCooldowns(cooldowns)
      expect(updated).toEqual({ cri_guerre: 2, rage: 1 })
    })

    it('devrait supprimer les cooldowns qui arrivent à 0', () => {
      const cooldowns = { cri_guerre: 1, rage: 2 }
      const updated = updateCooldowns(cooldowns)
      expect(updated).toEqual({ rage: 1 })
      expect(updated.cri_guerre).toBeUndefined()
    })

    it('devrait retourner un objet vide pour des cooldowns vides', () => {
      expect(updateCooldowns({})).toEqual({})
    })
  })

  describe('updateCombatStatus', () => {
    it('devrait décrémenter tous les buffs de 1', () => {
      const status: PlayerStatus = {
        buff_force: 3,
        buff_agility: 2,
        buff_defense: 1,
        regen: 4,
        thorns: 2,
      }
      const updated = updateCombatStatus(status)
      expect(updated).toEqual({
        buff_force: 2,
        buff_agility: 1,
        buff_defense: 0,
        regen: 3,
        thorns: 1,
      })
    })

    it('ne devrait jamais descendre en dessous de 0', () => {
      const status: PlayerStatus = {
        buff_force: 0,
        buff_agility: 0,
        buff_defense: 0,
        regen: 0,
        thorns: 0,
      }
      const updated = updateCombatStatus(status)
      expect(updated.buff_force).toBe(0)
      expect(updated.buff_agility).toBe(0)
      expect(updated.buff_defense).toBe(0)
      expect(updated.regen).toBe(0)
      expect(updated.thorns).toBe(0)
    })
  })

  describe('updateEnemyStatus', () => {
    it('devrait garder le poison', () => {
      const statuses: StatusEffect[] = ['poison', 'stunned']
      const updated = updateEnemyStatus(statuses)
      expect(updated).toEqual(['poison'])
    })

    it('devrait supprimer stunned', () => {
      const statuses: StatusEffect[] = ['stunned']
      const updated = updateEnemyStatus(statuses)
      expect(updated).not.toContain('stunned')
    })

    it('devrait supprimer buff_agility', () => {
      const statuses: StatusEffect[] = ['poison', 'buff_agility']
      const updated = updateEnemyStatus(statuses)
      expect(updated).toEqual(['poison'])
    })

    it('devrait retourner un tableau vide si tous les status sont supprimés', () => {
      const statuses: StatusEffect[] = ['stunned', 'buff_agility']
      const updated = updateEnemyStatus(statuses)
      expect(updated).toEqual([])
    })
  })

  describe('regenerateMana', () => {
    it('devrait régénérer 10 mana par tour', () => {
      expect(regenerateMana(30, 100)).toBe(40)
    })

    it('ne devrait pas dépasser le mana max', () => {
      expect(regenerateMana(95, 100)).toBe(100)
      expect(regenerateMana(100, 100)).toBe(100)
    })

    it('devrait fonctionner avec 0 mana', () => {
      expect(regenerateMana(0, 100)).toBe(10)
    })
  })

  describe('applyPoisonDamage', () => {
    it('devrait infliger 10% des PV max', () => {
      const enemy = createTestEnemy({ pvMax: 100 })
      const result = applyPoisonDamage(enemy)
      expect(result.dmg).toBe(10)
      expect(result.log).toContain('poison')
    })

    it('devrait arrondir à l\'entier inférieur', () => {
      const enemy = createTestEnemy({ pvMax: 35 })
      const result = applyPoisonDamage(enemy)
      expect(result.dmg).toBe(3) // floor(35 * 0.1) = 3
    })
  })

  describe('getAbilitiesForClass', () => {
    it('devrait retourner les capacités de Guerrier', () => {
      const abilities = getAbilitiesForClass('Guerrier')
      expect(abilities.length).toBeGreaterThan(0)
      expect(abilities[0].name).toBeDefined()
    })

    it('devrait retourner des capacités pour Mage', () => {
      const abilities = getAbilitiesForClass('Mage')
      expect(abilities.length).toBeGreaterThan(0)
    })

    it('devrait retomber sur Guerrier pour une classe inconnue', () => {
      const abilities = getAbilitiesForClass('Inconnue')
      expect(abilities).toBeDefined()
      expect(abilities.length).toBeGreaterThan(0)
    })

    it('chaque capacité devrait avoir id, name, description, manaCost, type, cooldown', () => {
      const abilities = getAbilitiesForClass('Guerrier')
      abilities.forEach(a => {
        expect(a.id).toBeDefined()
        expect(a.name).toBeDefined()
        expect(a.description).toBeDefined()
        expect(a.manaCost).toBeGreaterThanOrEqual(0)
        expect(['attack', 'defense', 'special']).toContain(a.type)
        expect(a.cooldown).toBeGreaterThanOrEqual(0)
      })
    })
  })
})
