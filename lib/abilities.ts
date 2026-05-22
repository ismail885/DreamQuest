// ============================================================
// SOURCE UNIQUE DE VÉRITÉ — Toutes les capacités du jeu
// DreamQuest - RPG Textuel Interactif
//
// Fusionne :
//   - combat.ts → ABILITIES (capacités de combat)
//   - randomGenerator.ts → ABILITIES_POOL (capacités niveau)
//   - classDefinitions.ts → ABILITIES_DATA (affichage)
// ============================================================

import type { CharacterClass } from '@/types/character';

// ===== TYPES UNIFIÉS =====

export type CombatAbilityType = "attack" | "defense" | "special";
export type DisplayAbilityType = "OFFENSIVE" | "DEFENSIVE" | "PASSIVE" | "SUPPORT" | "UTILITY";

export interface UnifiedAbility {
  id: string;
  name: string;
  description: string;
  class: CharacterClass;
  /** Données combat (undefined si ce n'est pas une capacité de combat) */
  combat?: {
    manaCost: number;
    combatType: CombatAbilityType;
    cooldown: number;
  };
  /** Données d'affichage (undefined si non renseigné) */
  display?: {
    displayType: DisplayAbilityType;
    detailedDescription: string;
  };
  /** Systèmes auxquels cette capacité appartient */
  source: "combat" | "pool" | "both";
}

// ===== CATALOGUE UNIFIÉ =====

