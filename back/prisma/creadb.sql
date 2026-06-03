/* ============================================================ */
/* MyCocktail - Base de données PostgreSQL            */
/* ============================================================ */

DROP SCHEMA IF EXISTS MyCocktail CASCADE;
CREATE SCHEMA MyCocktail;
SET search_path TO MyCocktail;

-- Extension nécessaire pour le hachage bcrypt
CREATE EXTENSION IF NOT EXISTS pgcrypto;

/* ============================================================
        TYPES ENUM - Définition de listes de valeurs fixes 
   ============================================================ */

CREATE TYPE difficulte_enum AS ENUM ('Facile', 'Moyen', 'Difficile');
CREATE TYPE statut_enum     AS ENUM ('brouillon', 'publié', 'privé', 'archivé');
CREATE TYPE categorie_enum  AS ENUM ('alcool', 'jus', 'sirop', 'soda', 'eau', 'fruit', 'autre');
CREATE TYPE motif_enum      AS ENUM ('contenu_inapproprie', 'spam', 'hors_sujet', 'violence', 'autre');
CREATE TYPE role_enum       AS ENUM ('user', 'moderateur', 'admin');

/* ============================================================
        SEQUENCE - Définition des séquences pour les ID automatiques 
   ============================================================ */
CREATE SEQUENCE IF NOT EXISTS seq_compte START 1;
CREATE SEQUENCE IF NOT EXISTS seq_cocktail START 1;
CREATE SEQUENCE IF NOT EXISTS seq_avis START 1;
CREATE SEQUENCE IF NOT EXISTS seq_reponse START 1;
CREATE SEQUENCE IF NOT EXISTS seq_image START 1;
CREATE SEQUENCE IF NOT EXISTS seq_etape START 1;
CREATE SEQUENCE IF NOT EXISTS seq_ustensile START 1;
CREATE SEQUENCE IF NOT EXISTS seq_ingredient START 1;
CREATE SEQUENCE IF NOT EXISTS seq_signalement START 1;

/* ============================================================
   1. COMPTE
   ============================================================ */

CREATE TABLE _compte (
    idCompte        VARCHAR(13)     PRIMARY KEY,
    pseudo          VARCHAR(50)     NOT NULL UNIQUE,
    mailCompte      VARCHAR(100)    NOT NULL UNIQUE,
    numTel          VARCHAR(20)     NULL,
    mdpCompte       VARCHAR(255)    NOT NULL,
    dateNaissance   DATE            NOT NULL,
    dateInscription TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    role            role_enum       NOT NULL DEFAULT 'user',

    CONSTRAINT chk_compte_pseudo_len      CHECK (LENGTH(TRIM(pseudo))      >= 3),
    CONSTRAINT chk_compte_mail_len        CHECK (LENGTH(TRIM(mailCompte)) >= 5),
    CONSTRAINT chk_compte_mail_low        CHECK (mailCompte = LOWER(mailCompte)),
    CONSTRAINT chk_compte_mdp_len         CHECK (LENGTH(mdpCompte)        >= 8),
    CONSTRAINT chk_compte_numtel_format   CHECK (numTel ~ '^\+?[\d\s\-]{7,20}$'),
    CONSTRAINT chk_compte_date_naiss      CHECK (dateNaissance BETWEEN '1900-01-01' AND CURRENT_DATE)
);

-- ============================================================
-- TRIGGER : Hachage automatique du mot de passe (bcrypt)
-- S'applique à l'insertion ET à la mise à jour du mot de passe.
-- ============================================================
CREATE OR REPLACE FUNCTION hash_mdp()
RETURNS TRIGGER AS $$
BEGIN
    -- On hache uniquement si le mdp a changé (pas déjà un hash bcrypt)
    IF NEW.mdpCompte IS DISTINCT FROM OLD.mdpCompte OR TG_OP = 'INSERT' THEN
        NEW.mdpCompte := crypt(NEW.mdpCompte, gen_salt('bf', 12));
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_hash_mdp
BEFORE INSERT OR UPDATE OF mdpCompte ON _compte
FOR EACH ROW EXECUTE FUNCTION hash_mdp();

-- ============================================================
-- Fonction utilitaire : créer un compte (ID automatique)
-- Le mot de passe est haché automatiquement par trg_hash_mdp.
-- ============================================================
CREATE OR REPLACE FUNCTION inscrire_compte(
    p_pseudo        VARCHAR(50),
    p_mail          VARCHAR(100),
    p_mdp           VARCHAR(255),
    p_dateNaissance DATE,
    p_role          role_enum DEFAULT 'user'
)
RETURNS _compte AS $$
DECLARE
    v_id     VARCHAR(13);
    v_result _compte;
