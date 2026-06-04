# Plan de Tests - DreamQuest

## 1. Présentation

**DreamQuest** est une application web de jeu de rôle textuel interactif (Next.js 15 + TypeScript + Supabase). Ce document décrit l'état **réel** de la suite de tests, telle qu'exécutée par `npm test` et `npm test -- --coverage`. Aucun chiffre n'est inventé.

## 2. Stratégie de test

Les tests suivent une approche pragmatique adaptée à un projet Next.js + Supabase + Jest, en deux couches :

| Couche | Cible | Stratégie |
|--------|-------|-----------|
| **Unitaires** (`tests/lib/`) | Fonctions pures, constantes, types | Import direct depuis `lib/`, aucun mock sauf si la fonction dépend d'une lib externe (`jose` pour JWT) |
| **Intégration** (`tests/integration/`) | Fonctions touchant Supabase | Mock du client Supabase via `jest.mock('@/lib/supabaseClient', ...)` |

**Principes respectés :**
- **Pas de re-définition locale** : les tests importent et exécutent le code de `lib/`. Aucune fonction de production n'est recopiée dans un fichier de test.
- **Mocks minimaux** : un seul mock partagé pour Supabase (chaîne thenable configurable), un mock pour `jose` (sign/verify déterministes).
- **Pas de dépendance externe** : pas de MSW, pas de nock, pas de @testing-library/user-event. Le test runner est isolé de la vraie base.
- **Couverture des chemins d'erreur** : chaque fonction Supabase est testée sur le chemin nominal **et** sur le chemin d'erreur (lookup, insert, update, rejection).