export const ALL_ABILITIES: UnifiedAbility[] = [
  // ── GUERRIER ──────────────────────────────────────────
  { id: "coup_violent", name: "Coup Violent", description: "Attaque puissante qui ignore partiellement la défense", class: "Guerrier", combat: { manaCost: 15, combatType: "attack", cooldown: 0 }, source: "combat" },
  { id: "parade", name: "Parade", description: "Réduit les dommages du prochain attack", class: "Guerrier", combat: { manaCost: 10, combatType: "defense", cooldown: 0 }, source: "combat" },
  { id: "cri_guerre", name: "Cri de Guerre", description: "Augmente votre force pour 3 tours", class: "Guerrier", combat: { manaCost: 20, combatType: "special", cooldown: 3 }, display: { displayType: "UTILITY", detailedDescription: "Un cri terrifiant qui réduit la défense de tous les ennemis de 30% pour 3 tours." }, source: "both" },
  { id: "rage", name: "Rage", description: "Entre dans une furie guerrière, augmentant les dégâts de 30% pendant 3 tours.", class: "Guerrier", display: { displayType: "OFFENSIVE", detailedDescription: "Entre dans une furie guerrière, augmentant les dégâts de 30% pendant 3 tours." }, source: "pool" },
  { id: "coup_puissant", name: "Coup Puissant", description: "Un coup dévastateur infligeant 200% de dégâts de force à un ennemi.", class: "Guerrier", display: { displayType: "OFFENSIVE", detailedDescription: "Un coup dévastateur infligeant 200% de dégâts de force à un ennemi." }, source: "pool" },
  { id: "defense_fer", name: "Défense de Fer", description: "Renforce votre armure, réduisant les dégâts subis de 50% pendant 2 tours.", class: "Guerrier", display: { displayType: "DEFENSIVE", detailedDescription: "Renforce votre armure, réduisant les dégâts subis de 50% pendant 2 tours." }, source: "pool" },
  { id: "coup_bouclier", name: "Coup de Bouclier", description: "Frappe avec votre bouclier.", class: "Guerrier", source: "pool" },
  { id: "force_taureau", name: "Force du Taureau", description: "Puissance brute augmentée.", class: "Guerrier", source: "pool" },
  { id: "frappe_brutale", name: "Frappe Brutale", description: "Une frappe brutale.", class: "Guerrier", source: "pool" },
  { id: "posture_defensive", name: "Posture Défensive", description: "Adopte une posture défensive.", class: "Guerrier", source: "pool" },
  { id: "charge_heroique", name: "Charge Héroïque", description: "Chargez vos ennemis.", class: "Guerrier", source: "pool" },
  { id: "eventration", name: "Éventration", description: "Une attaque dévastatrice.", class: "Guerrier", source: "pool" },

  // ── MAGE ──────────────────────────────────────────────
  { id: "boule_feu", name: "Boule de Feu", description: "Attaque magique puissante", class: "Mage", combat: { manaCost: 20, combatType: "attack", cooldown: 0 }, display: { displayType: "OFFENSIVE", detailedDescription: "Projette une boule de feu infligeant 250% de dégâts de magie à tous les ennemis." }, source: "both" },
  { id: "bouclier_magique", name: "Bouclier Magique", description: "Barrière protectrice pendant 2 tours", class: "Mage", combat: { manaCost: 15, combatType: "defense", cooldown: 2 }, display: { displayType: "DEFENSIVE", detailedDescription: "Crée un bouclier absorbant les dégâts magiques pendant 3 tours." }, source: "both" },
  { id: "glace", name: "Champ de Glace", description: "Ralentit l'ennemi et réduit son agilité", class: "Mage", combat: { manaCost: 25, combatType: "special", cooldown: 3 }, source: "combat" },
  { id: "eclair", name: "Éclair", description: "Invoque un éclair du ciel infligeant 180% de dégâts de magie et étourdissant 1 tour.", class: "Mage", display: { displayType: "OFFENSIVE", detailedDescription: "Invoque un éclair du ciel infligeant 180% de dégâts de magie et étourdissant 1 tour." }, source: "pool" },
  { id: "teleportation", name: "Téléportation", description: "Vous déplace instantanément.", class: "Mage", source: "pool" },
  { id: "nova_feu", name: "Nova de Feu", description: "Une explosion de feu.", class: "Mage", source: "pool" },
  { id: "glacement", name: "Glacement", description: "Glace vos ennemis.", class: "Mage", source: "pool" },
  { id: "ecole_arcanes", name: "École des Arcanes", description: "Maîtrise des arcanes.", class: "Mage", source: "pool" },
  { id: "domination_mentale", name: "Domination Mentale", description: "Prenez le contrôle de l'esprit.", class: "Mage", source: "pool" },
  { id: "invocation_familier", name: "Invocation de Familier", description: "Invoque un familier.", class: "Mage", source: "pool" },
  { id: "mur_force", name: "Mur de Force", description: "Crée un mur protecteur.", class: "Mage", source: "pool" },

  // ── ASSASSIN ──────────────────────────────────────────
  { id: "attaque_sournoise", name: "Attaque Sournoise", description: "Coup critique garanti si caché", class: "Assassin", combat: { manaCost: 15, combatType: "attack", cooldown: 0 }, display: { displayType: "OFFENSIVE", detailedDescription: "Une attaque furtive infligeant 300% de dégâts d'agilité. Critique si invisible." }, source: "both" },
  { id: "empoisonnement", name: "Empoisonnement", description: "Empoisonne l'ennemi pour 3 tours", class: "Assassin", combat: { manaCost: 20, combatType: "special", cooldown: 2 }, source: "combat" },
  { id: "cachette", name: "Cachette", description: "Deviens difficile à toucher pendant 2 tours", class: "Assassin", combat: { manaCost: 10, combatType: "defense", cooldown: 2 }, source: "combat" },
  { id: "invisibilite", name: "Invisibilité", description: "Devient invisible, garantissant que votre prochaine attaque sera un critique.", class: "Assassin", display: { displayType: "UTILITY", detailedDescription: "Devient invisible, garantissant que votre prochaine attaque sera un critique." }, source: "pool" },
  { id: "evasion", name: "Évasion", description: "Esquive la prochaine attaque ennemie avec 90% de chance.", class: "Assassin", display: { displayType: "DEFENSIVE", detailedDescription: "Esquive la prochaine attaque ennemie avec 90% de chance." }, source: "pool" },
  { id: "assassinat", name: "Assassinat", description: "Élimine une cible faible.", class: "Assassin", source: "pool" },
  { id: "lame_empoisonnee", name: "Lame Empoisonnée", description: "Une lame enduite de poison.", class: "Assassin", source: "pool" },
  { id: "pas_ombre", name: "Pas de l'Ombre", description: "Déplacement furtif.", class: "Assassin", source: "pool" },
  { id: "tueur_silencieux", name: "Tueur Silencieux", description: "Élimination silencieuse.", class: "Assassin", source: "pool" },
  { id: "coup_critique", name: "Coup Critique", description: "Tente un coup critique.", class: "Assassin", source: "pool" },
  { id: "fuite_tactique", name: "Fuite Tactique", description: "Fuite calculée.", class: "Assassin", source: "pool" },

  // ── NÉCROMANCIEN ─────────────────────────────────────
  { id: "drain_vie", name: "Drain de Vie", description: "Vole des PV à l'ennemi", class: "Nécromancien", combat: { manaCost: 15, combatType: "attack", cooldown: 0 }, display: { displayType: "OFFENSIVE", detailedDescription: "Aspire la force vitale d'un ennemi, infligeant 120% de dégâts et vous soignant de 50%." }, source: "both" },
  { id: "invocation_squelette", name: "Invocation", description: "Invoque un squelette qui attaque l'ennemi", class: "Nécromancien", combat: { manaCost: 30, combatType: "special", cooldown: 4 }, source: "combat" },
  { id: "malediction", name: "Malédiction", description: "Réduit les stats de l'ennemi", class: "Nécromancien", combat: { manaCost: 25, combatType: "special", cooldown: 3 }, display: { displayType: "UTILITY", detailedDescription: "Maudit un ennemi, réduisant ses statistiques de 25% pendant 4 tours." }, source: "both" },
  { id: "armee_morts", name: "Armée de Morts", description: "Invoque des sbires squelettiques qui attaquent vos ennemis pendant 3 tours.", class: "Nécromancien", display: { displayType: "OFFENSIVE", detailedDescription: "Invoque des sbires squelettiques qui attaquent vos ennemis pendant 3 tours." }, source: "pool" },
  { id: "terreur", name: "Terreur", description: "Terrifie vos ennemis.", class: "Nécromancien", source: "pool" },
  { id: "sceau_ombres", name: "Sceau des Ombres", description: "Marque les âmes.", class: "Nécromancien", source: "pool" },
  { id: "resurrection_noir", name: "Résurrection Noir", description: "Ramène les morts.", class: "Nécromancien", source: "pool" },
  { id: "corruption", name: "Corruption", description: "Corrompt votre cible.", class: "Nécromancien", source: "pool" },
  { id: "voile_mort", name: "Voile de la Mort", description: "Protection mortelle.", class: "Nécromancien", source: "pool" },
  { id: "ame_parcheminee", name: "Âme Parcheminée", description: "Invoque une âme.", class: "Nécromancien", source: "pool" },

  // ── PALADIN ───────────────────────────────────────────
  { id: "frappe_sainte", name: "Frappe Sainte", description: "Attaque sacrée contre les morts-vivants", class: "Paladin", combat: { manaCost: 20, combatType: "attack", cooldown: 0 }, source: "combat" },
  { id: "bouclier_faith", name: "Bouclier de Foi", description: "Invulnérable pendant 1 tour", class: "Paladin", combat: { manaCost: 25, combatType: "defense", cooldown: 3 }, display: { displayType: "DEFENSIVE", detailedDescription: "Un bouclier sacré qui absorbe les dégâts et soigne de 10% par tour." }, source: "both" },
  { id: "benediction", name: "Bénédiction", description: "Restaure des PV et augmente la défense", class: "Paladin", combat: { manaCost: 20, combatType: "special", cooldown: 2 }, display: { displayType: "SUPPORT", detailedDescription: "Bénit le groupe, augmentant toutes les statistiques de 15% pour 3 tours." }, source: "both" },
  { id: "bouclier_sacre", name: "Bouclier Sacré", description: "Invoque un bouclier divin réduisant tous les dégâts de 60% pendant 2 tours.", class: "Paladin", display: { displayType: "DEFENSIVE", detailedDescription: "Invoque un bouclier divin réduisant tous les dégâts de 60% pendant 2 tours." }, source: "pool" },
  { id: "faveur_divine", name: "Faveur Divine", description: "Invoque une faveur divine augmentant la force et l'endurance de 25% pour 3 tours.", class: "Paladin", display: { displayType: "SUPPORT", detailedDescription: "Invoque une faveur divine augmentant la force et l'endurance de 25% pour 3 tours." }, source: "pool" },
  { id: "chatiment", name: "Châtiment", description: "Invoque la lumière sacrée pour infliger 150% de dégâts et soigner l'utilisateur de 20%.", class: "Paladin", display: { displayType: "OFFENSIVE", detailedDescription: "Invoque la lumière sacrée pour infliger 150% de dégâts et soigner l'utilisateur de 20%." }, source: "pool" },
  { id: "jugement", name: "Jugement", description: "Juge vos ennemis.", class: "Paladin", source: "pool" },
  { id: "marteau_justice", name: "Marteau de Justice", description: "Un marteau divin.", class: "Paladin", source: "pool" },
  { id: "aube_lumineuse", name: "Aube Lumineuse", description: "Lumière éclatante.", class: "Paladin", source: "pool" },
  { id: "protection_stellaire", name: "Protection Stellaire", description: "Protection céleste.", class: "Paladin", source: "pool" },
  { id: "bannissement", name: "Bannissement", description: "Bannit les démons.", class: "Paladin", source: "pool" },
  { id: "croisade", name: "Croisade", description: "Marche sacrée.", class: "Paladin", source: "pool" },
  { id: "foi_inebranlable", name: "Foi Inébranlable", description: "Défense suprême.", class: "Paladin", source: "pool" },

  // ── PRÊTRE ────────────────────────────────────────────
  { id: "rayon_lumiere", name: "Rayon de Lumière", description: "Attaque sacrée", class: "Prêtre", combat: { manaCost: 15, combatType: "attack", cooldown: 0 }, source: "combat" },
  { id: "soin", name: "Soin", description: "Restaure des PV", class: "Prêtre", combat: { manaCost: 20, combatType: "special", cooldown: 0 }, display: { displayType: "SUPPORT", detailedDescription: "Invoque la lumière pour restaurer 40% des PV maximum d'un allié." }, source: "both" },
  { id: "purification", name: "Purification", description: "Soigne tous les effets de statut", class: "Prêtre", combat: { manaCost: 15, combatType: "special", cooldown: 2 }, source: "combat" },
  { id: "priere_guerisseuse", name: "Prière Guérisseuse", description: "Une prière puissante qui restaure 60% des PV de tous les alliés.", class: "Prêtre", display: { displayType: "SUPPORT", detailedDescription: "Une prière puissante qui restaure 60% des PV de tous les alliés." }, source: "pool" },
  { id: "protection_divine", name: "Protection Divine", description: "Bénit un allié, réduisant les dégâts qu'il subit de 40% pendant 3 tours.", class: "Prêtre", display: { displayType: "SUPPORT", detailedDescription: "Bénit un allié, réduisant les dégâts qu'il subit de 40% pendant 3 tours." }, source: "pool" },
  { id: "resurrection", name: "Résurrection", description: "Ramène un allié à la vie avec 50% de ses PV maximum.", class: "Prêtre", display: { displayType: "SUPPORT", detailedDescription: "Ramène un allié à la vie avec 50% de ses PV maximum." }, source: "pool" },
  { id: "aura_sacree", name: "Aura Sacrée", description: "Émet une aura lumineuse qui soigne tous les alliés de 15% chaque tour.", class: "Prêtre", display: { displayType: "SUPPORT", detailedDescription: "Émet une aura lumineuse qui soigne tous les alliés de 15% chaque tour." }, source: "pool" },
  { id: "lumiere_sainte", name: "Lumière Sainte", description: "Lumière divine.", class: "Prêtre", source: "pool" },
  { id: "guerison_masse", name: "Guérison de Masse", description: "Soigne tout le groupe.", class: "Prêtre", source: "pool" },
  { id: "exorcisme", name: "Exorcisme", description: "Chasse les démons.", class: "Prêtre", source: "pool" },
  { id: "priere_misericorde", name: "Prière de Miséricorde", description: "Prière de grâce.", class: "Prêtre", source: "pool" },
  { id: "rayon_soleil", name: "Rayon de Soleil", description: "Rayon céleste.", class: "Prêtre", source: "pool" },
  { id: "don_vie", name: "Don de Vie", description: "Donne de la vie.", class: "Prêtre", source: "pool" },

  // ── ARCHER ────────────────────────────────────────────
  { id: "tir_precis", name: "Tir Précis", description: "Attaque à distance précise", class: "Archer", combat: { manaCost: 10, combatType: "attack", cooldown: 0 }, display: { displayType: "OFFENSIVE", detailedDescription: "Un tir parfaitement ajusté infligeant 280% de dégâts d'agilité. Critique garanti." }, source: "both" },
  { id: "piege", name: "Piège", description: "Immobilise l'ennemi pendant 1 tour", class: "Archer", combat: { manaCost: 15, combatType: "special", cooldown: 2 }, source: "combat" },
  { id: "visee", name: "Visée", description: "Augmente les chances de critique", class: "Archer", combat: { manaCost: 20, combatType: "special", cooldown: 3 }, source: "combat" },
  { id: "tir_percant", name: "Tir Perçant", description: "Une flèche qui traverse les défenses, infligeant 220% de dégâts d'agilité.", class: "Archer", display: { displayType: "OFFENSIVE", detailedDescription: "Une flèche qui traverse les défenses, infligeant 220% de dégâts d'agilité." }, source: "pool" },
  { id: "pluie_fleches", name: "Pluie de Flèches", description: "Déchaîne une pluie de flèches infligeant 150% de dégâts à tous les ennemis.", class: "Archer", display: { displayType: "OFFENSIVE", detailedDescription: "Déchaîne une pluie de flèches infligeant 150% de dégâts à tous les ennemis." }, source: "pool" },
  { id: "vision_aigle", name: "Vision d'Aigle", description: "Aiguise votre vision, augmentant la précision et les chances de critique de 30%.", class: "Archer", display: { displayType: "PASSIVE", detailedDescription: "Aiguise votre vision, augmentant la précision et les chances de critique de 30%." }, source: "pool" },
  { id: "instinct_chasseur", name: "Instinct de Chasseur", description: "Repère les faiblesses de l'ennemi, augmentant les dégâts critiques de 40%.", class: "Archer", display: { displayType: "PASSIVE", detailedDescription: "Repère les faiblesses de l'ennemi, augmentant les dégâts critiques de 40%." }, source: "pool" },
  { id: "tir_rapide", name: "Tir Rapide", description: "Tir rapide.", class: "Archer", source: "pool" },
  { id: "chasseur_experimente", name: "Chasseur Expérimenté", description: "Expérience de chasse.", class: "Archer", source: "pool" },
  { id: "tir_fusant", name: "Tir Fusant", description: "Tir enflammé.", class: "Archer", source: "pool" },
  { id: "coup_precision", name: "Coup de Précision", description: "Précision absolue.", class: "Archer", source: "pool" },

  // ── DRUIDE ────────────────────────────────────────────
  { id: "griffes_nature", name: "Griffes de Nature", description: "Attaque naturelle", class: "Druide", combat: { manaCost: 10, combatType: "attack", cooldown: 0 }, source: "combat" },
  { id: "epines", name: "Épines", description: "L'ennemi prend des dégâts en attaquant", class: "Druide", combat: { manaCost: 15, combatType: "defense", cooldown: 2 }, source: "combat" },
  { id: "guerison", name: "Guérison", description: "Restaure des PV et du mana", class: "Druide", combat: { manaCost: 25, combatType: "special", cooldown: 3 }, source: "combat" },
  { id: "forme_animale", name: "Forme Animale", description: "Se transforme en ours puissant, augmentant force et endurance de 40% pendant 4 tours.", class: "Druide", display: { displayType: "OFFENSIVE", detailedDescription: "Se transforme en ours puissant, augmentant force et endurance de 40% pendant 4 tours." }, source: "pool" },
  { id: "epines_venimeuses", name: "Épines Venimeuses", description: "Invoque des épines qui empoisonnent l'ennemi, infligeant 20% de dégâts par tour.", class: "Druide", display: { displayType: "OFFENSIVE", detailedDescription: "Invoque des épines qui empoisonnent l'ennemi, infligeant 20% de dégâts par tour." }, source: "pool" },
  { id: "regeneration", name: "Régénération", description: "Canalise l'énergie de la nature pour restaurer 25% de vos PV chaque tour.", class: "Druide", display: { displayType: "SUPPORT", detailedDescription: "Canalise l'énergie de la nature pour restaurer 25% de vos PV chaque tour." }, source: "pool" },
  { id: "etreinte_nature", name: "Étreinte de la Nature", description: "Les racines de la nature immobilisent un ennemi pendant 2 tours.", class: "Druide", display: { displayType: "UTILITY", detailedDescription: "Les racines de la nature immobilisent un ennemi pendant 2 tours." }, source: "pool" },
  { id: "metamorphose", name: "Métamorphose", description: "Transformation.", class: "Druide", source: "pool" },
  { id: "tempete_feu", name: "Tempête de Feu", description: "Feu dévastateur.", class: "Druide", source: "pool" },
  { id: "croissance_acceleree", name: "Croissance Accélérée", description: "Végétation rapide.", class: "Druide", source: "pool" },
  { id: "lien_spirituel", name: "Lien Spirituel", description: "Connexion spirituelle.", class: "Druide", source: "pool" },
  { id: "serenite_foret", name: "Sérénité de la Forêt", description: "Paix intérieure.", class: "Druide", source: "pool" },
  { id: "puissance_primordiale", name: "Puissance Primordiale", description: "Force originelle.", class: "Druide", source: "pool" },
  { id: "guerison_totale", name: "Guérison Totale", description: "Soin intégral.", class: "Druide", source: "pool" },

  // ── VOLEUR ────────────────────────────────────────────
  { id: "coup_dague", name: "Coup de Dague", description: "Attaque rapide", class: "Voleur", combat: { manaCost: 10, combatType: "attack", cooldown: 0 }, source: "combat" },
  { id: "fumigene", name: "Fumigène", description: "Fuite garantie", class: "Voleur", combat: { manaCost: 5, combatType: "special", cooldown: 3 }, source: "combat" },
  { id: "jet_de_sable", name: "Jet de Sable", description: "Étourdit l'ennemi", class: "Voleur", combat: { manaCost: 15, combatType: "special", cooldown: 2 }, source: "combat" },
  { id: "crochetage", name: "Crochetage", description: "Ouvre les serrures verrouillées avec une grande discrétion.", class: "Voleur", display: { displayType: "UTILITY", detailedDescription: "Ouvre les serrures verrouillées avec une grande discrétion." }, source: "pool" },
  { id: "pickpocket", name: "Pickpocket", description: "Dérobe l'argent d'un ennemi sans qu'il s'en aperçoive.", class: "Voleur", display: { displayType: "UTILITY", detailedDescription: "Dérobe l'argent d'un ennemi sans qu'il s'en aperçoive." }, source: "pool" },
  { id: "evasion_rapide", name: "Évasion Rapide", description: "Vous téléporte derrière les lignes ennemies, et esquive toute attaque ce tour.", class: "Voleur", display: { displayType: "DEFENSIVE", detailedDescription: "Vous téléporte derrière les lignes ennemies, et esquive toute attaque ce tour." }, source: "pool" },
  { id: "coup_silencieux", name: "Coup Silencieux", description: "Un coup rapide et silencieux infligeant 200% de dégâts.", class: "Voleur", display: { displayType: "OFFENSIVE", detailedDescription: "Un coup rapide et silencieux infligeant 200% de dégâts. Ne révèle pas votre position." }, source: "pool" },
  { id: "filouterie", name: "Filouterie", description: "Détecte et désarme les pièges.", class: "Voleur", display: { displayType: "UTILITY", detailedDescription: "Détecte et désarme les pièges avec une grande efficacité." }, source: "pool" },
  { id: "fuite_agile", name: "Fuite Agile", description: "Tente de fuir le combat avec 85% de chance de succès.", class: "Voleur", display: { displayType: "UTILITY", detailedDescription: "Tente de fuir le combat avec 85% de chance de succès." }, source: "pool" },
  { id: "ombre_fugitive", name: "Ombre Fugitive", description: "Disparition dans l'ombre.", class: "Voleur", source: "pool" },

  // ── BARBARE ───────────────────────────────────────────
  { id: "frenesie", name: "Frénésie", description: "Attaque double pour ce tour", class: "Barbare", combat: { manaCost: 20, combatType: "attack", cooldown: 0 }, source: "combat" },
  { id: "rugissement", name: "Rugissement", description: "Terrifie l'ennemi, annule son prochain attack", class: "Barbare", combat: { manaCost: 15, combatType: "defense", cooldown: 2 }, source: "combat" },
  { id: "furia", name: "Furie du Barbare", description: "Multiples attacks pendant 2 tours", class: "Barbare", combat: { manaCost: 30, combatType: "special", cooldown: 4 }, source: "combat" },
  { id: "rage_bestiale", name: "Rage Bestiale", description: "Invoque la fureur primitive, augmentant les dégâts de 50% mais réduisant la défense de 20%.", class: "Barbare", display: { displayType: "OFFENSIVE", detailedDescription: "Invoque la fureur primitive, augmentant les dégâts de 50% mais réduisant la défense de 20%." }, source: "pool" },
  { id: "coup_devastateur", name: "Coup Dévastateur", description: "Un coup d'une puissance inouïe infligeant 350% de dégâts de force.", class: "Barbare", display: { displayType: "OFFENSIVE", detailedDescription: "Un coup d'une puissance inouïe infligeant 350% de dégâts de force." }, source: "pool" },
  { id: "berserker", name: "Berserker", description: "Entre en transe berserker : plus vos PV sont bas, plus vos dégâts augmentent.", class: "Barbare", display: { displayType: "PASSIVE", detailedDescription: "Entre en transe berserker : plus vos PV sont bas, plus vos dégâts augmentent." }, source: "pool" },
  { id: "charge_sauvage", name: "Charge Sauvage", description: "Charge puissante.", class: "Barbare", source: "pool" },
  { id: "furie_incontrolable", name: "Furie Incontrôlable", description: "Rage dévastatrice.", class: "Barbare", source: "pool" },
  { id: "ecraseur", name: "Écraseur", description: "Frappe au sol.", class: "Barbare", source: "pool" },
  { id: "massacre", name: "Massacre", description: "Dévastation totale.", class: "Barbare", source: "pool" },
  { id: "tempete_coups", name: "Tempête de Coups", description: "Rafale de coups.", class: "Barbare", source: "pool" },
];