BEGIN
    v_id := 'CPT-' || LPAD(nextval('seq_compte')::TEXT, 5, '0');

    INSERT INTO _compte (idCompte, pseudo, mailCompte, mdpCompte, dateNaissance, role)
    VALUES (v_id, TRIM(p_pseudo), TRIM(p_mail), p_mdp, p_dateNaissance, p_role)
    RETURNING * INTO v_result;

    RETURN v_result;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- Vue utilitaire : indique si chaque utilisateur est mineur
-- ============================================================
CREATE VIEW _mineur AS
SELECT
    idCompte,
    pseudo,
    (dateNaissance > CURRENT_DATE - INTERVAL '18 years') AS estMineur
FROM _compte;

-- ============================================================
-- Vue utilitaire : liste des comptes par rôle
-- Usage : SELECT * FROM v_comptes_roles WHERE role = 'admin';
-- ============================================================
CREATE VIEW v_comptes_roles AS
SELECT
    idCompte,
    pseudo,
    mailCompte,
    role,
    dateInscription,
    (dateNaissance > CURRENT_DATE - INTERVAL '18 years') AS estMineur
FROM _compte
ORDER BY
    CASE role
        WHEN 'admin'      THEN 1
        WHEN 'moderateur' THEN 2
        WHEN 'user'       THEN 3
    END,
    dateInscription;


/* ============================================================
   2. INGREDIENT
   ============================================================ */
CREATE TABLE _ingredient (
    idIngredient    VARCHAR(13)     PRIMARY KEY,
    nomIngredient   VARCHAR(100)    NOT NULL UNIQUE,
    categorie       categorie_enum  NOT NULL DEFAULT 'autre',

    CONSTRAINT chk_ingredient_nom_len  CHECK (LENGTH(TRIM(nomIngredient)) >= 2)
);


-- ============================================================
-- Fonction utilitaire : ajouter un ingrédient (ID automatique)
-- ============================================================
CREATE OR REPLACE FUNCTION ajouter_ingredient(
    p_nom       VARCHAR(100),
    p_categorie categorie_enum DEFAULT 'autre'
)
RETURNS _ingredient AS $$
DECLARE
    v_id     VARCHAR(13);
    v_result _ingredient;
BEGIN
    v_id := 'ING-' || LPAD(nextval('seq_ingredient')::TEXT, 5, '0');

    INSERT INTO _ingredient (idIngredient, nomIngredient, categorie)
    VALUES (v_id, TRIM(p_nom), p_categorie)
    RETURNING * INTO v_result;

    RETURN v_result;
END;
$$ LANGUAGE plpgsql;


/* ============================================================
   3. USTENSILE
   ============================================================ */
CREATE TABLE _ustensile (
    idUstensile     VARCHAR(13)     PRIMARY KEY,
    nomUstensile    VARCHAR(100)    NOT NULL UNIQUE,

    CONSTRAINT chk_ustensile_nom_len   CHECK (LENGTH(TRIM(nomUstensile)) >= 2)
);

-- ============================================================
-- Fonction utilitaire : ajouter un ustensile (ID automatique)
-- ============================================================
CREATE OR REPLACE FUNCTION ajouter_ustensile(
    p_nom VARCHAR(100)
)
RETURNS _ustensile AS $$
DECLARE
    v_id     VARCHAR(13);
    v_result _ustensile;
BEGIN
    v_id := 'UST-' || LPAD(nextval('seq_ustensile')::TEXT, 5, '0');

    INSERT INTO _ustensile (idUstensile, nomUstensile)
    VALUES (v_id, TRIM(p_nom))
    RETURNING * INTO v_result;

    RETURN v_result;
END;
$$ LANGUAGE plpgsql;


/* ============================================================
   4. COCKTAIL
   ============================================================ */
CREATE TABLE _cocktail (
    idCocktail      VARCHAR(13)     PRIMARY KEY,
    nomCocktail     VARCHAR(100)    NOT NULL,
    description     TEXT            NOT NULL,
    difficulte      difficulte_enum NOT NULL DEFAULT 'Facile',
    alcool          BOOLEAN         NOT NULL DEFAULT FALSE,
    duree           INT             NOT NULL, -- Exprimé en minutes
    statut          statut_enum     NOT NULL DEFAULT 'brouillon',
    dateCreation    TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    idCompte        VARCHAR(13)     NOT NULL, -- Auteur de la recette

    CONSTRAINT chk_cocktail_nom_len    CHECK (LENGTH(TRIM(nomCocktail)) >= 2),
    CONSTRAINT chk_cocktail_desc_len    CHECK (LENGTH(TRIM(description)) >= 1), -- TODO 1 -> 10 
    CONSTRAINT chk_cocktail_duree_pos  CHECK (duree > 0),

    -- Un auteur ne peut pas avoir deux cocktails avec le même nom
    CONSTRAINT uq_cocktail_nom_auteur  UNIQUE (nomCocktail, idCompte),

    CONSTRAINT fk_cocktail_compte
        FOREIGN KEY (idCompte) REFERENCES _compte(idCompte)
);