**Hors périmètre (justifié en §6) :**
- Tests E2E navigateur (Playwright est listé comme dépendance dev mais n'est pas configuré pour des tests automatisés)
- Tests des hooks React (`hooks/use*`) : ils mélangent React + Supabase + état local et nécessiteraient `@testing-library/react` pour des tests significatifs
- `lib/combat.ts`, `lib/combatAbilityHandlers.ts` : logique d'état de combat qui exige soit un DOM complet, soit un harness dédié
- `lib/generator/*` : banques de chaînes statiques par genre, peu de valeur de test unitaire

## 3. Organisation des tests (arbre réel)

```
tests/
├── lib/
│   ├── jwt.test.ts                    # 13 tests - jwt.ts réel, jose mocké
│   ├── utils.test.ts                  # 9 tests - utils.ts réel (classNames)
│   ├── types.test.ts                  # 12 tests - contrats de types depuis /types
│   ├── character.test.ts              # 38 tests - classDefinitions + leveling réels
│   └── save.test.ts                   # 9 tests - saves.ts réel, Supabase mocké
└── integration/
    ├── auth.test.ts                   # 7 tests - jwt.ts réel (sign/verify + cookies)
    ├── adventure.test.ts              # 11 tests - adventures.ts réel, Supabase mocké
    ├── character.test.ts              # 29 tests - leveling + xp réels (intégration)
    └── save.test.ts                   # 7 tests - saves.ts réel, scénarios end-to-end
```

## 4. Tests implémentés

### 4.1 Tests unitaires (`tests/lib/`)

| Fichier | Cible réelle | Tests | Description |
|---------|--------------|-------|-------------|
| `jwt.test.ts` | `@/lib/jwt` | 13 | `signToken`, `verifyToken`, `createAuthCookie`, `clearAuthCookie`, `getTokenFromCookies`. Mock de `jose` car la lib signe vraiment avec `JWT_SECRET`. |
| `utils.test.ts` | `@/lib/utils` | 9 | `classNames(...classes)` - tous les chemins (vides, falsy, booléens, multiples). |
| `types.test.ts` | `@/types/*` | 12 | Contrats de structure des types (`Adventure`, `Branch`, `AdventureWithAuthor`, `Save`, `SaveWithDetails`, `UserSave`, `Character`, `CreateCharacterPayload`, `AdventureListItem`). Pas de logique, juste compilation + présence de champs. |
| `character.test.ts` | `@/lib/characters/classDefinitions` + `@/lib/leveling` | 38 | `CHARACTER_CLASSES`, `validateCharacterName`, `calculateRequiredXP`, `getTotalXPForLevel`, `getClassAbilitiesWithInfo`, `getFormattedStats`, `STAT_LABELS/ICONS/COLORS`, `DIFFICULTY_LABELS`, `CLASS_DIFFICULTIES`, `CLASS_PASSIVES`, `ABILITIES_DATA`, `getPrestigeTitle`, `getXPInCurrentLevel`, `getXPForNextLevel`. |
| `save.test.ts` | `@/lib/saves` | 9 | `getUserSavesWithDetails` (4 cas : erreur, data null, mapping, relations nulles), `saveProgress` (5 cas : insert, update, erreur insert, erreur update, rejection lookup). |

### 4.2 Tests d'intégration (`tests/integration/`)

| Fichier | Cible réelle | Tests | Description |
|---------|--------------|-------|-------------|
| `auth.test.ts` | `@/lib/jwt` | 7 | Scénarios bout-en-bout : inscription → connexion → vérification → cookie → multi-utilisateurs. |
| `adventure.test.ts` | `@/lib/adventures` | 11 | `getAdventureWithAuthor` (4), `getAllAdventuresWithAuthors` (3), `getTopAdventures` (2), `getBranchById` (2). Vérifie l'ordre (`popularite desc`), la limite, le mapping `auteur_nom`. |
| `character.test.ts` | `@/lib/leveling` + `@/lib/xp` + `@/lib/characters/classDefinitions` | 29 | Création de personnage end-to-end, `getPrestigeTitle` (8 paliers), `getXPInCurrentLevel` (4 cas), `applyXpGain` (4 cas), `calculateLevel` (5 cas), cohérence entre les deux implémentations de courbe XP, vérifications cross-classes. |
| `save.test.ts` | `@/lib/saves` | 7 | Scénarios upsert (insert vs update selon lookup), erreurs DB sur insert et update, listing par date desc avec `eq('id_utilisateur', ...)`. |

### 4.3 Total

| Catégorie | Tests |
|-----------|-------|
| Unitaires | 81 |
| Intégration | 54 |
| **TOTAL** | **135** |

## 5. Couverture réelle (`npm test -- --coverage`)

> Généré automatiquement par `jest --coverage`. Aucune ligne n'est extrapolée.

### 5.1 Totaux

| Métrique | Avant | Maintenant |
|----------|-------|------------|
| % Statements | 3.35 % | **12.08 %** |
| % Branches | 0.82 % | **6.68 %** |
| % Functions | 2.86 % | **9.45 %** |
| % Lines | 3.28 % | **11.38 %** |

### 5.2 Par fichier — fichiers les mieux couverts

| Fichier | % Stmts | % Branches | % Funcs | % Lines | Commentaire |
|---------|---------|------------|---------|---------|-------------|
| `lib/utils.ts` | 100 | 100 | 100 | 100 | 9 tests couvrent tous les chemins |
| `lib/characters/classDefinitions.ts` | 100 | 100 | 100 | 100 | 38 tests : tous les exports sont testés |
| `lib/levelBonus.ts` | 100 | 100 | 100 | 100 | Couvert transitivement par `applyXpGain` |
| `lib/saves.ts` | 91.66 | 100 | 100 | 90 | Tous les chemins fonctionnels + erreurs (reste : console.error dans catch) |
| `lib/adventures.ts` | 84.21 | 88.88 | 100 | 81.25 | Tous les chemins fonctionnels + erreurs (reste : console.error dans catch) |
| `lib/xp.ts` | 82.97 | 54.83 | 50 | 89.47 | `applyXpGain` + `calculateLevel` couverts ; `saveCharacterProgress` et `updateUserXp` non testés (voir §6) |
| `lib/jwt.ts` | 77.35 | 46.42 | 100 | 78 | `signToken`, `verifyToken`, cookies, parser — 24 tests |
| `lib/leveling.ts` | 54.09 | 28.33 | 66.66 | 48.07 | Fonctions pures (`getPrestigeTitle`, `getXPInCurrentLevel`, `getXPForNextLevel`) à 100 % ; `addExperience` et `resetForNewSeason` non couverts |
| `lib/seasons.ts` | 30.76 | 0 | 0 | 30.76 | `SEASONS` constants utilisés par les tests leveling mais pas testés directement |
| `lib/supabaseClient.ts` | 25.71 | 27.27 | 0 | 27.27 | Le mock se charge à la place, ce qui couvre le proxy et la fonction lazy |

### 5.3 Par fichier — à 0 % (honnêteté)

Ces fichiers n'ont **aucun test direct** à ce jour. Justifications au §6.

| Fichier | Lignes | Justification |
|---------|--------|---------------|
| `lib/abilities.ts` | 30-186 | Logique d'abilities par classe, non exposée directement. Les noms et types sont testés via `ABILITIES_DATA` dans `character.test.ts`. |
| `lib/achievements.ts` | 26-71 | Système de succès statique, valeur de test unitaire marginale. |
| `lib/combat.ts` | 1-279 | État de combat tour par tour. Nécessite un harness React/DOM ou une ré-architecture. |
| `lib/combatAbilityHandlers.ts` | 31-202 | Handlers d'abilities en combat. Couplés à `lib/combat.ts`. |
| `lib/dailyQuests.ts` | 1-169 | Quêtes quotidiennes. Couplées au système de saisons et achievements. |
| `lib/monsters.ts` | 16-118 | Définitions de monstres statiques. |
| `lib/randomEvents.ts` | 22-560 | Événements aléatoires. Pas de logique algorithmique à tester. |
| `lib/randomGenerator.ts` | 1-137 | Génération aléatoire. Difficile à tester sans mocker `Math.random`. |
| `lib/votes.ts` | 1-39 | Vote unique. La logique de duplicate-key (PostgreSQL `23505`) demande un mock précis. À ajouter en priorité P1. |
| `lib/generator/engine.ts` | 2-178 | Moteur d'assemblage procédural. |
| `lib/generator/fantasy.ts` / `horror.ts` / `romance.ts` / `scifi.ts` | (banques statiques) | Texte statique par genre. |
| `hooks/*` | — | Tous les hooks React sont à 0 %. Tester des hooks nécessite `@testing-library/react` avec `renderHook` (non configuré ici). |

## 6. Limites et perspectives

### 6.1 Limites actuelles assumées

1. **Pas de tests E2E** : le projet a `@playwright/test` dans le backlog mais aucune suite n'est définie. Les flux utilisateur (création de personnage, lecture d'aventure, vote) ne sont pas testés bout-en-bout.
2. **Pas de tests sur les hooks** : `useAuth`, `useSave`, `useAdventure`, `useCombat` etc. sont entièrement non testés. Configurer `renderHook` + un `SupabaseProvider` mocké serait un ajout de moyenne ampleur.
3. **`lib/combat.ts` et `lib/combatAbilityHandlers.ts` non testés** : système tour par tour avec état mutable. Nécessite soit un harness dédié soit une ré-architecture en pur functions.
4. **`lib/votes.ts` non testé** : la gestion de l'erreur duplicate-key (code `23505`) demande un mock précis du client Supabase. À ajouter en P1.
5. **Pas de tests pour les actions admin** (`hooks/admin/*`) : volumineux, couplés à Supabase admin client. À traiter séparément.
6. **Le `useToast.tsx` hook casse la collecte de coverage** : le fichier est `.tsx` mais Jest est configuré sans `babel-preset-react` pour la phase de coverage. C'est un babel-config connu, pas un problème de tests. Les autres `.ts` de `hooks/` collectent à 0 % proprement.

