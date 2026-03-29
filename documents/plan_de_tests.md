# Plan de Tests - DreamQuest

## 1. Présentation du projet

**DreamQuest** est une application web de jeu de rôle textuel interactif permettant :
- La création et gestion de personnages avec différentes classes
- La lecture d'aventures interactives à choix multiples
- La sauvegarde automatique de la progression
- Un système de votes et classements communautaires

---

## 2. Organisation des tests

```
tests/
├── lib/                        # Tests unitaires (logique pure)
│   ├── jwt.test.ts            # ✓ Implémenté
│   ├── utils.test.ts          # ✓ Implémenté
│   └── types.test.ts          # ✓ Implémenté
├── integration/                 # Tests d'intégration (flux complets)
│   ├── auth.test.ts           # ✓ Implémenté
│   └── adventure.test.ts      # ✓ Implémenté
├── components/                 # Tests de composants React (à implémenter)
│   ├── auth/
│   ├── character/
│   └── adventure/
└── e2e/                       # Tests end-to-end (Playwright - à implémenter)
```

---

## 3. Fonctionnalités à tester

### 3.1 Authentification (Inscription / Connexion)

| ID | Fonctionnalité | Type test | Statut | Priorité |
|----|----------------|-----------|--------|----------|
| AUTH-01 | Inscription utilisateur avec email/mot de passe | Unititaire | À faire | HAUTE |
| AUTH-02 | Connexion utilisateur | Unititaire | À faire | HAUTE |
| AUTH-03 | Déconnexion utilisateur | Unititaire | À faire | HAUTE |
| AUTH-04 | Génération token JWT | Unititaire | ✓ Fait | HAUTE |
| AUTH-05 | Vérification token JWT | Unititaire | ✓ Fait | HAUTE |
| AUTH-06 | Extraction token depuis cookies | Unititaire | ✓ Fait | HAUTE |
| AUTH-07 | Création cookie auth | Unititaire | ✓ Fait | HAUTE |
| AUTH-08 | Suppression cookie auth | Unititaire | ✓ Fait | HAUTE |
| AUTH-09 | Protection route avec rôle | Intégration | ✓ Fait | HAUTE |
| AUTH-10 | Flux complet inscription → connexion → vérification | Intégration | ✓ Fait | HAUTE |
| AUTH-11 | Gestion erreur token invalide | Intégration | ✓ Fait | MOYENNE |
| AUTH-12 | Session utilisateur persistante | Intégration | ✓ Fait | HAUTE |

### 3.2 Gestion des Personnages

| ID | Fonctionnalité | Type test | Statut | Priorité |
|----|----------------|-----------|--------|----------|
| CHAR-01 | Création personnage avec nom | Unititaire | À faire | HAUTE |
| CHAR-02 | Sélection classe (10 classes) | Unititaire | À faire | HAUTE |
| CHAR-03 | Validation nom personnage (longueur, caractères) | Unititaire | À faire | HAUTE |
| CHAR-04 | Liste des personnages utilisateur | Intégration | À faire | HAUTE |
| CHAR-05 | Suppression personnage | Intégration | À faire | HAUTE |
| CHAR-06 | Affectation points de vie par classe | Unititaire | À faire | MOYENNE |

**Classes disponibles :** Guerrier, Mage, Archer, Assassin, Paladin, Prêtre, Nain, Elfe, Orc, Druide

### 3.3 Système d'Aventures

| ID | Fonctionnalité | Type test | Statut | Priorité |
|----|----------------|-----------|--------|----------|
| ADV-01 | Liste des aventures | Intégration | ✓ Fait | HAUTE |
| ADV-02 | Chargement aventure avec auteur | Intégration | ✓ Fait | HAUTE |
| ADV-03 | Chargement embranchement initial | Intégration | ✓ Fait | HAUTE |
| ADV-04 | Navigation choix 1 | Intégration | ✓ Fait | HAUTE |
| ADV-05 | Navigation choix 2 | Intégration | ✓ Fait | HAUTE |
| ADV-06 | Construction historique des choix | Intégration | ✓ Fait | HAUTE |
| ADV-07 | Détection fin d'aventure | Intégration | ✓ Fait | HAUTE |
| ADV-08 | Redémarrage aventure | Intégration | À faire | HAUTE |
| ADV-09 | Tri par popularité | Intégration | ✓ Fait | MOYENNE |
| ADV-10 | Affichage détails aventure | E2E | À faire | HAUTE |

### 3.4 Système de Sauvegarde

| ID | Fonctionnalité | Type test | Statut | Priorité |
|----|----------------|-----------|--------|----------|
| SAVE-01 | Sauvegarde automatique (intervalle) | Unititaire | À faire | HAUTE |
| SAVE-02 | Sauvegarde manuelle | Unititaire | À faire | HAUTE |
| SAVE-03 | Restauration sauvegarde | Intégration | À faire | HAUTE |
| SAVE-04 | Calcul progression (%) | Intégration | ✓ Fait | MOYENNE |
| SAVE-05 | Upsert sauvegarde (création/mise à jour) | Unititaire | À faire | HAUTE |
| SAVE-06 | Gestion erreur sauvegarde échouée | Unititaire | À faire | MOYENNE |

### 3.5 Système de Votes