-- ============================================================
-- Fonction utilitaire : ajouter un Cocktail (ID automatique)
-- ============================================================

CREATE OR REPLACE FUNCTION ajouter_cocktail(
    p_nom VARCHAR(100),
    p_description TEXT,
    p_duree INT,
    p_idCompte VARCHAR(13),
    p_difficulte difficulte_enum DEFAULT 'Facile',
    p_alcool BOOLEAN DEFAULT FALSE,
    p_statut statut_enum DEFAULT 'brouillon'
)
RETURNS _cocktail AS $$
DECLARE
    v_id VARCHAR(13);
    v_result _cocktail;
BEGIN
    -- Génération de l'ID : COK-00001
    v_id := 'COK-' || LPAD(nextval('seq_cocktail')::TEXT, 5, '0');

    INSERT INTO _cocktail (idCocktail, nomCocktail, description, difficulte, alcool, duree, statut, idCompte)
    VALUES (v_id, TRIM(p_nom), TRIM(p_description), p_difficulte, p_alcool, p_duree, p_statut, p_idCompte)
    RETURNING * INTO v_result;

    RETURN v_result;
END;
$$ LANGUAGE plpgsql;


/* ============================================================
   5. ETAPE
   ============================================================ */
CREATE TABLE _etape (
    idEtape          VARCHAR(13)     PRIMARY KEY,
    idCocktail       VARCHAR(13)     NOT NULL,
    numeroEtape      INT             NOT NULL, -- Ordre de l'étape
    descriptionEtape TEXT            NOT NULL,

    CONSTRAINT chk_etape_numero_pos    CHECK (numeroEtape > 0),
    CONSTRAINT chk_etape_desc_len      CHECK (LENGTH(TRIM(descriptionEtape)) >= 5),

    -- Un cocktail ne peut pas avoir deux fois le même numéro d'étape
    CONSTRAINT uq_etape_ordre          UNIQUE (idCocktail, numeroEtape),
    
    -- Si le cocktail est supprimé, ses étapes le sont aussi (CASCADE)
    CONSTRAINT fk_etape_cocktail
        FOREIGN KEY (idCocktail) REFERENCES _cocktail(idCocktail)
        ON DELETE CASCADE
);