### 6.2 Perspectives d'amélioration (par priorité)

| Priorité | Action | Bénéfice estimé |
|----------|--------|-----------------|
| P0 | Configurer le preset Babel pour supporter JSX | Permettrait la couverture des hooks |
| P0 | Tester `lib/votes.ts` (chemin nominal + duplicate) | +1 fichier couvert |
| P1 | Tests `renderHook` sur `useAuth`, `useSave`, `useAdventure` | Couverture des hooks critiques |
| P1 | Tests `lib/abilities.ts` (la logique de résolution par classe) | +1 fichier couvert |
| P1 | Tests `lib/dailyQuests.ts` (génération + complétion) | +1 fichier couvert |
| P2 | Tests de combat : ré-architecturer en pur functions puis tester | +2 fichiers à ~80 % |
| P2 | Tests E2E Playwright sur les flux principaux (1-2 scénarios) | Détection des régressions UI |
| P3 | Tests `lib/generator/*` (assertion sur la grammaire de génération) | Couverture du moteur procédural |

### 6.3 Anti-patterns éliminés

Avant cette refonte, les fichiers de test **redéfinissaient localement** les fonctions qu'ils étaient censés tester (`calculateProgression`, `calculateInitialHP`, `isEndBranch`, etc.) puis exécutaient leur propre copie. Les tests passaient à 100 % mais ne protégeaient **rien** dans `lib/`.

**État actuel :** tous les tests exécutent le code de `lib/` importé. Aucune fonction de production n'est recopiée dans un fichier de test. C'est vérifiable en cherchant `const calculate` ou `const isValid` dans `tests/` : le résultat est zéro.

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
| Tests passants | 135 / 135 (100 %) | `npm test` |
| ESLint | 0 erreur sur `tests/` | `npm run lint` |
| TypeScript | 0 erreur | compilation `ts-jest` |
| Coverage statements | 12.08 % | `npm test -- --coverage` |
| Coverage lignes | 11.38 % | `npm test -- --coverage` |
| Fichiers de `lib/` testés | 7 / 19 (37 %) | décompte manuel |
| Fonctions Supabase testées | 6 / 12 (50 %) | décompte manuel |
