/* ============================================================ */
/*            Création Base de données : PostgreSQL             */
/* ============================================================ */

ALTER DATABASE MyCocktail;
DROP SCHEMA IF EXISTS MyCocktail CASCADE;
CREATE SCHEMA MyCocktail;
SET SCHEMA 'MyCocktail';

-- 1. Table des Utilisateurs
CREATE TABLE MyCocktail._compte (
    idCompte VARCHAR(50) PRIMARY KEY,
    pseudo VARCHAR(50) NOT NULL,
    mailCompte VARCHAR(100) NOT NULL UNIQUE,
    mdpCompte VARCHAR(255) NOT NULL,
    dateNaissance DATE NOT NULL
);

-- 2. Table des Ingrédients (Référence unique)
CREATE TABLE MyCocktail._ingredients (
    idIngredients VARCHAR(50) PRIMARY KEY,
    nomIngredients VARCHAR(100) NOT NULL,
    categorie VARCHAR(50)
);

-- 3. Table des Ustensiles
CREATE TABLE MyCocktail._ustensile (
    idUstensile VARCHAR(50) PRIMARY KEY,
    nomUstensile VARCHAR(100) NOT NULL
);

-- 4. Le Frigo (Lié à un Compte)
CREATE TABLE MyCocktail._frigo (
    idFrigo VARCHAR(50) PRIMARY KEY,
    idCompte VARCHAR(50) NOT NULL,
    FOREIGN KEY (idCompte) REFERENCES MyCocktail._compte(idCompte) ON DELETE CASCADE
);

-- 5. Contenu du Frigo (Relation Many-to-Many entre Frigo et Ingrédients)
CREATE TABLE MyCocktail._frigo_composition (
    idFrigo VARCHAR(50),
    idIngredients VARCHAR(50),
    quantiteRestante FLOAT,
    PRIMARY KEY (idFrigo, idIngredients),
    FOREIGN KEY (idFrigo) REFERENCES MyCocktail._frigo(idFrigo) ON DELETE CASCADE,
    FOREIGN KEY (idIngredients) REFERENCES MyCocktail._ingredients(idIngredients)
);

-- 6. Table des Cocktails
CREATE TABLE MyCocktail._cocktail (
    idCocktail VARCHAR(50) PRIMARY KEY,
    nomCocktail VARCHAR(100) NOT NULL,
    descriptionCocktail VARCHAR(1000),
    difficulte INT,
    alcool BOOLEAN,
    duree VARCHAR(20),
    prix FLOAT,
    idCompte_Auteur VARCHAR(50) NOT NULL,
    FOREIGN KEY (idCompte_Auteur) REFERENCES MyCocktail._compte(idCompte)
);

-- 7. Table des Étapes
CREATE TABLE MyCocktail._etape (
    idEtape VARCHAR(50) PRIMARY KEY,
    descriptionEtape TEXT NOT NULL,
    numeroEtape INT,
    idCocktail VARCHAR(50) NOT NULL,
    FOREIGN KEY (idCocktail) REFERENCES MyCocktail._cocktail(idCocktail) ON DELETE CASCADE
);

-- 8. Table DOSAGE (Lien Etape <-> Ingrédient avec quantité)
CREATE TABLE MyCocktail._dosage (
    idEtape VARCHAR(50),
    idIngredients VARCHAR(50),
    quantite FLOAT,
    unite VARCHAR(20),
    PRIMARY KEY (idEtape, idIngredients),
    FOREIGN KEY (idEtape) REFERENCES MyCocktail._etape(idEtape) ON DELETE CASCADE,
    FOREIGN KEY (idIngredients) REFERENCES MyCocktail._ingredients(idIngredients)
);

-- 9. Lien Etape <-> Ustensile
CREATE TABLE MyCocktail._etape_ustensile (
    idEtape VARCHAR(50),
    idUstensile VARCHAR(50),
    PRIMARY KEY (idEtape, idUstensile),
    FOREIGN KEY (idEtape) REFERENCES MyCocktail._etape(idEtape) ON DELETE CASCADE,
    FOREIGN KEY (idUstensile) REFERENCES MyCocktail._ustensile(idUstensile)
);

-- 10. Table des Avis
CREATE TABLE MyCocktail._avis (
    idAvis VARCHAR(50) PRIMARY KEY,
    noteAvis FLOAT,
    titreAvis VARCHAR(100),
    descriptionAvis TEXT,
    dateAvis DATE DEFAULT CURRENT_TIMESTAMP,
    idCocktail VARCHAR(50) NOT NULL, 
    idCompte_Auteur VARCHAR(50) NOT NULL,
    FOREIGN KEY (idCocktail) REFERENCES MyCocktail._cocktail(idCocktail) ON DELETE CASCADE,
    FOREIGN KEY (idCompte_Auteur) REFERENCES MyCocktail._compte(idCompte)
);

-- 11. Réponses aux avis
CREATE TABLE MyCocktail._repondre (
    idReponse VARCHAR(50) PRIMARY KEY,
    commentaireReponse TEXT,
    idAvis VARCHAR(50) NOT NULL UNIQUE,
    FOREIGN KEY (idAvis) REFERENCES MyCocktail._avis(idAvis) ON DELETE CASCADE
);

-- 12. Images
CREATE TABLE MyCocktail._image (
    idImage VARCHAR(50) PRIMARY KEY,
    urlImage VARCHAR(255) NOT NULL,
    altImage VARCHAR(100),
    idCocktail VARCHAR(50),
    idAvis VARCHAR(50),
    FOREIGN KEY (idCocktail) REFERENCES MyCocktail._cocktail(idCocktail) ON DELETE CASCADE,
    FOREIGN KEY (idAvis) REFERENCES MyCocktail._avis(idAvis) ON DELETE CASCADE
);

-- 13. Gestion des Favoris 
CREATE TABLE MyCocktail._compte_cocktail_favori (
    idCompte VARCHAR(50),
    idCocktail VARCHAR(50),
    cocktailAime BOOLEAN DEFAULT TRUE,
    PRIMARY KEY (idCompte, idCocktail),
    FOREIGN KEY (idCompte) REFERENCES MyCocktail._compte(idCompte) ON DELETE CASCADE,
    FOREIGN KEY (idCocktail) REFERENCES MyCocktail._cocktail(idCocktail) ON DELETE CASCADE
);

-- 14. Gestion des réactions aux Avis 
CREATE TABLE MyCocktail._compte_avis_reaction (
    idCompte VARCHAR(50),
    idAvis VARCHAR(50),
    signaler BOOLEAN DEFAULT FALSE,
    aime BOOLEAN DEFAULT FALSE,
    PRIMARY KEY (idCompte, idAvis),
    FOREIGN KEY (idCompte) REFERENCES MyCocktail._compte(idCompte) ON DELETE CASCADE,
    FOREIGN KEY (idAvis) REFERENCES MyCocktail._avis(idAvis) ON DELETE CASCADE
);
