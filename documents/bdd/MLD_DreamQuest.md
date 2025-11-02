## Modèle Logique de Données (MLD) pour DreamQuest

Table utilisateur

- id_utilisateur: SERIAL PRIMARY KEY
- nom_utilisateur: VARCHAR(50) NOT NULL
- email: VARCHAR(100) NOT NULL UNIQUE
- mot_de_passe: VARCHAR(255) NOT NULL
- date_creation: TIMESTAMP DEFAULT CURRENT_TIMESTAMP
- role: VARCHAR(20), DEFAULT 'joueur'
Relation: Un utilisateur peut créer plusieurs personnages et plusieurs quêtes.

Table personnage

- id_personnage: SERIAL PRIMARY KEY
- nom_personnage: VARCHAR(50) NOT NULL
- classe: VARCHAR(50) NOT NULL
- niveau: INT DEFAULT 1
- points_vie: INT DEFAULT 100
- id_utilisateur: INT  FOREIGN KEY REFERENCES utilisateur(id_utilisateur)
Relation: un personnage possède plusierus personnages.

Table aventure

- id_aventure: SERIAL PRIMARY KEY
- titre: VARCHAR(100) NOT NULL
- description: TEXT
- auteur_id: INT FOREIGN KEY REFERENCES utilisateur(id_utilisateur)
- date_creation: TIMESTAMP DEFAULT CURRENT_TIMESTAMP
- popularite: INT DEFAULT 0
Relation: un utilisateur (auteur) peut créer plusieurs aventures.

Table embranchement

- id_embranchement: SERIAL PRIMARY KEY
- texte: TEXT NOT NULL
- choix1: TEXT NOT NULL
- choix1_lien: INT FOREIGN KEY REFERENCES embranchement(id_embranchement)
- choix2: TEXT NOT NULL
- choix2_lien: INT FOREIGN KEY REFERENCES embranchement(id_embranchement)
- id_aventure: INT FOREIGN KEY REFERENCES aventure(id_aventure)
Relation: une aventure contient plusieurs embranchements.

Table sauvegarde

- id_sauvegarde: SERIAL PRIMARY KEY
- id_utilisateur: INT FOREIGN KEY REFERENCES utilisateur(id_utilisateur)
- id_aventure: INT FOREIGN KEY REFERENCES aventure(id_aventure)
- id_personnage: INT FOREIGN KEY REFERENCES enbranchement(id_embranchement)
- date_sauvegarde: TIMESTAMP DEFAULT CURRENT_TIMESTAMP
Relation: un utilisateur peut avoir plusieurs sauvegardes liées à différentes aventures.

Table vote

- id_vote: SERIAL PRIMARY KEY
- id_utilisateur: INT FOREIGN KEY REFERENCES utilisateur(id_utilisateur)
- id_aventure: INT FOREIGN KEY REFERENCES aventure(id_aventure)
- date_vote: TIMESTAMP DEFAULT CURRENT_TIMESTAMP
Contrainte: UNIQUE(id_utilisateur, id_aventure)
Donc un utilisateur ne peut voter qu'une seule fois par aventure.

Relations principales:

- utilisateur (1,N) personnage
- utilisateur (1,N) aventure
- aventure (1,N) embranchement
- utilisateur (1,N) sauvegarde
- utilisateur (N,N) aventure via vote
