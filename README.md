# DreamQuest

**RPG textuel interactif** — Créez votre personnage, explorez des mondes fantastiques et prenez des décisions qui façonnent votre destin.

![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL%20%2B%20Auth-green?logo=supabase)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v3-06B6D4?logo=tailwindcss)
![Vercel](https://img.shields.io/badge/Vercel-Deployed-black?logo=vercel)
![Tests](https://img.shields.io/badge/Tests-240%20passing-238636)
![Licence](https://img.shields.io/badge/Licence-Éducatif-orange)

**Site en ligne** : [https://dream-quest-theta.vercel.app](https://dream-quest-theta.vercel.app)

---

## Sommaire

- [Aperçu](#aperçu)
- [Fonctionnalités](#fonctionnalités)
- [Stack technique](#stack-technique)
- [Installation](#installation)
- [Structure du projet](#structure-du-projet)
- [Base de données](#base-de-données)
- [API](#api)
- [Tests](#tests)
- [Sécurité](#sécurité)
- [Déploiement](#déploiement)
- [Auteurs](#auteurs)
- [Licence](#licence)

---

## Aperçu

DreamQuest est une application web de **RPG textuel narratif** où chaque choix compte. Le jeu propose :

- **10 classes uniques** : Guerrier, Mage, Archer, Assassin, Paladin, Prêtre, Druide, Nécromancien, Voleur, Barbare
- **9 genres heroic-fantasy** : Fantasy, Dark Fantasy, Mythologique, Flibuste, Intrigue de Cour, Marches Sauvages, Conte Féerique, Épopée Guerrière, Arcane & Reliques
- **Génération procédurale** d'aventures (sans IA) combinant thème × genre × difficulté
- **Combats au tour par tour** avec capacités spéciales, esquive, coups critiques et poison
- **Progression sur 4 couches** : niveaux, saisons mensuelles, trophées et succès

---

## Fonctionnalités

### Authentification
| Fonctionnalité | Détail |
|---|---|
| Email / mot de passe | Supabase Auth avec session serveur signée (cookie HttpOnly) |
| OAuth Google & Discord | Connexion en un clic |
| Protection des routes | Middleware Next.js avec vérification JWT |

### Jeu
| Fonctionnalité | Détail |
|---|---|
| Création de personnage | 10 classes, stats personnalisées (force, agilité, magie, endurance) |
| Aventures interactives | Parcours à choix multiples (10–20 nœuds, fins multiples) |
| Combats tour par tour | Attaque, défense, fuite, capacités spéciales avec cooldowns |
| Événements aléatoires | Rencontres, pièges, trésors, embuscades |
| Sauvegarde automatique | Toutes les 60s (nœud + progression) |

### Progression
| Système | Description |
|---|---|
| Niveaux | 100 niveaux, XP gagnée via quêtes et aventures |
| Saisons | 12 saisons cycliques (1 mois), bonus/malus XP ou dégâts |
| Trophées | 5 paliers par saison (bronze → légendaire), 5000 pts max |
| Succès | 10+ succès permanents (première aventure, vétéran...) |
| Quêtes quotidiennes | 10 types de quêtes avec récompenses XP |
| Prestige | 7 paliers (Apprenti → Légende Vivante) |

### Communauté
| Fonctionnalité | Détail |
|---|---|
| Système de votes | Un vote par utilisateur par aventure |
| Classement | Popularité des aventures et des joueurs |
| Création d'aventures | Les utilisateurs peuvent créer et partager leurs propres histoires |

### Administration
- Dashboard avec statistiques globales
- Gestion des utilisateurs, personnages et aventures
- Journal d'activité détaillé
- Modification des rôles

### Internationalisation
- Français & Anglais — 462 clés de traduction chacune
- Sélecteur de langue dans les paramètres du profil
- Persistance en localStorage

---

## Stack technique

| Technologie | Usage |
|---|---|
| **[Next.js 15](https://nextjs.org/)** (App Router) | Framework React full-stack |
| **[TypeScript](https://www.typescriptlang.org/)** | Typage statique strict |
| **[Supabase](https://supabase.com/)** | Base de données PostgreSQL + Auth |
| **[TailwindCSS](https://tailwindcss.com/)** | Styles utilitaires |
| **[Framer Motion](https://www.framer.com/motion/)** | Animations |
| **[jose](https://github.com/panva/jose)** | Signature JWT (cookie session) |
| **[Zod](https://zod.dev/)** | Validation de formulaires et d'entrées |
| **[Lucide React](https://lucide.dev/)** | Icônes |
| **[Jest](https://jestjs.io/)** | Tests unitaires et d'intégration |
| **[Vercel](https://vercel.com/)** | Hébergement et déploiement continu |

---

## Installation

### Prérequis

- **Node.js** 18 ou supérieur
- **npm** ou **yarn**
- Un compte [Supabase](https://supabase.com) (gratuit)

### Étapes

```bash
# 1. Cloner le dépôt
git clone https://github.com/ismail885/DreamQuest.git
cd DreamQuest

# 2. Installer les dépendances
npm install

# 3. Configurer les variables d'environnement
# Créer un fichier .env.local à la racine :
NEXT_PUBLIC_SUPABASE_URL=votre_url_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_cle_anon
SUPABASE_SERVICE_ROLE_KEY=votre_cle_service
JWT_SECRET=votre_secret_jwt_32_caracteres_min

# 4. Initialiser la base de données
# Aller dans Supabase > SQL Editor
# Copier le contenu de documents/bdd/MPD_DreamQuest.sql
# Exécuter le script

# 5. Lancer le serveur de développement
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000)

---

## Structure du projet

```
DreamQuest/
├── app/                          # Pages (App Router)
│   ├── page.tsx                  # Accueil
│   ├── layout.tsx                # Layout racine (AuthProvider + LanguageProvider)
│   │
│   ├── auth/                     # Authentification
│   │   ├── login/                # Connexion (email + OAuth)
│   │   ├── register/             # Inscription
│   │   ├── callback/             # Callback OAuth
│   │   └── forgot-password/      # Mot de passe oublié
│   │
│   ├── dashboard/                # Tableau de bord utilisateur
│   ├── adventure/                # Liste des aventures
│   ├── adventure/[id]/           # Lecture d'aventure
│   ├── create-adventure/         # Création d'aventure (éditeur)
│   ├── create-character/         # Création de personnage
│   ├── profil/                   # Profil utilisateur (privé)
│   ├── profil/[username]/        # Profil public
│   ├── classement/               # Classement
│   ├── admin/                    # Administration
│   │   ├── page.tsx              # Dashboard admin
│   │   ├── users/                # Gestion utilisateurs
│   │   ├── characters/           # Gestion personnages
│   │   ├── adventures/           # Gestion aventures
│   │   └── logs/                 # Journal d'activité
│   │
│   ├── cookies/                  # Politique des cookies (RGPD)
│   ├── privacy/                  # Politique de confidentialité
│   ├── terms/                    # Conditions d'utilisation
│   └── licenses/                 # Licences tierces
│
├── components/                   # Composants React
│   ├── shared/                   # Header, Footer, Loader, Skeleton, PageBackground...
│   ├── auth/                     # LoginForm, RegisterForm
│   ├── character/                # CharacterCard, ClassCard, CreateCharacterForm...
│   ├── adventure/                # StorySection, ChoiceButton, CombatUI, EffectIndicator...
│   ├── profile/                  # ProfileSidebar, SettingsModal, EditProfileModal, Tabs...
│   ├── dashboard/                # DashboardStats, DashboardSuggestions
│   ├── classement/               # ClassementTabs, RankingRow
│   ├── editor/                   # AdventureEditor
│   └── admin/                    # Tables, modals, logs, stats...
│
├── context/                      # Contextes React
│   ├── AuthContext.tsx            # Authentification
│   └── LanguageContext.tsx        # Internationalisation
│
├── hooks/                        # Hooks personnalisés
│   ├── useAuth.ts                # Authentification
│   ├── useAdventure.ts           # Navigation embranchée
│   ├── useCharacter.ts           # Gestion personnages
│   ├── useCombat.ts              # Moteur de combat (480 lignes)
│   ├── useSave.ts                # Auto-save (60s)
│   ├── useVote.ts                # Système de vote
│   ├── useProfileData.ts         # Données profil
│   ├── useDashboardData.ts       # Statistiques dashboard
│   ├── useAdventureList.ts       # Liste paginée
│   ├── useClassementData.ts      # Classement
│   ├── useCachedQuery.ts         # Cache client Supabase
│   ├── useConsequences.ts        # Conséquences des choix
│   ├── useNetworkStatus.ts       # Détection online/offline
│   ├── useToast.tsx              # Notifications toast
│   └── admin/                    # Hooks administration
│
├── lib/                          # Logique métier et utilitaires
│   ├── auth/
│   │   ├── supabaseClient.ts     # Client Supabase (timeout 15s, lazy)
│   │   └── jwt.ts                # JWT (sign, verify, cookies)
│   │
│   ├── game/
│   │   ├── combat.ts             # Système de combat (attaques, défense, capacités)
│   │   ├── combatAbilityHandlers.ts # Gestionnaires de capacités spéciales
│   │   ├── leveling.ts           # Niveaux, XP, prestige
│   │   ├── seasons.ts            # 12 saisons mensuelles (bonus/malus)
│   │   ├── trophies.ts           # Trophées saisonniers (5 paliers)
│   │   ├── achievements.ts       # Succès permanents
│   │   └── dailyQuests.ts        # Quêtes quotidiennes
│   │
│   ├── generator/                # Moteur de génération procédurale
│   │   └── composition/
│   │       ├── composer.ts       # Assemblage thème × genre × difficulté
│   │       ├── themes.ts         # 10 thèmes (décors, lieux, mots-clés)
│   │       ├── genres.ts         # 9 genres (ambiances, antagonistes)
│   │       └── types.ts          # Types du moteur
│   │
│   ├── data/
│   │   ├── characters/           # Définitions des 10 classes
│   │   ├── monsters.ts           # Base de monstres
│   │   └── enemies.ts            # Définition des ennemis
│   │
│   ├── i18n/                     # Traductions
│   │   ├── index.ts              # Fonction t(key, lang)
│   │   ├── types.ts              # Types Lang, Translations
│   │   ├── fr.ts                 # Français (462 clés)
│   │   └── en.ts                 # English (462 clés)
│   │
│   ├── validation/
│   │   └── schemas.ts            # Schémas Zod (formulaires, entrées)
│   │
│   └── utils.ts                  # Fonctions utilitaires (classNames...)
│
├── types/                        # Définitions TypeScript
│   ├── user.ts                   # User, UserProfile, UserRole
│   ├── character.ts              # Character, CharacterClass
│   ├── adventure.ts              # Adventure, Branch, ConsequenceEffect
│   └── save.ts                   # Save, UserSave
│
├── data/                         # Données statiques
│   ├── adventureImages.ts        # Images par genre
│   └── enemies.ts                # Ennemis
│
├── tests/                        # Tests
│   ├── lib/                      # Tests unitaires (13 suites, 171 tests)
│   └── integration/              # Tests d'intégration (4 suites, 52 tests)
│
├── documents/                    # Documentation
│   ├── bdd/                      # Schémas (MCD, MLD, MPD, UML)
│   ├── maquette/                 # Maquettes Figma
│   └── plan_de_tests.md          # Plan de tests détaillé
│
├── public/                       # Fichiers statiques
├── styles/
│   └── globals.css               # Styles globaux + Tailwind
│
├── middleware.ts                  # Middleware Next.js (auth, cache)
├── next.config.ts                # Configuration Next.js
├── tailwind.config.ts            # Configuration Tailwind
├── tsconfig.json                 # Configuration TypeScript
├── jest.config.ts                # Configuration Jest
└── package.json
```

---

## Base de données

### Tables

| Table | Rôle | Colonnes clés |
|---|---|---|
| `utilisateur` | Comptes joueurs | id, nom_utilisateur, email, rôle, niveau, XP, saison, auth_id |
| `personnage` | Personnages créés | id, nom, classe, stats (4), niveau, PV, id_utilisateur |
| `aventure` | Histoires interactives | id, titre, description, genre, difficulté, popularité, auteur_id |
| `embranchement` | Nœuds narratifs | id, texte, choix 1/2 + liens + conséquences (JSONB), est_combat |
| `sauvegarde` | Progression joueurs | id, trio (utilisateur, aventure, personnage), embranchement, progression % |
| `vote` | Votes communautaires | id, duo unique (utilisateur, aventure) |
| `quete_quotidienne` | Quêtes journalières | id, utilisateur, quest_id, progression, date |

> Les combats et l'état des parties en cours sont gérés côté client (state machine React).  
> Schémas détaillés dans `documents/bdd/` (MCD, MLD, MPD, UML).

---

## API

| Route | Méthode | Description | Auth |
|---|---|---|---|
| `/api/auth/session` | POST | Créer le cookie de session JWT | Token Supabase |
| `/api/auth/session` | DELETE | Supprimer le cookie de session | Cookie |
| `/api/generator` | GET | Générer stats/abilities d'un personnage | Cookie |
| `/api/generate-story` | POST | Générer une aventure procédurale | Cookie |
| `/api/progress/user` | POST | Mettre à jour XP et niveau | Cookie |
| `/api/saves/*` | — | CRUD sauvegardes | Cookie |
| `/api/vote/*` | — | Gestion des votes | Cookie |
| `/api/admin/*` | — | Requêtes administration | Admin |

---

## Tests

### Couverture

| Catégorie | Suites | Tests |
|---|---|---|
| Tests unitaires (`tests/lib/`) | 13 | 171 |
| Tests d'intégration (`tests/integration/`) | 4 | 52 |
| **Total** | **17** | **240** |

**100% des tests passent.**

### Modules testés

| Fichier | Tests | Couverture |
|---|---|---|
| `lib/combat.ts` (combat, capacités, cooldowns) | 35 | Complet |
| `lib/characters/classDefinitions.ts` (10 classes) | 38 | 100% lines |
| `lib/jwt.ts` (JWT + cookies) | 13 + 7 intégration | 78% lines |
| `lib/leveling.ts` (XP, prestige, paliers) | 7 | Complet |
| `lib/trophies.ts` (60 trophées, 5 paliers) | 6 | Complet |
| `lib/achievements.ts` (succès, paliers) | 5 | Complet |
| `lib/generator/composer.ts` (génération procédurale) | 14 | Complet |
| `lib/validation/schemas.ts` (Zod) | 13 | Complet |
| `lib/saves.ts` (sauvegardes) | 7 + 6 intégration | 90% lines |
| `lib/adventures.ts` (aventures) | 10 intégration | 81% lines |

### Lancement

```bash
npm test                  # Tous les tests
npm test -- --coverage    # Avec rapport de couverture
npm run test:watch        # Mode watch
npm test -- tests/lib/combat.test.ts  # Un fichier spécifique
```

> Plan de tests détaillé : `documents/plan_de_tests.md`

---

## Sécurité

| Mesure | Détail |
|---|---|
| **Cookie session** | HttpOnly, SameSite=Strict, Secure en production |
| **JWT** | HS256 avec jose, expiration configurable |
| **Middleware** | Protection des routes connectées et admin |
| **Content Security Policy** | `default-src 'self'`, `connect-src` limité à Supabase |
| **HSTS** | max-age=63072000, includeSubDomains, preload |
| **X-Frame-Options** | DENY (protection clickjacking) |
| **X-Content-Type-Options** | nosniff |
| **Permissions Policy** | Caméra, micro, géolocalisation désactivés |
| **Validation des entrées** | Schémas Zod sur tous les formulaires |
| **Timeout requêtes** | 15 secondes (AbortController) |
| **Console.log** | Supprimé en production (compiler Next.js) |
| **RGPD** | Pages légales : cookies, confidentialité, CGU, licences |

---

## Scripts

```bash
npm run dev           # Serveur de développement
npm run build         # Build de production
npm run start         # Serveur de production
npm run lint          # ESLint
npm run test          # Tests Jest
npm run test:watch    # Tests en mode watch
npm run test:coverage # Tests avec couverture
```

---

## Déploiement

Le projet est déployé sur **Vercel** :

**URL** : [https://dream-quest-theta.vercel.app](https://dream-quest-theta.vercel.app)

- Déploiement automatique à chaque push sur `main`
- Variables d'environnement configurées dans le dashboard Vercel

### Variables requises

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | URL du projet Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clé anon Supabase (publique) |
| `SUPABASE_SERVICE_ROLE_KEY` | Clé service Supabase (serveur uniquement) |
| `JWT_SECRET` | Secret pour la signature JWT (32+ caractères) |

---

## Auteurs

**Ismail Abou-zaid**
- GitHub : [@ismail885](https://github.com/ismail885)
- Projet en ligne : [https://dream-quest-theta.vercel.app](https://dream-quest-theta.vercel.app)

---

## Licence

Projet développé dans un cadre éducatif (CDA — Concepteur Développeur d'Applications).