-- ============================================================
-- Fonction utilitaire : Ajouter une étape à un cocktail
-- (Le numéro de l'étape est calculé automatiquement)
-- ============================================================
CREATE OR REPLACE FUNCTION ajouter_etape_cocktail(
    p_idCocktail       VARCHAR(13),
    p_descriptionEtape TEXT
)
RETURNS _etape AS $$
DECLARE
    v_id           VARCHAR(13);
    v_prochain_num INT;
    v_result       _etape;
BEGIN
    v_id := 'ETP-' || LPAD(nextval('seq_etape')::TEXT, 5, '0');

    SELECT COALESCE(MAX(numeroEtape), 0) + 1 
    INTO v_prochain_num 
    FROM _etape 
    WHERE idCocktail = p_idCocktail;

    INSERT INTO _etape (idEtape, idCocktail, numeroEtape, descriptionEtape)
    VALUES (v_id, p_idCocktail, v_prochain_num, TRIM(p_descriptionEtape))
    RETURNING * INTO v_result;

    RETURN v_result;
END;
$$ LANGUAGE plpgsql;


/* ============================================================
   6. DOSAGE  (Étape <-> Ingrédient)
   ============================================================ */

CREATE TABLE _dosage (
    idCocktail      VARCHAR(13)     NOT NULL,
    idIngredient    VARCHAR(13)     NOT NULL,
    quantite        NUMERIC(6,2)    NOT NULL, -- Ex: 4.50
    unite           VARCHAR(20)     NOT NULL, -- Ex: "cl", "feuilles", "cuillères"
    idEtape         VARCHAR(13)     NULL,

    CONSTRAINT pk_dosage             PRIMARY KEY (idCocktail, idIngredient),
    CONSTRAINT chk_dosage_qte_pos    CHECK (quantite > 0),
    CONSTRAINT chk_dosage_unite_len  CHECK (LENGTH(TRIM(unite)) >= 1),

    CONSTRAINT fk_dosage_cocktail
        FOREIGN KEY (idCocktail)   REFERENCES _cocktail(idCocktail)
        ON DELETE CASCADE,
    CONSTRAINT fk_dosage_ingredient
        FOREIGN KEY (idIngredient) REFERENCES _ingredient(idIngredient),
    
    -- Si l'étape est supprimée, on garde le dosage mais on retire la liaison (SET NULL)
    CONSTRAINT fk_dosage_etape
        FOREIGN KEY (idEtape)      REFERENCES _etape(idEtape)
        ON DELETE SET NULL
);

-- ============================================================
-- Fonction utilitaire : Ajouter un ingrédient à une étape
-- ============================================================

CREATE OR REPLACE FUNCTION ajouter_dosage(
    p_idCocktail VARCHAR(13),
    p_idIngredient VARCHAR(13),
    p_quantite NUMERIC(6,2),
    p_unite VARCHAR(20),
    p_idEtape VARCHAR(13) DEFAULT NULL
)
RETURNS _dosage AS $$
DECLARE
    v_result _dosage;
BEGIN
    INSERT INTO _dosage (idCocktail, idIngredient, quantite, unite, idEtape)
    VALUES (p_idCocktail, p_idIngredient, p_quantite, TRIM(p_unite), p_idEtape)
    RETURNING * INTO v_result;

    RETURN v_result;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- TRIGGER : Cohérence des Dosages et Étapes
-- ============================================================
CREATE OR REPLACE FUNCTION check_dosage_etape_cocktail()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.idEtape IS NOT NULL THEN
        PERFORM * FROM _etape
            WHERE idEtape    = NEW.idEtape
              AND idCocktail = NEW.idCocktail;
        IF NOT FOUND THEN
            RAISE EXCEPTION
                'L''étape % n''appartient pas au cocktail %.',
                NEW.idEtape, NEW.idCocktail;
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_dosage_etape_cocktail
BEFORE INSERT OR UPDATE ON _dosage
FOR EACH ROW EXECUTE FUNCTION check_dosage_etape_cocktail();


/* ============================================================
   7. ETAPE_USTENSILE  (Étape <-> Ustensile)
   ============================================================ */
CREATE TABLE _etape_ustensile (
    idEtape         VARCHAR(13)     NOT NULL,
    idUstensile     VARCHAR(13)     NOT NULL,

    CONSTRAINT pk_etape_ustensile    PRIMARY KEY (idEtape, idUstensile),
    CONSTRAINT fk_eu_etape
        FOREIGN KEY (idEtape)     REFERENCES _etape(idEtape)
        ON DELETE CASCADE,
    CONSTRAINT fk_eu_ustensile
        FOREIGN KEY (idUstensile) REFERENCES _ustensile(idUstensile)
        ON DELETE RESTRICT 
);

-- ============================================================
-- Fonction utilitaire : Ajouter un ustensile à une étape
-- ============================================================

CREATE OR REPLACE FUNCTION ajouter_ustensile_etape(
    p_idEtape VARCHAR(13),
    p_idUstensile VARCHAR(13)
)
RETURNS _etape_ustensile AS $$
DECLARE
    v_result _etape_ustensile;
BEGIN
    INSERT INTO _etape_ustensile (idEtape, idUstensile)
    VALUES (p_idEtape, p_idUstensile)
    RETURNING * INTO v_result;

    RETURN v_result;
END;
$$ LANGUAGE plpgsql;


/* ============================================================
   8. IMAGE 
   ============================================================ */
CREATE TABLE _image (
    idImage         VARCHAR(13)     PRIMARY KEY,
    urlImage        VARCHAR(500)    NOT NULL UNIQUE,
    titleImage      VARCHAR(150)    NOT NULL,

    CONSTRAINT chk_image_url_len     CHECK (LENGTH(TRIM(urlImage))   >= 10),
    CONSTRAINT chk_image_title_len   CHECK (LENGTH(TRIM(titleImage)) >= 2)
);

-- ============================================================
-- Fonction utilitaire : ajouter une Image (ID automatique)
-- On doit ajouter l'image avec les fonctions des tables liées
-- ============================================================

CREATE OR REPLACE FUNCTION ajouter_image(
    p_url   VARCHAR(500),
    p_titre VARCHAR(150)
)
RETURNS _image AS $$
DECLARE
    v_id     VARCHAR(13);
    v_result _image;
BEGIN
    v_id := 'IMG-' || LPAD(nextval('seq_image')::TEXT, 5, '0');

    INSERT INTO _image (idImage, urlImage, titleImage)
    VALUES (v_id, TRIM(p_url), TRIM(p_titre))
    RETURNING * INTO v_result;

    RETURN v_result;
END;
$$ LANGUAGE plpgsql;


/* ============================================================
   9. IMAGE_COCKTAIL
   ============================================================ */
CREATE TABLE _image_cocktail (
    idImage         VARCHAR(13)     NOT NULL,
    idCocktail      VARCHAR(13)     NOT NULL,

    CONSTRAINT pk_image_cocktail     PRIMARY KEY (idImage, idCocktail),
    CONSTRAINT fk_ic_image
        FOREIGN KEY (idImage)    REFERENCES _image(idImage)
        ON DELETE CASCADE,
    CONSTRAINT fk_ic_cocktail
        FOREIGN KEY (idCocktail) REFERENCES _cocktail(idCocktail)
        ON DELETE CASCADE
);

-- ============================================================
-- Fonction utilitaire : Lié une image à un cocktail (ID de l'image automatique)
-- ============================================================

CREATE OR REPLACE FUNCTION ajouter_image_cocktail(
    p_idCocktail VARCHAR(13),
    p_url        VARCHAR(500),
    p_titre      VARCHAR(150)
)
RETURNS VARCHAR(13) AS $$
DECLARE
    v_img _image;
BEGIN
    v_img := ajouter_image(p_url, p_titre);
    
    INSERT INTO _image_cocktail (idImage, idCocktail)
    VALUES (v_img.idImage, p_idCocktail);

    RETURN v_img.idImage;
END;
$$ LANGUAGE plpgsql;


/* ============================================================
   10. AVIS
   ============================================================ */
CREATE TABLE _avis (
    idAvis          VARCHAR(13)     PRIMARY KEY,
    idCocktail      VARCHAR(13)     NOT NULL,
    idCompte        VARCHAR(13)     NOT NULL,
    noteAvis        INT             NOT NULL,
    titreAvis       VARCHAR(100)    NOT NULL,
    descriptionAvis TEXT            NOT NULL,
    dateAvis        TIMESTAMPTZ     NOT NULL DEFAULT NOW(),

    CONSTRAINT chk_avis_note_range   CHECK (noteAvis BETWEEN 1 AND 5),
    CONSTRAINT chk_avis_titre_len    CHECK (LENGTH(TRIM(titreAvis))       >= 3),
    CONSTRAINT chk_avis_desc_len     CHECK (LENGTH(TRIM(descriptionAvis)) >= 10),

    CONSTRAINT uq_avis_unique        UNIQUE (idCocktail, idCompte),

    CONSTRAINT fk_avis_cocktail
        FOREIGN KEY (idCocktail) REFERENCES _cocktail(idCocktail)
        ON DELETE CASCADE,
    CONSTRAINT fk_avis_compte
        FOREIGN KEY (idCompte)   REFERENCES _compte(idCompte)
        ON DELETE CASCADE
);

-- ============================================================
-- TRIGGER : Vérification qu'un auteur ne peut pas noter son propre cocktail
-- ============================================================

CREATE OR REPLACE FUNCTION check_avis_auteur()
RETURNS TRIGGER AS $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM _cocktail
        WHERE idCocktail = NEW.idCocktail
          AND idCompte   = NEW.idCompte
    ) THEN
        RAISE EXCEPTION
            'L''utilisateur % ne peut pas noter son propre cocktail (%).',
            NEW.idCompte, NEW.idCocktail;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
 
CREATE TRIGGER trg_check_avis_auteur
BEFORE INSERT OR UPDATE OF idCompte, idCocktail ON _avis
FOR EACH ROW EXECUTE FUNCTION check_avis_auteur();

-- ============================================================
-- Fonction utilitaire : ajouter un Avis (ID automatique)
-- ============================================================

CREATE OR REPLACE FUNCTION ajouter_avis(
    p_idCocktail VARCHAR(13),
    p_idCompte VARCHAR(13),
    p_note INT,
    p_titre VARCHAR(100),
    p_description TEXT
)
RETURNS _avis AS $$
DECLARE
    v_id VARCHAR(13);
    v_result _avis;
BEGIN
    -- Génération de l'ID : AVS-00001
    v_id := 'AVS-' || LPAD(nextval('seq_avis')::TEXT, 5, '0');

    INSERT INTO _avis (idAvis, idCocktail, idCompte, noteAvis, titreAvis, descriptionAvis)
    VALUES (v_id, p_idCocktail, p_idCompte, p_note, TRIM(p_titre), TRIM(p_description))
    RETURNING * INTO v_result;

    RETURN v_result;
END;
$$ LANGUAGE plpgsql;


/* ============================================================
   11. IMAGE_AVIS
   ============================================================ */
CREATE TABLE _image_avis (
    idImage         VARCHAR(13)     NOT NULL,
    idAvis          VARCHAR(13)     NOT NULL,

    CONSTRAINT pk_image_avis         PRIMARY KEY (idImage, idAvis),
    CONSTRAINT fk_ia_image
        FOREIGN KEY (idImage) REFERENCES _image(idImage)
        ON DELETE CASCADE,
    CONSTRAINT fk_ia_avis
        FOREIGN KEY (idAvis)  REFERENCES _avis(idAvis)
        ON DELETE CASCADE
);

-- ============================================================
-- Fonction utilitaire : Lié une image à un avis (ID de l'image automatique)
-- ============================================================

CREATE OR REPLACE FUNCTION ajouter_image_avis(
    p_idAvis VARCHAR(13),
    p_url    VARCHAR(500),
    p_titre  VARCHAR(150)
)
RETURNS VARCHAR(13) AS $$
DECLARE
    v_img _image;
BEGIN
    v_img := ajouter_image(p_url, p_titre);
    
    INSERT INTO _image_avis (idImage, idAvis)
    VALUES (v_img.idImage, p_idAvis);

    RETURN v_img.idImage;
END;
$$ LANGUAGE plpgsql;


/* ============================================================
   12. REPONSE
   ============================================================ */
CREATE TABLE _reponse (
    idReponse       VARCHAR(13)     PRIMARY KEY,
    idAvis          VARCHAR(13)     NOT NULL,
    idCompte        VARCHAR(13)     NOT NULL,
    commentaire     TEXT            NOT NULL,
    dateReponse     TIMESTAMPTZ     NOT NULL DEFAULT NOW(),

    CONSTRAINT chk_reponse_comment_len CHECK (LENGTH(TRIM(commentaire)) >= 2),
    CONSTRAINT uq_reponse_unique UNIQUE (idAvis, idCompte),

    CONSTRAINT fk_reponse_avis
        FOREIGN KEY (idAvis)   REFERENCES _avis(idAvis)
        ON DELETE CASCADE,
    CONSTRAINT fk_reponse_compte
        FOREIGN KEY (idCompte) REFERENCES _compte(idCompte)
        ON DELETE CASCADE
);

-- Vues liées aux discussions et notes
CREATE VIEW v_fil_discussion AS
SELECT
    c.nomCocktail                           AS cocktail,
    a.idAvis,
    auteur_avis.pseudo                      AS auteur_avis,
    a.noteAvis                              AS note,
    a.titreAvis                             AS titre,
    a.descriptionAvis                       AS avis,
    a.dateAvis                              AS date_avis,
    r.idReponse,
    auteur_rep.pseudo                       AS auteur_reponse,
    r.commentaire                           AS reponse,
    r.dateReponse                           AS date_reponse
FROM _avis a
JOIN  _cocktail  c           ON a.idCocktail = c.idCocktail
JOIN  _compte    auteur_avis ON a.idCompte   = auteur_avis.idCompte
LEFT JOIN _reponse  r        ON r.idAvis     = a.idAvis
LEFT JOIN _compte   auteur_rep ON r.idCompte = auteur_rep.idCompte;

CREATE VIEW v_notes_cocktails AS
SELECT
    c.idCocktail,
    c.nomCocktail,
    COUNT(a.idAvis)             AS nb_avis,
    ROUND(AVG(a.noteAvis), 2)   AS note_moyenne
FROM _cocktail c
LEFT JOIN _avis a ON a.idCocktail = c.idCocktail
GROUP BY c.idCocktail, c.nomCocktail
ORDER BY note_moyenne DESC NULLS LAST;

-- ============================================================
-- Fonction utilitaire : lié une réponse à un avis (ID automatique)
-- ============================================================

CREATE OR REPLACE FUNCTION ajouter_reponse(
    p_idAvis VARCHAR(13),
    p_idCompte VARCHAR(13),
    p_commentaire TEXT
)
RETURNS _reponse AS $$
DECLARE
    v_id VARCHAR(13);
    v_result _reponse;
BEGIN
    v_id := 'REP-' || LPAD(nextval('seq_reponse')::TEXT, 5, '0');

    INSERT INTO _reponse (idReponse, idAvis, idCompte, commentaire)
    VALUES (v_id, p_idAvis, p_idCompte, TRIM(p_commentaire))
    RETURNING * INTO v_result;

    RETURN v_result;
END;
$$ LANGUAGE plpgsql;

/* ============================================================
   13. FAVORI
   ============================================================ */
CREATE TABLE _favori (
    idCompte        VARCHAR(13)     NOT NULL,
    idCocktail      VARCHAR(13)     NOT NULL,
    dateFavori      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),

    CONSTRAINT pk_favori             PRIMARY KEY (idCompte, idCocktail),
    CONSTRAINT fk_favori_compte
        FOREIGN KEY (idCompte)   REFERENCES _compte(idCompte)
        ON DELETE CASCADE,
    CONSTRAINT fk_favori_cocktail
        FOREIGN KEY (idCocktail) REFERENCES _cocktail(idCocktail)
        ON DELETE CASCADE
);

-- ============================================================
-- Fonction utilitaire : Ajouté un cocktail en favori (ID automatique)
-- ============================================================

CREATE OR REPLACE FUNCTION ajouter_favori(
    p_idCompte VARCHAR(13),
    p_idCocktail VARCHAR(13)
)
RETURNS _favori AS $$
DECLARE
    v_result _favori;
BEGIN
    INSERT INTO _favori (idCompte, idCocktail)
    VALUES (p_idCompte, p_idCocktail)
    RETURNING * INTO v_result;

    RETURN v_result;
END;
$$ LANGUAGE plpgsql;

/* ============================================================
   14. SIGNALEMENT --TODO ajouter le signalement des réponses
   ============================================================ */
CREATE TABLE _signalement (
    idSignalement      VARCHAR(13)     PRIMARY KEY,
    idCompte           VARCHAR(13)     NOT NULL,  
    idCocktail         VARCHAR(13)     NULL,
    idAvis             VARCHAR(13)     NULL,
    idCompteCible      VARCHAR(13)     NULL,      
    motif              motif_enum      NOT NULL,
    dateSignalement    TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
 
    CONSTRAINT uq_signalement        UNIQUE (idCompte, idCocktail, idAvis, idCompteCible),
 
    CONSTRAINT chk_signalement_cible
        CHECK (
            (idCocktail IS NOT NULL AND idAvis IS NULL     AND idCompteCible IS NULL) OR
            (idCocktail IS NULL     AND idAvis IS NOT NULL AND idCompteCible IS NULL) OR
            (idCocktail IS NULL     AND idAvis IS NULL     AND idCompteCible IS NOT NULL)
        ),
 
    CONSTRAINT chk_signalement_self
        CHECK (idCompte <> idCompteCible),
 
    CONSTRAINT fk_sig_compte
        FOREIGN KEY (idCompte)      REFERENCES _compte(idCompte)
        ON DELETE CASCADE,
    CONSTRAINT fk_sig_cocktail
        FOREIGN KEY (idCocktail)    REFERENCES _cocktail(idCocktail)
        ON DELETE CASCADE,
    CONSTRAINT fk_sig_avis
        FOREIGN KEY (idAvis)        REFERENCES _avis(idAvis)
        ON DELETE CASCADE,
    CONSTRAINT fk_sig_compte_cible
        FOREIGN KEY (idCompteCible) REFERENCES _compte(idCompte)
        ON DELETE CASCADE
);

-- ============================================================
-- Fonction utilitaire : Signaler du contenu (ID automatique)
-- ============================================================

CREATE OR REPLACE FUNCTION ajouter_signalement(
    p_idCompte VARCHAR(13),
    p_motif motif_enum,
    p_idCocktail VARCHAR(13) DEFAULT NULL,
    p_idAvis VARCHAR(13) DEFAULT NULL,
    p_idCompteCible VARCHAR(13) DEFAULT NULL
)
RETURNS _signalement AS $$
DECLARE
    v_id VARCHAR(13);
    v_result _signalement;
BEGIN
    -- Génération de l'ID : SIG-00001
    v_id := 'SIG-' || LPAD(nextval('seq_signalement')::TEXT, 5, '0');

    INSERT INTO _signalement (idSignalement, idCompte, motif, idCocktail, idAvis, idCompteCible)
    VALUES (v_id, p_idCompte, p_motif, p_idCocktail, p_idAvis, p_idCompteCible)
    RETURNING * INTO v_result;

    RETURN v_result;
END;
$$ LANGUAGE plpgsql;

/* ============================================================
   15. FRIGO
   ============================================================ */
CREATE TABLE _frigo (
    idFrigo         VARCHAR(13)     PRIMARY KEY,
    idCompte        VARCHAR(13)     NOT NULL UNIQUE, 

    CONSTRAINT fk_frigo_compte
        FOREIGN KEY (idCompte) REFERENCES _compte(idCompte)
        ON DELETE CASCADE
);

CREATE OR REPLACE FUNCTION creer_frigo_auto()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO _frigo (idFrigo, idCompte)
    VALUES (REPLACE(NEW.idCompte, 'CPT-', 'FRG-'), NEW.idCompte);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_creer_frigo
AFTER INSERT ON _compte
FOR EACH ROW EXECUTE FUNCTION creer_frigo_auto();


/* ============================================================
   16. FRIGO_COMPOSITION
   ============================================================ */
CREATE TABLE _frigo_composition (
    idFrigo         VARCHAR(13)     NOT NULL,
    idIngredient    VARCHAR(13)     NOT NULL,
    quantite        NUMERIC(8,2)    NOT NULL,
    unite           VARCHAR(20)     NOT NULL,

    CONSTRAINT pk_frigo_composition  PRIMARY KEY (idFrigo, idIngredient),
    CONSTRAINT chk_frigo_qte_pos     CHECK (quantite > 0),
    CONSTRAINT chk_frigo_unite_len   CHECK (LENGTH(TRIM(unite)) >= 1),

    CONSTRAINT fk_fc_frigo
        FOREIGN KEY (idFrigo)      REFERENCES _frigo(idFrigo)
        ON DELETE CASCADE,
    CONSTRAINT fk_fc_ingredient
        FOREIGN KEY (idIngredient) REFERENCES _ingredient(idIngredient)
        ON DELETE CASCADE
);


/* ============================================================
   17. IMAGE_COMPTE
   ============================================================ */
CREATE TABLE _image_compte (
    idImage         VARCHAR(13)     NOT NULL,
    idCompte        VARCHAR(13)     NOT NULL UNIQUE, 

    CONSTRAINT pk_image_compte       PRIMARY KEY (idImage, idCompte),
    CONSTRAINT fk_icp_image
        FOREIGN KEY (idImage)   REFERENCES _image(idImage)
        ON DELETE CASCADE,
    CONSTRAINT fk_icp_compte
        FOREIGN KEY (idCompte)  REFERENCES _compte(idCompte)
        ON DELETE CASCADE
);

-- ============================================================
-- Fonction utilitaire : Lié une image à un compte (ID de l'image automatique)
-- ============================================================

CREATE OR REPLACE FUNCTION modifier_image_compte(
    p_idCompte VARCHAR(13),
    p_url      VARCHAR(500),
    p_titre    VARCHAR(150)
)
RETURNS VARCHAR(13) AS $$
DECLARE
    v_img _image;
BEGIN
    v_img := ajouter_image(p_url, p_titre);
    
    INSERT INTO _image_compte (idImage, idCompte)
    VALUES (v_img.idImage, p_idCompte)
    ON CONFLICT (idCompte) 
    DO UPDATE SET idImage = EXCLUDED.idImage;

    RETURN v_img.idImage;
END;
$$ LANGUAGE plpgsql;


/* ============================================================
   18. IMAGE_INGREDIENT
   ============================================================ */
CREATE TABLE _image_ingredient (
    idImage         VARCHAR(13)     NOT NULL,
    idIngredient    VARCHAR(13)     NOT NULL UNIQUE, 

    CONSTRAINT pk_image_ingredient       PRIMARY KEY (idImage, idIngredient),
    CONSTRAINT fk_ii_image
        FOREIGN KEY (idImage)   REFERENCES _image(idImage)
        ON DELETE CASCADE,
    CONSTRAINT fk_ii_ingredient
        FOREIGN KEY (idIngredient)  REFERENCES _ingredient(idIngredient)
        ON DELETE CASCADE
);

-- ============================================================
-- Fonction utilitaire : Lié une image à un ingrédient (ID de l'image automatique)
-- ============================================================

CREATE OR REPLACE FUNCTION modifier_image_ingredient(
    p_idIngredient VARCHAR(13),
    p_url          VARCHAR(500),
    p_titre        VARCHAR(150)
)
RETURNS VARCHAR(13) AS $$
DECLARE
    v_img _image;
BEGIN
    v_img := ajouter_image(p_url, p_titre);
    
    INSERT INTO _image_ingredient (idImage, idIngredient)
    VALUES (v_img.idImage, p_idIngredient)
    ON CONFLICT (idIngredient) 
    DO UPDATE SET idImage = EXCLUDED.idImage;

    RETURN v_img.idImage;
END;
$$ LANGUAGE plpgsql;


/* ============================================================
   19. IMAGE_USTENSILE
   ============================================================ */
CREATE TABLE _image_ustensile (
    idImage         VARCHAR(13)     NOT NULL,
    idUstensile     VARCHAR(13)     NOT NULL UNIQUE, 

    CONSTRAINT pk_image_ustensile       PRIMARY KEY (idImage, idUstensile),
    CONSTRAINT fk_iu_image
        FOREIGN KEY (idImage)   REFERENCES _image(idImage)
        ON DELETE CASCADE,
    CONSTRAINT fk_iu_ustensile
        FOREIGN KEY (idUstensile)  REFERENCES _ustensile(idUstensile)
        ON DELETE CASCADE
);

-- ============================================================
-- Fonction utilitaire : Lié une image à un ustensile (ID de l'image automatique)
-- ============================================================

CREATE OR REPLACE FUNCTION modifier_image_ustensile(
    p_idUstensile VARCHAR(13),
    p_url         VARCHAR(500),
    p_titre       VARCHAR(150)
)
RETURNS VARCHAR(13) AS $$
DECLARE
    v_img _image;
BEGIN
    v_img := ajouter_image(p_url, p_titre);
    
    INSERT INTO _image_ustensile (idImage, idUstensile)
    VALUES (v_img.idImage, p_idUstensile)
    ON CONFLICT (idUstensile) 
    DO UPDATE SET idImage = EXCLUDED.idImage;

    RETURN v_img.idImage;
END;
$$ LANGUAGE plpgsql;
