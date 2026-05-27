// ============================================================
// GESTIONNAIRES D'EFFETS DE CAPACITÉS DE COMBAT
// DreamQuest - RPG Textuel Interactif
//
// Chaque effet est une fonction pure, isolée et testable.
// Le switch géant de combat.ts est remplacé par un Record lookup.
// ============================================================

import type { Enemy, StatusEffect } from '@/data/enemies';
import type { PlayerStatus } from './combat';

// ===== TYPES =====

export interface AbilityEffectInput {
  stats: { force: number; agility: number; magie: number; endurance: number };
  enemy: Enemy;
  currentStatus: PlayerStatus;
  playerPv: number;
  playerMana: number;
}

export interface AbilityEffectResult {
  damage?: number;
  heal?: number;
  newStatus?: PlayerStatus;
  newEnemyStatus?: StatusEffect[];
  /** Modifications à appliquer à l'ennemi (ex: réduction d'agilité par glace) */
  enemyModifications?: Partial<Pick<Enemy, 'agility' | 'force' | 'intelligence'>>;
  log: string;
  /** true = effet spécial qui ne déclenche pas la suite normale (ex: fuite) */
  specialFlag?: 'fled';
}

export type AbilityHandler = (input: AbilityEffectInput) => AbilityEffectResult;

// ===== GESTIONNAIRES INDIVIDUELS =====

const coupViolent: AbilityHandler = ({ stats }) => {
  const damage = Math.floor(stats.force * 1.5);
  return { damage, log: `Coup Violent! ${damage} dégâts!` };
};

const parade: AbilityHandler = ({ currentStatus }) => ({
  newStatus: { ...currentStatus, buff_defense: currentStatus.buff_defense + 2 },
  log: 'Parade! Réduction des dégâts pour 2 tours.',
});

const criGuerre: AbilityHandler = ({ currentStatus }) => ({
  newStatus: { ...currentStatus, buff_force: currentStatus.buff_force + 3 },
  log: 'Cri de Guerre! Force augmentée pour 3 tours!',
});

const bouleFeu: AbilityHandler = ({ stats }) => {
  const damage = Math.floor(stats.magie * 2);
  return { damage, log: `Boule de Feu! ${damage} dégâts magiques!` };
};

const bouclierMagique: AbilityHandler = ({ currentStatus }) => ({
  newStatus: { ...currentStatus, buff_defense: currentStatus.buff_defense + 2 },
  log: 'Bouclier Magique! Protégé pendant 2 tours.',
});

const glace: AbilityHandler = ({ enemy }) => ({
  enemyModifications: { agility: Math.max(1, enemy.agility - 5) },
  log: "Champ de Glace! L'ennemi est ralenti!",
});

const attaqueSournoise: AbilityHandler = ({ stats, currentStatus }) => {
  const sneakBonus = currentStatus.buff_agility > 0 ? 1.5 : 1;
  const damage = Math.floor(stats.agility * sneakBonus * 1.2);
  return { damage, log: `Attaque Sournoise! ${damage} dégâts!` };
};

const empoisonnement: AbilityHandler = () => ({
  newEnemyStatus: ['poison' as StatusEffect],
  log: "Empoisonnement! L'ennemi est empoisonné.",
});

const cachette: AbilityHandler = ({ currentStatus }) => ({
  newStatus: { ...currentStatus, buff_agility: currentStatus.buff_agility + 2 },
  log: 'Cachette! Plus difficile à toucher pendant 2 tours.',
});

const drainVie: AbilityHandler = ({ stats }) => {
  const damage = Math.floor(stats.magie * 1.2);
  const heal = Math.floor(damage / 2);
  return { damage, heal, log: `Drain de Vie! ${damage} dégâts et +${heal} PV!` };
};

const invocationSquelette: AbilityHandler = ({ stats }) => {
  const damage = Math.floor(stats.magie * 0.8);
  const heal = Math.floor(stats.magie * 0.5);
  return { damage, heal, log: `Invocation! Squelette inflige ${damage} dégâts et te soigne de ${heal} PV.` };
};

const malediction: AbilityHandler = () => ({
  newEnemyStatus: ['stunned' as StatusEffect],
  log: "Malédiction! L'ennemi est étourdi!",
});

const tirPrecis: AbilityHandler = ({ stats }) => {
  const damage = Math.floor(stats.agility * 1.3);
  return { damage, log: `Tir Précis! ${damage} dégâts!` };
};

const piege: AbilityHandler = () => ({
  newEnemyStatus: ['stunned' as StatusEffect],
  log: "Piège! L'ennemi est immobilisé ce tour.",
});

const visee: AbilityHandler = ({ currentStatus }) => ({
  newStatus: { ...currentStatus, buff_agility: currentStatus.buff_agility + 2 },
  log: 'Visée! Chances de critique augmentées!',
});

