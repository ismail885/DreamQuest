# Expression du besoin – DreamQuest

## 1. Contexte

DreamQuest est une application web de RPG textuel permettant aux utilisateurs de créer, personnaliser et vivre des aventures interactives à embranchements. Les joueurs peuvent incarner des personnages avec des classes et attributs spécifiques, influençant le déroulement de l'histoire via un système de combat tour par tour, des jets de compétences et des conséquences statiques. L'application vise à offrir une expérience immersive et personnalisée, tout en favorisant la créativité des utilisateurs à travers la création et le partage de leurs propres récits.

## 2. Utilisateurs cibles

- Joueurs passionnés de RPG narratifs.
- Créateurs souhaitant concevoir et publier des récits interactifs.

## 3. Objectifs du projet

- Création de personnages avec 10 classes et attributs.
- Générateur d'aventures interactives à embranchements (8 genres).
- Système de combat tour par tour avec capacités spéciales.
- Progression (XP, niveaux, level-up) et sauvegarde automatique.
- Classement communautaire par votes.
- Panel d'administration pour la modération.
- Éditeur visuel d'aventures (mode créateur).

## 4. Enjeux fonctionnels et techniques

- Moteur narratif dynamique et évolutif (8 banques de contenu).
- Interface immersive, responsive et intuitive.
- Sécurité des comptes utilisateurs (authentification JWT + HttpOnly cookies).
- Base de données PostgreSQL via Supabase (BaaS).
- Architecture Next.js 15 App Router avec rendu hybride (SSG/SSR).

## 5. Fonctionnalités principales (MVP)

### Authentification et comptes
- Inscription / connexion (email + mot de passe).
- Connexion OAuth (Google, Discord).
- Gestion de session JWT (HttpOnly cookies).
- Réinitialisation de mot de passe.
- Profil utilisateur public (`/profil/[username]`) avec onglets (histoires, personnages, succès, quêtes, créations, évolution).
- Événements saisonniers.

### Personnages
- Création de personnage avec 10 classes uniques (Guerrier, Mage, Archer, Assassin, Paladin, Prêtre, Druide, Nécromancien, Voleur, Barbare).
- Statistiques (Force, Agilité, Magie, Endurance).
- Capacités spéciales par classe (combat + pool).
- XP, niveaux et level-up avec bonus de stats.
- Suivi de progression (PV, stats évolutives).

### Aventures et récits
- Lecture interactive avec choix à embranchements.
- Générateur procédural d'histoires (8 genres : fantasy, horreur, science-fiction, romance, western, pirate, cyberpunk, mythologique).
- Moteur narratif avec phases (introduction, développement, climax) et contextes (lieux, PNJ, artefacts, monstres, twists).
- Éditeur visuel d'aventures (création de nœuds, choix, prévisualisation, sauvegarde en BDD).
- Génération assistée.

### Système de combat
- Combat tour par tour (joueur vs ennemi).
- Capacités spéciales (attaque, défense, soin, buff, poison, étourdissement, etc.).
- Statuts altérés (poison, stun, bleed, burn, buff_agility).
- Esquive, dégâts critiques, bouclier, mana, cooldowns.
- Conséquences des choix peuvent déclencher un combat.

### Progression et sauvegarde
- Sauvegarde automatique toutes les 60 secondes.
- Reprise de partie (dernier nœud visité).
- XP et level-up après chaque aventure.
- Quêtes quotidiennes.
- Succès / badges (15+ achievements).

### Communauté
- Votes (1 vote par utilisateur par aventure).
- Classement des aventures par popularité.
- Filtres par genre et recherche par titre.
- Pagination.

### Administration
- Gestion des utilisateurs (rôles, bannissement).
- Gestion des personnages.
- Gestion des aventures (suppression).
- Logs système avec filtres et statistiques.

### Parties et pages statiques
- Page d'accueil, cookies, privacy, termes, licences.
- Dashboard avec statistiques et suggestions.
- Thème clair/sombre (cookie persistant).

## 6. Tests

- Tests unitaires (combat, JWT, utils, personnage, sauvegarde, types).
- Tests d'intégration (auth, aventure, personnage, sauvegarde).

## 7. Fonctionnalités futures (non réalisées)

- Traduction multilingue complète.
- Mode multijoueur / coopératif.

## 8. Contraintes

- Temps limité (alternance).
- Déploiement gratuit (Vercel).
- Base de données unique Supabase (PostgreSQL).