| ID | Fonctionnalité | Type test | Statut | Priorité |
|----|----------------|-----------|--------|----------|
| VOTE-01 | Vote pour une aventure | Unititaire | À faire | HAUTE |
| VOTE-02 | Un seul vote par utilisateur/aventure | Unititaire | À faire | HAUTE |
| VOTE-03 | Incrémentation popularité | Unititaire | À faire | HAUTE |
| VOTE-04 | Classement par popularité | Intégration | ✓ Fait | MOYENNE |
| VOTE-05 | Affichage compteur votes | E2E | À faire | MOYENNE |

### 3.6 Profil Utilisateur

| ID | Fonctionnalité | Type test | Statut | Priorité |
|----|----------------|-----------|--------|----------|
| PROFIL-01 | Affichage informations utilisateur | E2E | À faire | HAUTE |
| PROFIL-02 | Modification nom utilisateur | E2E | À faire | MOYENNE |
| PROFIL-03 | Liste des aventures créées | E2E | À faire | MOYENNE |
| PROFIL-04 | Liste des sauvegardes | E2E | À faire | MOYENNE |

### 3.7 Thème (Clair/Sombre)

| ID | Fonctionnalité | Type test | Statut | Priorité |
|----|----------------|-----------|--------|----------|
| THEME-01 | Basculement thème clair/sombre | Unititaire | À faire | BASSE |
| THEME-02 | Persistance thème (localStorage) | Unititaire | À faire | BASSE |
| THEME-03 | Application CSS selon thème | E2E | À faire | BASSE |

### 3.8 Composants UI

| ID | Fonctionnalité | Type test | Statut | Priorité |
|----|----------------|-----------|--------|----------|
| UI-01 | Affichage carte aventure | Composant | À faire | MOYENNE |
| UI-02 | Affichage carte personnage | Composant | À faire | MOYENNE |
| UI-03 | Formulaire création personnage | Composant | À faire | HAUTE |
| UI-04 | Formulaire inscription | Composant | À faire | HAUTE |
| UI-05 | Formulaire connexion | Composant | À faire | HAUTE |
| UI-06 | Modal confirmation suppression | Composant | À faire | MOYENNE |
| UI-07 | Loader pendant chargement | Composant | À faire | BASSE |
| UI-08 | Header avec navigation | Composant | À faire | MOYENNE |

---

## 4. Couverture actuelle vs cible

### 4.1 Tests unitaires

| Catégorie | Existants | À créer | Total cible |
|-----------|-----------|---------|-------------|
| Auth/JWT | 16 | 20 | 36 |
| Utils | 9 | 5 | 14 |
| Types | 11 | 10 | 21 |
| Personnages | 0 | 15 | 15 |
| Sauvegarde | 0 | 15 | 15 |
| Votes | 0 | 10 | 10 |
| Thème | 0 | 5 | 5 |
| **TOTAL** | **36** | **80** | **116** |

### 4.2 Tests d'intégration

| Flux | Existants | À créer | Total cible |
|------|-----------|---------|-------------|
| Auth | 9 | 5 | 14 |
| Aventure | 8 | 10 | 18 |
| Personnage | 0 | 8 | 8 |
| Sauvegarde | 0 | 6 | 6 |
| Votes | 0 | 4 | 4 |
| **TOTAL** | **17** | **33** | **50** |

### 4.3 Tests E2E (Playwright)

| Scénario | À créer |
|----------|---------|
| Inscription → Création personnage → Jouer aventure | 1 |
| Connexion → Reprendre sauvegarde | 1 |
| Vote et visualisation classement | 1 |
| Parcours complet aventure (tous les choix) | 1 |
| **TOTAL** | **4** |

---

## 5. Stratégie de test

### 5.1 Tests unitaires
- **Objectif** : Tester chaque fonction isolément
- **Données** : Mockées ou fixtures locales
- **Exécution** : Automatique à chaque commit

### 5.2 Tests d'intégration
- **Objectif** : Tester les flux complets
- **Données** : Mock Supabase
- **Couverture** : Auth, Aventure, Character, Save, Vote

### 5.3 Tests E2E
- **Objectif** : Valider le parcours utilisateur réel
- **Outil** : Playwright
- **Environnement** : Développement local

---

## 6. Commandes de test

```bash
# Exécuter tous les tests
npm test

# Mode watch (développement)
npm run test:watch

# Couverture de code
npm run test:coverage

# Tests E2E (si Playwright installé)
npx playwright test
```

---

## 7. Priorisation des implémentations

### Phase 1 - Critique (Avant soutenance)
1. Tests authentification (AUTH-01 à AUTH-12) ✅
2. Tests aventure (ADV-01 à ADV-10) ✅
3. Tests composants inscription/connexion
4. Tests E2E parcours principal

### Phase 2 - Important
5. Tests personnages
6. Tests sauvegarde
7. Tests votes

### Phase 3 - Complémentaire
8. Tests thème
9. Tests UI secondaires
10. Couverture maximale

---

## 8. Indicateurs de qualité

| Métrique | Cible |
|----------|-------|
| Couverture de code | > 70% |
| Tests passent | 100% |
| Temps d'exécution | < 30s |
| Lint sans erreur | 100% |

---

## 9. Notes

- Les tests actuels (53) couvrent les fonctionnalités core : JWT, utils, types, auth flux, adventure flux
- Les tests E2E nécessitent Playwright (non encore installé)
- La couverture composants React nécessite configuration Babel supplémentaire
- Les tests peuvent être enrichis avec des cas limites et données aléatoires (faker)

---

*Document généré le 29 mars 2026*
*Projet DreamQuest - CDA*
