# DreamQuest

> **Vivez Votre Propre Aventure** - Un RPG textuel interactif où chaque choix façonne votre destin



## À propos

**DreamQuest** est une application web de RPG textuel permettant aux utilisateurs de créer, personnaliser et vivre des aventures interactives à embranchements. Incarnez des personnages uniques avec des classes et attributs spécifiques qui influencent le déroulement de votre histoire.

### Caractéristiques principales

- **Création de personnages** - Choisissez votre classe et personnalisez vos attributs
- **Aventures interactives** - Des récits à embranchements où vos choix comptent
- **Système de sauvegarde** - Reprenez votre aventure où vous l'avez laissée
- **Classement communautaire** - Votez pour vos histoires préférées
- **Interface immersive** - Design moderne et responsive avec TailwindCSS

---

## Technologies

### Frontend
- **[Next.js 15](https://nextjs.org/)** - Framework React avec App Router
- **[React 19](https://react.dev/)** - Bibliothèque UI
- **[TypeScript](https://www.typescriptlang.org/)** - Typage statique
- **[TailwindCSS](https://tailwindcss.com/)** - Framework CSS utilitaire
- **[Lucide React](https://lucide.dev/)** - Icônes modernes

### Backend & Base de données
- **[Supabase](https://supabase.com/)** - Base de données PostgreSQL (données relationnelles)
- **[MongoDB](https://www.mongodb.com/)** - Base de données NoSQL (contenu des aventures)
- **[Mongoose](https://mongoosejs.com/)** - ODM pour MongoDB

### Authentification
- **JWT** - Authentification sécurisée par tokens

---

## Prérequis

- **Node.js** (v18 ou supérieur)
- **npm** ou **yarn**
- **MongoDB** (local ou Atlas)
- Un compte **Supabase**

---

## Installation

### 1. Cloner le repository

```bash
git clone https://github.com/ismail885/DreamQuest.git
cd DreamQuest
```

### 2. Installer les dépendances

```bash
npm install
# ou
yarn install
```

### 3. Configuration des variables d'environnement

Créez un fichier `.env.local` à la racine du projet :

```env
# Supabase (PostgreSQL)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# MongoDB
MONGODB_URI=mongodb://localhost:27017/dreamquest
# ou MongoDB Atlas:
# MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/dreamquest

# JWT Secret
JWT_SECRET=your_jwt_secret_key
```

### 4. Configuration de la base de données

#### PostgreSQL (Supabase)

Exécutez le script SQL dans votre projet Supabase :

```bash
# Le fichier se trouve dans documents/bdd/MPD_DreamQuest.sql
```

#### MongoDB

La base MongoDB sera automatiquement créée au premier lancement.

### 5. Lancer le serveur de développement

```bash
npm run dev
```

Ouvrez [http://localhost:3000](http://localhost:3000) dans votre navigateur.

---

## Structure du projet

```
DreamQuest/
├── app/                          # App Router Next.js
│   ├── adventure/[id]/          # Pages d'aventures dynamiques
│   ├── create-character/        # Création de personnage
│   ├── dashboard/               # Tableau de bord utilisateur
│   ├── login/                   # Page de connexion
│   ├── register/                # Page d'inscription
│   ├── layout.tsx               # Layout principal
│   └── page.tsx                 # Page d'accueil
├── components/                   # Composants React
│   ├── adventure/               # Composants d'aventure
│   ├── auth/                    # Formulaires d'authentification
│   ├── character/               # Gestion des personnages
│   ├── game/                    # Composants de jeu
│   └── shared/                  # Composants partagés (Header, Footer)
├── context/                      # React Context
│   ├── AuthContext.tsx          # Gestion de l'authentification
│   └── ThemeContext.tsx         # Gestion du thème
├── hooks/                        # Custom Hooks
│   ├── useAdventure.ts          # Logique d'aventure
│   ├── useAuth.ts               # Logique d'authentification
│   ├── useSave.ts               # Logique de sauvegarde
│   └── useTheme.ts              # Logique de thème
├── lib/                          # Utilitaires et configurations
│   ├── jwt.ts                   # Gestion JWT
│   ├── mongodb.ts               # Connexion MongoDB
│   ├── supabaseClient.ts        # Client Supabase
│   └── utils.ts                 # Fonctions utilitaires
├── types/                        # Types TypeScript
│   ├── adventure.ts             # Types d'aventure
│   ├── character.ts             # Types de personnage
│   ├── save.ts                  # Types de sauvegarde
│   └── user.ts                  # Types d'utilisateur
├── documents/                    # Documentation du projet
│   ├── expression_du_besoin.md  # Cahier des charges
│   ├── zoning.md                # Zoning des pages
│   └── bdd/                     # Schémas de base de données
├── public/                       # Fichiers statiques
└── styles/                       # Styles CSS globaux
```

---

## Fonctionnalités

### MVP (Version actuelle)

- [x] Système d'inscription et de connexion
- [x] Création de personnage avec sélection de classe
- [x] Interface de lecture interactive
- [x] Système de choix et embranchements
- [x] Sauvegarde de progression
- [x] Classement des histoires par popularité

### Fonctionnalités futures

- [ ] Système de messagerie entre joueurs
- [ ] Succès et badges
- [ ] Traduction multilingue
- [ ] Mode "Créateur de quête" complet
- [ ] Inventaire et objets
- [ ] Combats au tour par tour
- [ ] Génération d'aventures par IA

---

## Design

Le design de l'application a été créé avec Figma. Vous pouvez consulter les maquettes dans le dossier `documents/maquette/`.

- Interface moderne avec effets de glow cyan/bleu
- Design responsive (mobile, tablette, desktop)
- Mode sombre natif
- Animations fluides

---

## Architecture de base de données

### PostgreSQL (Supabase) - Données relationnelles

- **utilisateur** - Comptes utilisateurs
- **personnage** - Personnages créés par les joueurs
- **aventure** - Métadonnées des aventures
- **sauvegarde** - Progression des joueurs

### MongoDB - Contenu des aventures

- **embranchements** - Nœuds d'histoire avec choix
- **dialogues** - Conversations dynamiques
- **événements** - Actions spéciales

---

## Déploiement

### Vercel (Recommandé)

1. Connectez votre repository GitHub à Vercel
2. Configurez les variables d'environnement
3. Déployez automatiquement à chaque push

```bash
npm run build
npm run start
```

### Variables d'environnement en production

Assurez-vous de configurer toutes les variables d'environnement dans votre plateforme de déploiement.

---

## Contribution

Les contributions sont les bienvenues ! N'hésitez pas à :

1. Fork le projet
2. Créer une branche (`git checkout -b feature/AmazingFeature`)
3. Commit vos changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

---

## Scripts disponibles

```bash
# Développement
npm run dev          # Lance le serveur de développement

# Production
npm run build        # Compile l'application
npm run start        # Lance l'application en production

# Linting
npm run lint         # Vérifie le code avec ESLint
```

---

## Licence

Ce projet est développé dans un cadre éducatif (alternance).

---

## Auteur

**Ismail Abou-zaid**

- GitHub: [@ismail885](https://github.com/ismail885)
- Repository: [DreamQuest](https://github.com/ismail885/DreamQuest)

---

## Remerciements

- [Next.js](https://nextjs.org/) - Framework React
- [Supabase](https://supabase.com/) - Backend as a Service
- [MongoDB](https://www.mongodb.com/) - Base de données NoSQL
- [TailwindCSS](https://tailwindcss.com/) - Framework CSS
- [Lucide](https://lucide.dev/) - Icônes

---

<div align="center">
  <strong>Développé avec passion par Ismail Abou-zaid</strong>
</div>
