# DreamQuest

Application web de jeu de rôle textuel interactif permettant de créer des personnages uniques et vivre des aventures à embranchements multiples.

![Next.js](https://img.shields.io/badge/Next.js-15-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL%20%2B%20Auth-green)
![Vercel](https://img.shields.io/badge/Vercel-Deployed-brightgreen)
![License](https://img.shields.io/badge/License-Éducatif-orange)

---

**Site en ligne** : [https://dream-quest-theta.vercel.app](https://dream-quest-theta.vercel.app)

---

## Description

DreamQuest est une application web de RPG textuel narratif où les joueurs peuvent :

- **Créer des personnages** avec 10 classes uniques (Guerrier, Mage, Archer, Assassin, Paladin, Prêtre, Druide, Nécromancien, Voleur, Barbare)
- **Vivre des aventures** interactives avec des choix qui influencent l'histoire
- **Affronter des combats** au tour par tour et des événements aléatoires
- **Progresser** : expérience, niveaux, quêtes quotidiennes, succès et saisons
- **Sauvegarder automatiquement** leur progression
- **Voter** pour leurs aventures préférées
- **Classer** les meilleures aventures communautaires

---

## Fonctionnalités

| Feature | Description |
|---------|-------------|
| Inscription/Connexion | Supabase Auth (email/mot de passe) + session serveur signée (cookie HttpOnly) |
| Création de personnages | 10 classes avec stats et compétences uniques |
| Aventures interactives | Parcours à choix multiples (10 à 20 nœuds, plusieurs fins) |
| Combat au tour par tour | Attaque, défense, fuite et compétences (côté client) |
| Événements aléatoires | Rencontres, pièges, trésors et embuscades |
| Sauvegarde automatique | Toutes les 30 secondes (nœud courant + stats) |
| Progression & saisons | Expérience, niveaux, meilleur niveau, prestige, multiplicateurs |
| Quêtes & succès | Objectifs quotidiens récompensés en XP, déblocage de succès |
| Système de votes | Un vote par utilisateur par aventure |
| Classement | Tri par popularité (aventures et joueurs) |
| Génération procédurale | Moteur local : thème × genre (9 genres) × difficulté, sans IA |
| Administration | Dashboard, gestion utilisateurs / aventures / personnages, journal |

---

## Technologies

- **Next.js 15** - Framework React avec App Router
- **TypeScript** - Typage statique
- **Supabase** - Base de données PostgreSQL + authentification (BaaS)
- **TailwindCSS** - Framework CSS utilitaire
- **Framer Motion** - Animations
- **jose** - Signature du jeton de session (cookie HttpOnly)
- **Jest** - Tests unitaires et d'intégration

---

## Prérequis

- Node.js 18+
- npm ou yarn
- Compte [Supabase](https://supabase.com)

---

## Installation

```bash
# Cloner le projet
git clone https://github.com/ismail885/DreamQuest.git
cd DreamQuest

# Installer les dépendances
npm install

# Configurer les variables d'environnement
# Créer un fichier .env.local avec :
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
JWT_SECRET=your_jwt_secret

# Importer le schéma SQL
# Aller dans Supabase > SQL Editor
# Copier le contenu de documents/bdd/MPD_DreamQuest.sql
# Exécuter le script

# Lancer le serveur de développement
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000)

---

## Structure du projet

```
DreamQuest/
├── app/                      # Pages Next.js (App Router)
│   ├── page.tsx             # Page d'accueil
│   ├── layout.tsx           # Layout racine (Providers)
│   ├── auth/                # Authentification
│   │   ├── login/           # Page connexion
│   │   ├── register/        # Page inscription
│   │   └── callback/        # Callback OAuth
│   ├── dashboard/           # Tableau de bord
│   ├── create-character/    # Création personnage
│   ├── create-adventure/    # Création aventure
│   ├── adventure/           # Liste aventures
│   ├── adventure/[id]/      # Lecture aventure
│   ├── classement/          # Classement
│   ├── profil/              # Profil utilisateur
│   ├── profil/[username]/   # Profil public
│   ├── forgot-password/     # Récupération mot de passe
│   ├── cookies/             # Politique cookies (RGPD)
│   ├── privacy/             # Politique de confidentialité
│   ├── terms/               # Conditions d'utilisation
│   ├── licenses/            # Licences tierces
│   └── admin/               # Administration
│       ├── users/           # Gestion utilisateurs
│       ├── characters/      # Gestion personnages
│       ├── adventures/      # Gestion aventures
│       └── logs/            # Journal d'activité
├── components/              # Composants React
│   ├── auth/               # LoginForm, RegisterForm
│   ├── character/          # CharacterCard, ClassCard, CreateCharacterForm
│   │                       # + CharacterList
│   ├── adventure/          # AdventureCard, AdventureHeader, AdventureEndScreen,
│   │                       # CharacterHUD, ChoiceButton, StorySection, CombatUI,
│   │                       # EffectIndicator, RandomEventCard, ClassAbilitiesPanel,
│   │                       # AdventurePagination
│   ├── profile/            # TabStories, TabAchievements, TabCreations, TabQuests,
│   │                       # TabCharacters, TabEvolution, ProfileSidebar,
│   │                       # SettingsModal, EditProfileModal
│   ├── classement/         # ClassementTabs, RankingRow
│   ├── dashboard/          # DashboardStats, DashboardSuggestions
│   ├── editor/             # AdventureEditor
│   ├── admin/              # AdminUsersTable, AdminCharactersTable, AdminLogList,
│   │                       # AdminLogFilters, AdminLogStats, AdminStatCards,
│   │                       # AdminRoleDistribution, UserDetailModal, UserEditModal,
│   │                       # CharacterViewModal, DeleteConfirmModal
│   └── shared/             # Header, Footer, Loader, Skeleton, Breadcrumb,
│                           # ConfirmDeleteModal, ConfirmLeaveModal, EmptyState,
│                           # ErrorState, PageBackground, PageTransition
├── context/                 # Context API
│   └── AuthContext.tsx     # Authentification (provider + hook useAuthContext)
├── hooks/                   # Custom hooks
│   ├── useAuth.ts          # Hook d'authentification
│   ├── useAdventure.ts     # Navigation embranchée avec BDD
│   ├── useSave.ts          # Auto-save toutes les 30s
│   ├── useVote.ts          # Vote avec timeout 10s
│   ├── useCachedQuery.ts   # Requêtes avec cache client
│   ├── useCharacter.ts     # Gestion des personnages (création, level-up)
│   ├── useProfileData.ts   # Chargement données profil utilisateur
│   ├── useDashboardData.ts # Statistiques + suggestions dashboard
│   ├── useAdventureList.ts # Liste aventures avec pagination
│   ├── useClassementData.ts # Classement aventures et joueurs
│   ├── useCombat.ts        # Logique combat tour par tour (state machine)
│   ├── useConsequences.ts  # Application des conséquences de choix
│   ├── useNetworkStatus.ts # Détection online/offline
│   ├── useToast.tsx        # Wrapper react-hot-toast
│   └── admin/              # Hooks d'administration (dashboard, users, characters, logs)
├── lib/                     # Utilitaires
│   ├── supabaseClient.ts   # Client Supabase (timeout 15s)
│   ├── jwt.ts              # Fonctions JWT (jeton de session)
│   ├── leveling.ts         # Niveaux, XP, prestige (compte utilisateur)
│   ├── seasons.ts          # Saisons et multiplicateurs d'XP
│   ├── dailyQuests.ts      # Quêtes quotidiennes
│   ├── achievements.ts     # Système de succès
│   ├── randomEvents.ts     # Événements aléatoires (combats, rencontres, trésors)
│   ├── combat.ts           # Système de combat tour par tour
│   ├── monsters.ts         # Base de monstres
│   ├── characters/         # Définitions des classes
│   └── generator/composition/ # Moteur de génération thème × genre × difficulté
│       ├── composer.ts     # Assemblage (détection de thème, gabarits, combats)
│       ├── themes.ts       # 10 thèmes (décors, lieux, mots-clés)
│       ├── genres.ts       # 9 genres (ambiances, antagonistes, conséquences)
│       └── types.ts        # Types du moteur
├── types/                   # Définitions TypeScript
│   ├── character.ts        # Types personnage
│   ├── adventure.ts        # Types aventure
│   ├── user.ts             # Types utilisateur
│   ├── save.ts             # Types sauvegarde
│   ├── css.d.ts            # Déclarations CSS modules
│   └── index.ts            # Barrel d'exports
├── data/                    # Données statiques
│   ├── adventureImages.ts  # Images par genre d'aventure
│   └── enemies.ts          # Définition des ennemis
├── app/api/                 # API Routes
│   ├── auth/session/       # Gestion session (POST/DELETE)
│   ├── generator/          # Génération stats/abilities
│   └── generate-story/     # Génération procédurale d'aventures (thème × genre × difficulté)
├── tests/                   # Tests
│   ├── lib/                # Tests unitaires
│   └── integration/       # Tests d'intégration
├── documents/               # Documentation
│   ├── bdd/                # Schémas BDD (MCD, MLD, MPD, UML)
│   ├── maquette/           # Maquettes Figma
│   └── plan_de_tests.md   # Plan de tests
└── public/                 # Fichiers statiques
```

---

## Base de données

### Schéma (7 tables)

| Table | Description |
|-------|-------------|
| `utilisateur` | Comptes (rôle, niveau, expérience, saison, lien `auth_id` vers Supabase Auth) |
| `personnage` | Personnages créés (classe, stats, points de vie) |
| `aventure` | Histoires interactives (genre, difficulté, popularité, auteur) |
| `embranchement` | Nœuds narratifs : texte, deux choix, liens et conséquences (JSONB) |
| `sauvegarde` | Progression des joueurs |
| `vote` | Votes communautaires (unique par utilisateur et par aventure) |
| `quete_quotidienne` | Quêtes journalières |

> Les combats et l'état d'une partie en cours sont gérés côté client (pas de table dédiée).

Voir `documents/bdd/MPD_DreamQuest.sql` pour le schéma complet.

---

## Scripts

```bash
npm run dev          # Développement (http://localhost:3000)
npm run build        # Build production
npm run start        # Serveur production
npm run lint         # Vérification code (ESLint)
npm run test         # Exécuter les tests (Jest)
```

---

## Déploiement

### Vercel (En ligne)

**URL** : https://dream-quest-theta.vercel.app

1. Le projet est connecté à Vercel via GitHub
2. Déploiement automatique à chaque push sur main
3. Variables d'environnement configurées :
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `JWT_SECRET`

---

## API Routes

| Route | Méthode | Description |
|-------|---------|-------------|
| `/api/auth/session` | POST/DELETE | Pose/supprime le cookie de session (vérification du jeton Supabase côté serveur) |
| `/api/generator` | GET | Génération stats/abilities d'un personnage |
| `/api/generate-story` | POST | Génération procédurale d'aventures (titre + genre + difficulté) |

---

## Auteurs

**Ismail Abou-zaid**
- GitHub: [@ismail885](https://github.com/ismail885)
- Projet en ligne : https://dream-quest-theta.vercel.app

---

## Licence

Projet développé dans un cadre éducatif (CDA).
