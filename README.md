# DreamQuest 


Application web de jeu de rôle textuel permettant de créer des personnages uniques et vivre des aventures à embranchements multiples.

##  Démarrage rapide

### Prérequis
- Node.js 18+
- Un compte [Supabase](https://supabase.com)

### Installation

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

# Importer le schéma SQL depuis documents/bdd/MPD_DreamQuest.sql dans Supabase

# Lancer le serveur
npm run dev
```

Ouvrez [http://localhost:3000](http://localhost:3000)

##  Technologies

- **Next.js 15** - Framework React
- **TypeScript** - Typage statique
- **Supabase** - Base de données PostgreSQL
- **TailwindCSS** - Styling
- **JWT** - Authentification

##  Fonctionnalités

- Création de personnages avec 10 classes différentes
- Aventures interactives à choix multiples
- Système de sauvegarde automatique
- Interface responsive moderne
- Classement des aventures

##  Structure

```
DreamQuest/
├── app/              # Pages Next.js
├── components/       # Composants React
├── context/          # Context API
├── hooks/            # Custom hooks
├── lib/              # Utilitaires
├── types/            # Types TypeScript
└── documents/        # Documentation
```
##  Scripts

```bash
npm run dev      # Développement
npm run build    # Build production
npm run lint     # Vérifier le code
```

##  Auteur

**Ismail Abou-zaid**
- GitHub: [@ismail885](https://github.com/ismail885)

## Licence

Projet développé dans un cadre éducatif.

