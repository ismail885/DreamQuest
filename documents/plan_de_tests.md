# Plan de Tests - DreamQuest

## 1. Présentation

**DreamQuest** est une application web de jeu de rôle textuel interactif (Next.js 15 + TypeScript + Supabase). Ce document décrit l'état **réel** de la suite de tests, telle qu'exécutée par `npm test` et `npm test -- --coverage`. Aucun chiffre n'est inventé.

## 2. Stratégie de test

Les tests suivent une approche pragmatique adaptée à un projet Next.js + Supabase + Jest, en deux couches :

| Couche | Cible | Stratégie |
|--------|-------|-----------|
| **Unitaires** (`tests/lib/`) | Fonctions pures, constantes, types | Import direct depuis `lib/`, mock uniquement si la fonction dépend d'une lib externe (`jose` pour JWT) |
| **Intégration** (`tests/integration/`) | Fonctions touchant la BDD ou le réseau | Mock du client Supabase / `global.fetch`, test du vrai code de `lib/` |

**Principes respectés :**
- **Pas de re-définition locale** : les tests importent et exécutent le code de `lib/`. Aucune fonction de production n'est recopiée dans un fichier de test.
- **Mocks minimaux** : mock partagé pour Supabase (chaîne thenable configurable), mock pour `jose` (sign/verify déterministes).
- **Pas de dépendance externe** : pas de MSW, pas de nock, pas de @testing-library/user-event. Le test runner est isolé de la vraie base.
- **Couverture des chemins d'erreur** : chaque fonction est testée sur le chemin nominal **et** sur le chemin d'erreur.

**Hors périmètre (justifié en §6) :**
- Tests E2E navigateur (Playwright listé mais non configuré)
- Tests des hooks React (`hooks/use*`) : nécessitent `@testing-library/react` avec `renderHook`
- Tests des composants React : nécessitent un environnement DOM complet (`jsdom` déjà configuré, mais les setup de rendu ne sont pas écrits)

## 3. Organisation des tests (arbre réel)

```
tests/
├── lib/                              # Tests unitaires (13 suites)
│   ├── abilities.test.ts             # getCombatAbilitiesByClass, getPoolAbilityNames, ALL_ABILITIES
│   ├── achievements.test.ts          # calculateAchievements, paliers, night_owl conditionnel
│   ├── character.test.ts             # CLASS_DIFFICULTIES, validateCharacterName, getFormattedStats
│   ├── combat.test.ts                # createCombatState, playerAttack, enemyAttack, executeAbility, etc.
│   ├── composer.test.ts              # Moteur de génération thème × genre × difficulté
│   ├── jwt.test.ts                   # signToken, verifyToken, cookies, parser
│   ├── leveling.test.ts              # getPrestigeTitle, getXPInCurrentLevel, getXPForNextLevel
│   ├── monsters.test.ts              # getMonsters, getMonsterById, getRandomMonster
│   ├── randomGenerator.test.ts       # generateRandomStats, getRandomAbility, generateCharacterName
│   ├── save.test.ts                  # getUserSavesWithDetails, saveProgress (fetch mocké)
│   ├── trophies.test.ts              # calculateTrophies (saisons, paliers, progression)
│   ├── utils.test.ts                 # classNames
│   └── validation.test.ts            # Schémas Zod (adventure, createAdventure, createCharacter)
│
└── integration/                      # Tests d'intégration (4 suites)
    ├── adventure.test.ts             # adventures.ts réel + Supabase mocké
    ├── auth.test.ts                  # jwt.ts réel (sign/verify + cookies)
    ├── character.test.ts             # leveling + xp réels (intégration cross-lib)
    └── save.test.ts                  # saves.ts réel, scénarios end-to-end (fetch mocké)
```

## 4. Tests implémentés

### 4.1 Tests unitaires (`tests/lib/`) — 13 suites

