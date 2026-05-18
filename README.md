# DreamQuest

Application web de jeu de rôle textuel interactif permettant de créer des personnages uniques et vivre des aventures à embranchements multiples.

![Next.js](https://img.shields.io/badge/Next.js-15-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Supabase](https://img.shields.io/badge/Supabase-3-green)
![Vercel](https://img.shields.io/badge/Vercel-Deployed-brightgreen)
![License](https://img.shields.io/badge/License-Éducatif-orange)

---

**Site en ligne** : [https://dream-quest-theta.vercel.app](https://dream-quest-theta.vercel.app)

---

## Description

DreamQuest est une application web de RPG textuel narratif où les joueurs peuvent :

- **Créer des personnages** avec 10 classes uniques (Guerrier, Mage, Archer, Assassin, Paladin, Prêtre, Druide, Nécromancien, Voleur, Barbare)
- **Vivre des aventures** interactives avec des choix qui influencent l'histoire
- **Sauvegarder automatiquement** leur progression
- **Voter** pour leurs aventures préférées
- **Classer** les meilleures aventures communautaires

---

## Fonctionnalités

| Feature | Description |
|---------|-------------|
| Inscription/Connexion | Authentification JWT sécurisée |
| Création de personnages | 10 classes avec stats et abilities uniques |
| Aventures interactives | Parcours à choix multiples avec embranchements |
| Sauvegarde automatique | Toutes les 30 secondes (historique + stats) |
| Système de votes | Un vote par utilisateur par aventure |
| Classement | Tri par popularité |
| Génération procédurale | Moteur local 4 genres (fantasy, horreur, sci-fi, romance) |

---

## Technologies

- **Next.js 15** - Framework React avec App Router
- **TypeScript** - Typage statique
- **Supabase** - Base de données PostgreSQL (BaaS)
- **TailwindCSS** - Framework CSS utilitaire
- **Framer Motion** - Animations
- **JWT (jose)** - Authentification par tokens

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
│   ├── login/               # Page connexion
│   ├── register/            # Page inscription
│   ├── dashboard/           # Tableau de bord
│   ├── create-character/    # Création personnage
│   ├── adventure/           # Liste aventures
│   ├── adventure/[id]/     # Lecture aventure
│   └── profil/             # Profil utilisateur
├── components/              # Composants React
│   ├── auth/               # LoginForm, RegisterForm
│   ├── character/          # CharacterCard, ClassCard, CreateCharacterForm
│   ├── adventure/           # AdventureCard
│   └── shared/             # Header, Footer, Loader, ConfirmDeleteModal
├── context/                 # Context API
│   ├── AuthContext.tsx     # Authentification
│   └── ThemeContext.tsx    # Thème clair/sombre
│   ├── hooks/                   # Custom hooks
│   │   ├── useAuth.ts
│   │   ├── useAdventure.ts     # Navigation embranchée avec BDD
│   │   ├── useSave.ts          # Auto-save toutes les 30s
│   │   ├── useVote.ts          # Vote avec timeout 10s + garde loadingRef
│   │   ├── useTheme.ts
│   ├── lib/                     # Utilitaires
│   │   ├── supabaseClient.ts   # Client Supabase (timeout 15s, cache, retry)
│   │   ├── jwt.ts              # Fonctions JWT
│   │   ├── randomGenerator.ts  # Génération aléatoire (stats, abilities, événements)
│   │   ├── generator/           # Moteur de génération procédurale
│   │   │   ├── types.ts        # Types partagés
│   │   │   ├── engine.ts       # Assembleur de séquences narratives
│   │   │   ├── fantasy.ts      # Banque fantasy (~60 entrées)
│   │   │   ├── horror.ts       # Banque horreur (~50 entrées)
│   │   │   ├── scifi.ts        # Banque sci-fi (~55 entrées)
│   │   │   ├── romance.ts      # Banque romance (~50 entrées)
│   │   ├── utils.ts            # Helpers
│   │   ├── combat.ts           # Système de combat tour par tour
│   ├── user.ts
│   ├── character.ts
│   ├── adventure.ts
│   ├── save.ts
│   └── story.ts
├── tests/                   # Tests
│   ├── lib/                # Tests unitaires
│   └── integration/       # Tests d'intégration
├── documents/               # Documentation
│   ├── bdd/                # Schémas BDD (MCD, MLD, MPD)
│   ├── maquette/           # Maquettes Figma
│   └── plan_de_tests.md   # Plan de tests
└── public/                 # Fichiers statiques
```

---

## Base de données

### Schéma (6 tables)

| Table | Description |
|-------|-------------|
| `utilisateur` | Comptes utilisateurs |
| `personnage` | Personnages créés |
| `aventure` | Histoires interactives |
| `embranchement` | Nœuds narratifs avec choix |
| `sauvegarde` | Progression des joueurs |
| `vote` | Votes communautaires |

Voir `documents/bdd/MPD_DreamQuest.sql` pour le schéma complet.

---

## Scripts

```bash
npm run dev          # Développement (http://localhost:3000)
npm run build        # Build production
npm run start        # Serveur production
npm run lint         # Vérification code
npm run test         # Exécuter les tests
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
   - `JWT_SECRET`
---

## API Routes

| Route | Méthode | Description |
|-------|---------|-------------|
| `/api/auth/register` | POST | Inscription utilisateur |
| `/api/auth/login` | POST | Connexion |
| `/api/auth/logout` | POST | Déconnexion |
| `/api/auth/me` | GET | Vérifier session |

---

## Auteurs

**Ismail Abou-zaid**
- GitHub: [@ismail885](https://github.com/ismail885)
- Projet en ligne : https://dream-quest-theta.vercel.app


---

## Licence

Projet développé dans un cadre éducatif (CDA).

---


