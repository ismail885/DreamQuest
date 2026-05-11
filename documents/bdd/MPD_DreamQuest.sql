-- ================================================================
-- MPD — Modele Physique de Donnees DreamQuest
-- ================================================================

-- TABLE 1 : utilisateur
CREATE TABLE utilisateur (
    id SERIAL PRIMARY KEY,
    nom_utilisateur VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    mot_de_passe VARCHAR(255),
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    role VARCHAR(20) DEFAULT 'joueur',
    auth_id UUID
);

-- TABLE 2 : personnage
CREATE TABLE personnage (
    id SERIAL PRIMARY KEY,
    nom_personnage VARCHAR(50) NOT NULL,
    classe VARCHAR(50) NOT NULL,
    niveau INT DEFAULT 1,
    points_vie INT DEFAULT 100,
    force_personnage INT DEFAULT 5,
    agility_personnage INT DEFAULT 5,
    magie_personnage INT DEFAULT 5,
    endurance_personnage INT DEFAULT 5,
    experience INT DEFAULT 0,
    id_utilisateur INT NOT NULL REFERENCES utilisateur(id) ON DELETE CASCADE
);

-- TABLE 3 : aventure
CREATE TABLE aventure (
    id SERIAL PRIMARY KEY,
    titre VARCHAR(100) NOT NULL,
    description TEXT,
    auteur_id INT REFERENCES utilisateur(id) ON DELETE SET NULL,
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    popularite INT DEFAULT 0,
    embranchement_initial_id INT,
    consequences JSONB DEFAULT '[]'::jsonb,
    difficulty VARCHAR(20) DEFAULT 'normal',
    genre VARCHAR(50),
    duree_estimee INT
);
ALTER TABLE aventure ADD CONSTRAINT fk_embranchement_initial
    FOREIGN KEY (embranchement_initial_id) REFERENCES embranchement(id) ON DELETE SET NULL;

-- TABLE 4 : embranchement
CREATE TABLE embranchement (
    id SERIAL PRIMARY KEY,
    texte TEXT NOT NULL,
    choix1 TEXT,
    choix1_lien INT REFERENCES embranchement(id) ON DELETE SET NULL,
    choix1_consequences JSONB DEFAULT '{}'::jsonb,
    choix2 TEXT,
    choix2_lien INT REFERENCES embranchement(id) ON DELETE SET NULL,
    choix2_consequences JSONB DEFAULT '{}'::jsonb,
    id_aventure INT NOT NULL REFERENCES aventure(id) ON DELETE CASCADE,
    est_combat BOOLEAN DEFAULT FALSE,
    image_url TEXT
);

-- TABLE 5 : sauvegarde
CREATE TABLE sauvegarde (
    id SERIAL PRIMARY KEY,
    id_utilisateur INT NOT NULL REFERENCES utilisateur(id) ON DELETE CASCADE,
    id_aventure INT NOT NULL REFERENCES aventure(id) ON DELETE CASCADE,
    id_personnage INT NOT NULL REFERENCES personnage(id) ON DELETE CASCADE,
    id_embranchement_actuel INT REFERENCES embranchement(id) ON DELETE SET NULL,
    progression INT DEFAULT 0,
    date_sauvegarde TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(id_utilisateur, id_aventure, id_personnage)
);

-- TABLE 6 : vote
CREATE TABLE vote (
    id SERIAL PRIMARY KEY,
    id_utilisateur INT NOT NULL REFERENCES utilisateur(id) ON DELETE CASCADE,
    id_aventure INT NOT NULL REFERENCES aventure(id) ON DELETE CASCADE,
    date_vote TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(id_utilisateur, id_aventure)
);

-- TABLE 7 : parametre_utilisateur
CREATE TABLE parametre_utilisateur (
    id SERIAL PRIMARY KEY,
    id_utilisateur INT NOT NULL UNIQUE REFERENCES utilisateur(id) ON DELETE CASCADE,
    notifications BOOLEAN DEFAULT TRUE,
    langue VARCHAR(5) DEFAULT 'fr'
);

-- TABLE 8 : quete_quotidienne
CREATE TABLE quete_quotidienne (
    id SERIAL PRIMARY KEY,
    id_utilisateur INT NOT NULL REFERENCES utilisateur(id) ON DELETE CASCADE,
    quest_id VARCHAR(50) NOT NULL,
    progression INT DEFAULT 0,
    complet BOOLEAN DEFAULT FALSE,
    date_jour DATE NOT NULL DEFAULT CURRENT_DATE,
    UNIQUE(id_utilisateur, quest_id, date_jour)
);

-- TABLE 9 : participation_evenement
CREATE TABLE participation_evenement (
    id SERIAL PRIMARY KEY,
    id_utilisateur INT NOT NULL REFERENCES utilisateur(id) ON DELETE CASCADE,
    evenement_id VARCHAR(50) NOT NULL,
    participe BOOLEAN DEFAULT FALSE,
    UNIQUE(id_utilisateur, evenement_id)
);
