# 🧾 Expression du besoin – DreamQuest

## 1. Contexte

DreamQuest est une application web de RPG textuel permettant aux utilisateurs de créer, personnaliser et vivre eux-mêmes des aventures interactives à embranchements. Les joueurs peuvent incarner des personnages avec des classes et attributs spécifiques, influençant le déroulement de l’histoire. L’application vise à offrir une expérience immersive et personnalisée, tout en favorisant la créativité des utilisateurs à travers la création et le partage de leurs propres récits.

## 2. Utilisateurs cibles

- Joueurs passionnés de RPG narratifs.
- Créateurs souhaitant concevoir et publier des récits interactifs.

## 3. Objectifs du projet

- Création de personnages avec classes et attributs.
- Générateur d’aventures interactives à embranchements.
- Sauvegarde et reprise de la progression.
- Classement communautaire par votes.

## 4. Enjeux fonctionnels et techniques

- Moteur narratif dynamique et évolutif.
- Interface immersive, responsive et intuitive.
- Sécurité des comptes utilisateurs (authentification JWT).
- Double gestion de données : PostgreSQL (relationnel) + MongoDB (NoSQL).

## 5. Fonctionnalités principales (MVP)

- Inscription / connexion utilisateur.
- Création de personnage et sélection de classe.
- Lecture interactive avec choix et sauvegarde.
- Classement des histoires (votes/likes).

## 6. Fonctionnalités futures

- Système de messagerie entre joueurs.
- Succès / badges.
- Traduction multilingue.
- Mode “Créateur de quête”.

## 7. Contraintes

- Temps limité (alternance).
- Déploiement gratuit (Vercel).
- Gestion de deux bases de données (Supabase + MongoDB).