const frappeSainte: AbilityHandler = ({ stats, enemy }) => {
  const isUndead = enemy.id === 'squelette' || enemy.id === 'nécromancien';
  const damage = isUndead ? Math.floor(stats.magie * 2.5) : Math.floor(stats.magie * 1.2);
  const log = isUndead
    ? `Frappe Sainte! SUPER EFFICACE! ${damage} dégâts!`
    : `Frappe Sainte! ${damage} dégâts!`;
  return { damage, log };
};

const bouclierFaith: AbilityHandler = ({ currentStatus }) => ({
  newStatus: { ...currentStatus, buff_defense: currentStatus.buff_defense + 3 },
  log: 'Bouclier de Foi! Invulnérable ce tour!',
});

const benediction: AbilityHandler = ({ stats, currentStatus }) => {
  const heal = Math.floor(stats.magie * 1.5);
  return {
    heal,
    newStatus: { ...currentStatus, buff_defense: currentStatus.buff_defense + 2 },
    log: `Bénédiction! +${heal} PV et défense augmentée!`,
  };
};

const rayonLumiere: AbilityHandler = ({ stats }) => {
  const damage = Math.floor(stats.magie * 1.4);
  return { damage, log: `Rayon de Lumière! ${damage} dégâts!` };
};

const soin: AbilityHandler = ({ stats }) => {
  const heal = Math.floor(stats.magie * 2);
  return { heal, log: `Soin! +${heal} PV!` };
};

const purification: AbilityHandler = ({ stats }) => {
  const heal = Math.floor(stats.magie * 0.5);
  return {
    heal,
    newStatus: { buff_force: 0, buff_agility: 0, buff_defense: 0, regen: 0, thorns: 0 },
    log: `Purification! Tous les effets annulés et +${heal} PV.`,
  };
};

const griffesNature: AbilityHandler = ({ stats }) => {
  const damage = Math.floor(stats.force * 1.2 + stats.agility * 0.5);
  return { damage, log: `Griffes de Nature! ${damage} dégâts!` };
};

const epines: AbilityHandler = ({ currentStatus }) => ({
  newStatus: { ...currentStatus, thorns: currentStatus.thorns + 2 },
  log: 'Épines! L\'ennemi se blesse en attaquant.',
});

const guerison: AbilityHandler = ({ stats }) => {
  const heal = Math.floor(stats.magie * 1.5);
  return { heal, log: `Guérison! +${heal} PV et +20 Mana!` };
};

const coupDague: AbilityHandler = ({ stats }) => {
  const damage = Math.floor(stats.agility * 1.1);
  return { damage, log: `Coup de Dague! ${damage} dégâts!` };
};

const fumigene: AbilityHandler = () => ({
  log: 'Tu utilises le fumigène et fuis le combat!',
  specialFlag: 'fled' as const,
});

const jetDeSable: AbilityHandler = () => ({
  newEnemyStatus: ['stunned' as StatusEffect],
  log: "Jet de Sable! L'ennemi est étourdi!",
});

const frenesie: AbilityHandler = ({ stats }) => {
  const hit1 = Math.floor(stats.force * 0.8);
  const hit2 = Math.floor(stats.force * 0.8);
  const damage = hit1 + hit2;
  return { damage, log: `Frénésie! Deux coups pour ${damage} dégâts!` };
};

const rugissement: AbilityHandler = ({ currentStatus }) => ({
  newStatus: { ...currentStatus, buff_defense: currentStatus.buff_defense + 2 },
  log: "Rugissement! L'ennemi est terrifié!",
});

const furia: AbilityHandler = ({ currentStatus }) => ({
  newStatus: {
    ...currentStatus,
    buff_force: currentStatus.buff_force + 2,
    buff_agility: currentStatus.buff_agility + 2,
  },
  log: 'Furie du Barbare! Force et Agilité augmentées pour 2 tours!',
});

// ===== REGISTRY : Map ID → Handler =====

export const ABILITY_HANDLERS: Record<string, AbilityHandler> = {
  coup_violent: coupViolent,
  parade,
  cri_guerre: criGuerre,
  boule_feu: bouleFeu,
  bouclier_magique: bouclierMagique,
  glace,
  attaque_sournoise: attaqueSournoise,
  empoisonnement,
  cachette,
  drain_vie: drainVie,
  invocation_squelette: invocationSquelette,
  malediction,
  tir_precis: tirPrecis,
  piege,
  visée: visee,
  frappe_sainte: frappeSainte,
  bouclier_faith: bouclierFaith,
  benediction,
  rayon_lumiere: rayonLumiere,
  soin,
  purification,
  griffes_nature: griffesNature,
  épines: epines,
  guerison,
  coup_dague: coupDague,
  fumigene,
  jet_de_sable: jetDeSable,
  frénésie: frenesie,
  rugissement,
  furia,
};