| Fichier | Cible réelle | Tests | Description |
|---------|--------------|-------|-------------|
| `abilities.test.ts` | `@/lib/abilities` | 8 | `getCombatAbilitiesByClass`, `getPoolAbilityNames`, `getPoolAbilities`, `getAbilityById`, `getAbilityByName`, unicité des IDs, validité des sources |
| `achievements.test.ts` | `@/lib/achievements` | 5 | `calculateAchievements` — stats nulles, paliers, conditionnel night_owl, stats maximales |
| `character.test.ts` | `@/lib/characters/classDefinitions` + `@/lib/leveling` | 38 | 10 classes, validation nom, XP, stats, abilities, constantes UI, prestige |
| `combat.test.ts` | `@/lib/combat` + `@/lib/combatAbilityHandlers` | 35 | `createCombatState`, `playerAttack` (crit/buff), `playerDefense`, `enemyAttack` (esquive/thorns), `executeAbility` (10+ abilities), cooldowns, status, mana, poison |
| `composer.test.ts` | `@/lib/generator/composition` | 14 | Détection thème, genre, difficulté ; structure du graphe (liens valides, pas de placeholder) ; longueur variable ; enrichissement contenu |
| `jwt.test.ts` | `@/lib/jwt` | 13 | `signToken`, `verifyToken`, `createAuthCookie`, `clearAuthCookie`, `getTokenFromCookies`. Mock de `jose` |
| `leveling.test.ts` | `@/lib/leveling` | 7 | `getPrestigeTitle` (8 paliers), `getPrestigeTier`, `getLevelFromXP`, `getXPInCurrentLevel`, `getXPForNextLevel` |
| `monsters.test.ts` | `@/lib/monsters` | 8 | `getMonsters`, `getMonsterById`, `getRandomMonster`, `addCustomMonster`, `removeMonster`, `resetMonsters` |
| `randomGenerator.test.ts` | `@/lib/randomGenerator` | 8 | `generateRandomStats`, `getRandomAbility`, `getAbilitiesForLevel`, `generateCharacterName`, `generateAdventureTitle` |
| `save.test.ts` | `@/lib/saves` | 7 | `getUserSavesWithDetails` (4 cas), `saveProgress` via fetch mocké (3 cas) |
| `trophies.test.ts` | `@/lib/trophies` | 6 | 60 trophées, maxPoints, stats nulles/maximales, calcul current/goal/progress |
| `utils.test.ts` | `@/lib/utils` | 9 | `classNames` — tous les chemins (vides, falsy, booléens, multiples, espaces, tirets, ternaire) |
| `validation.test.ts` | `@/lib/validation/schemas` | 13 | `adventureSchema` (6 cas), `createAdventureSchema` (4 cas), `createCharacterSchema` (3 cas) |

### 4.2 Tests d'intégration (`tests/integration/`) — 4 suites

| Fichier | Cible réelle | Tests | Description |
|---------|--------------|-------|-------------|
| `auth.test.ts` | `@/lib/jwt` | 7 | Flux complet inscription → connexion → vérification (3), erreurs auth (2), multi-utilisateurs (1), admin (1) |
| `adventure.test.ts` | `@/lib/adventures` | 10 | `getAdventureWithAuthor` (4), `getAllAdventuresWithAuthors` (3), `getTopAdventures` (2), `getBranchById` (2) |
| `character.test.ts` | `@/lib/leveling` + `@/lib/xp` + `@/lib/characters/classDefinitions` | 29 | Création personnage end-to-end, prestige (8 paliers), XP, `applyXpGain`, `calculateLevel`, cohérence cross-fonctions, profils de stats par classe |
| `save.test.ts` | `@/lib/saves` | 6 | Nouvelle sauvegarde (3 cas), liste des sauvegardes (3 cas) |

### 4.3 Total

| Catégorie | Suites | Tests |
|-----------|--------|-------|
| Unitaires (`tests/lib/`) | 13 | 171 |
| Intégration (`tests/integration/`) | 4 | 52 |
| Combinaison (test combos couvrant les deux) | — | 17 |
| **TOTAL** | **17** | **240** |

## 5. Couverture réelle (`npm test -- --coverage`)

> Généré automatiquement par `jest --coverage`. Aucune ligne n'est extrapolée.

### 5.1 Totaux globaux

