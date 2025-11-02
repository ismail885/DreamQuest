-- Table: utilisateur
CREATE TABLE utilisateur (
    id_utilisateur SERIAL PRIMARY KEY,
    nom_utilisateur VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    mot_de_passe VARCHAR(255) NOT NULL,
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    role VARCHAR(20) DEFAULT 'joueur'
);

-- Table: personnage
CREATE TABLE personnage (
    id_personnage SERIAL PRIMARY KEY,
    nom_personnage VARCHAR(50) NOT NULL,
    classe VARCHAR(50) NOT NULL,
    niveau INT DEFAULT 1,
    points_vie INT DEFAULT 100,
    id_utilisateur INT,
    FOREIGN KEY (id_utilisateur) REFERENCES utilisateur(id_utilisateur)
);

-- Table: aventure
CREATE TABLE aventure (
    id_aventure SERIAL PRIMARY KEY,
    titre VARCHAR(100) NOT NULL,
    description TEXT,
    auteur_id INT,
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    popularite INT DEFAULT 0,
    FOREIGN KEY (auteur_id) REFERENCES utilisateur(id_utilisateur)
);

-- Table: embranchement
CREATE TABLE embranchement (
    id_embranchement SERIAL PRIMARY KEY,
    texte TEXT NOT NULL,
    choix1 TEXT NOT NULL,
    choix1_lien INT,
    choix2 TEXT NOT NULL,
    choix2_lien INT,
    id_aventure INT,
    FOREIGN KEY (choix1_lien) REFERENCES embranchement(id_embranchement),
    FOREIGN KEY (choix2_lien) REFERENCES embranchement(id_embranchement),
    FOREIGN KEY (id_aventure) REFERENCES aventure(id_aventure)
);

-- Table: sauvegarde
CREATE TABLE sauvegarde (
    id_sauvegarde SERIAL PRIMARY KEY,
    id_utilisateur INT,
    id_aventure INT,
    id_personnage INT,
    date_sauvegarde TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_utilisateur) REFERENCES utilisateur(id_utilisateur),
    FOREIGN KEY (id_aventure) REFERENCES aventure(id_aventure),
    FOREIGN KEY (id_personnage) REFERENCES personnage(id_personnage)
);

-- Table: vote
CREATE TABLE vote (
    id_vote SERIAL PRIMARY KEY,
    id_utilisateur INT,
    id_aventure INT,
    date_vote TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_utilisateur) REFERENCES utilisateur(id_utilisateur),
    FOREIGN KEY (id_aventure) REFERENCES aventure(id_aventure),
    UNIQUE(id_utilisateur, id_aventure)
);