// ===== HELPERS : Reconstruction des anciens formats =====

/** Map classe → capacités de combat (pour combat.ts) */
export function getCombatAbilitiesByClass(className: string): UnifiedAbility[] {
  return ALL_ABILITIES.filter(
    a => a.class.localeCompare(className, undefined, { sensitivity: 'base' }) === 0
      && a.combat !== undefined
  );
}

/** Map classe → noms des capacités de pool (pour randomGenerator.ts) */
export function getPoolAbilityNames(className: string): string[] {
  return ALL_ABILITIES
    .filter(a => a.class.localeCompare(className, undefined, { sensitivity: 'base' }) === 0)
    .map(a => a.name);
}

/** Map classe → capacités de pool complètes (pour classDefinitions.ts) */
export function getPoolAbilities(className: string): UnifiedAbility[] {
  return ALL_ABILITIES
    .filter(a => a.class.localeCompare(className, undefined, { sensitivity: 'base' }) === 0);
}

/** Trouver une capacité par son ID */
export function getAbilityById(id: string): UnifiedAbility | undefined {
  return ALL_ABILITIES.find(a => a.id === id);
}

/** Trouver une capacité par son nom (insensible à la casse) */
export function getAbilityByName(name: string): UnifiedAbility | undefined {
  return ALL_ABILITIES.find(a => a.name.localeCompare(name, undefined, { sensitivity: 'base' }) === 0);
}