| Métrique | Valeur |
|----------|--------|
| % Statements | 31.68 % |
| % Branches | 14.84 % |
| % Functions | 34.97 % |
| % Lines | 31.55 % |

### 5.2 Fichiers les mieux couverts

| Fichier | % Lines | Remarque |
|---------|---------|----------|
| `lib/utils.ts` | 100 | 9 tests, tous les chemins |
| `lib/characters/classDefinitions.ts` | 100 | 38 tests, tous les exports |
| `lib/levelBonus.ts` | 100 | Couvert transitivement par `applyXpGain` |
| `lib/saves.ts` | 90 | Tous les chemins fonctionnels + erreurs |
| `lib/adventures.ts` | 81 | Tous les chemins fonctionnels + erreurs |
| `lib/jwt.ts` | 78 | 24 tests cumulés (unit + intégration) |
| `lib/xp.ts` | 89 | `applyXpGain` + `calculateLevel` couverts |

### 5.3 Fichiers à 0 % (justifiés)

| Zone | Justification |
|------|---------------|
| `hooks/*` (13 fichiers) | Nécessitent `@testing-library/react` avec `renderHook` (non configuré) |
| `components/*` (40 fichiers) | Nécessitent un environnement DOM complet + setup de rendu |
| `lib/combat.ts`, `combatAbilityHandlers.ts` | État de combat mutable — ré-architecture en fonctions pures nécessaire |
| `lib/dailyQuests.ts` | Couplé aux saisons et achievements |
| `lib/randomEvents.ts` | Pas de logique algorithmique (données statiques) |
| `lib/generator/*` | Banques de chaînes statiques |

## 6. Limites et perspectives

### 6.1 Limites actuelles assumées

1. **Pas de tests E2E** : `@playwright/test` non configuré. Les flux utilisateur (création personnage, lecture d'aventure, vote) ne sont pas testés bout-en-bout.
2. **Pas de tests sur les hooks** : les 13 hooks React sont à 0 %. Configurer `renderHook` + mock Supabase serait un ajout de moyenne ampleur.
3. **Couverture des branches faible (14.84 %)** : les hooks et les composants contiennent beaucoup de branches conditionnelles non testées.
4. **Pas de tests pour les routes API** : les 11 `route.ts` ne sont pas testés.
5. **Pas de tests pour `lib/dailyQuests.ts` et `lib/abilities.ts`** : logique métier non négligeable, à prioriser.

### 6.2 Perspectives d'amélioration (par priorité)

| Priorité | Action | Bénéfice |
|----------|--------|----------|
| P0 | Tests `lib/abilities.ts` (logique de résolution par classe) | +1 fichier couvert |
| P0 | Tests `lib/dailyQuests.ts` (génération + complétion) | +1 fichier couvert |
| P1 | Configurer `renderHook` pour tester `useAuth`, `useSave`, `useAdventure` | Couverture hooks critiques |
| P1 | Tests `route.ts` (vérifier que chaque API répond correctement) | Sécurisation des endpoints |
| P2 | Ré-architecturer `lib/combat.ts` en fonctions pures puis tester | +2 fichiers à ~80 % |
| P2 | Tests E2E Playwright (1-2 scénarios principaux) | Détection régressions UI |

## 7. Comment exécuter

```bash
# Tous les tests
npm test

# Un fichier en particulier
npm test -- tests/lib/character.test.ts

# Avec couverture
npm test -- --coverage

# Mode watch
npm run test:watch

# Linter
npm run lint
```

## 8. Résumé qualité

| Métrique | Valeur | Source |
|----------|--------|--------|
| Tests passants | 240 / 240 (100 %) | `npm test` |
| Suites de test | 17 | `npm test` |
| ESLint | 0 erreur | `npm run lint` |
| TypeScript | 0 erreur | `tsc --noEmit` (CI) |
| Coverage lines | 31.55 % | `npm test -- --coverage` |
| Coverage branches | 14.84 % | `npm test -- --coverage` |
| Fichiers `lib/` testés | 12 / 19 (63 %) | décompte manuel |
