-- Objets SQL absents de 0_init (prisma migrate diff ne gère que tables, index et clés).
-- Généré depuis prisma/creadb.sql (+ vue_cocktails_compacte de Peuplement.sql) : extensions, séquences, contraintes CHECK, fonctions, vues, triggers.

-- ===== Extensions =====
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ===== Séquences (IDs CPT-00001…) =====
CREATE SEQUENCE IF NOT EXISTS seq_compte        START 1;

CREATE SEQUENCE IF NOT EXISTS seq_cocktail      START 1;

CREATE SEQUENCE IF NOT EXISTS seq_avis          START 1;

CREATE SEQUENCE IF NOT EXISTS seq_reponse       START 1;

CREATE SEQUENCE IF NOT EXISTS seq_image         START 1;

CREATE SEQUENCE IF NOT EXISTS seq_etape         START 1;

CREATE SEQUENCE IF NOT EXISTS seq_eu            START 1;

CREATE SEQUENCE IF NOT EXISTS seq_ustensile     START 1;

CREATE SEQUENCE IF NOT EXISTS seq_ingredient    START 1;

CREATE SEQUENCE IF NOT EXISTS seq_signalement   START 1;

CREATE SEQUENCE IF NOT EXISTS seq_dosage        START 1;

CREATE SEQUENCE IF NOT EXISTS seq_favori        START 1;

-- ===== Contraintes CHECK =====
ALTER TABLE _compte ADD CONSTRAINT chk_compte_pseudo_len CHECK (LENGTH(TRIM(pseudo))      >= 3);

ALTER TABLE _compte ADD CONSTRAINT chk_compte_mail_len CHECK (LENGTH(TRIM(mailCompte)) >= 5);

ALTER TABLE _compte ADD CONSTRAINT chk_compte_mail_low CHECK (mailCompte = LOWER(mailCompte));

ALTER TABLE _compte ADD CONSTRAINT chk_compte_mdp_len CHECK (LENGTH(mdpCompte)        >= 8);

ALTER TABLE _compte ADD CONSTRAINT chk_compte_numtel_format CHECK (numTel ~ '^\+?[\d\s\-]{7,20}$');

ALTER TABLE _compte ADD CONSTRAINT chk_compte_date_naiss CHECK (dateNaissance BETWEEN '1900-01-01' AND CURRENT_DATE);

ALTER TABLE _ingredient ADD CONSTRAINT chk_ingredient_nom_len CHECK (LENGTH(TRIM(nomIngredient)) >= 2);

ALTER TABLE _ustensile ADD CONSTRAINT chk_ustensile_nom_len CHECK (LENGTH(TRIM(nomUstensile)) >= 2);

ALTER TABLE _cocktail ADD CONSTRAINT chk_cocktail_nom_len CHECK (LENGTH(TRIM(nomCocktail)) >= 2);

ALTER TABLE _cocktail ADD CONSTRAINT chk_cocktail_desc_len CHECK (LENGTH(TRIM(description)) >= 1);

ALTER TABLE _cocktail ADD CONSTRAINT chk_cocktail_duree_pos CHECK (duree > 0);

ALTER TABLE _etape ADD CONSTRAINT chk_etape_numero_pos CHECK (numeroEtape > 0);

ALTER TABLE _etape ADD CONSTRAINT chk_etape_desc_len CHECK (LENGTH(TRIM(descriptionEtape)) >= 5);

ALTER TABLE _dosage ADD CONSTRAINT chk_dosage_qte_pos CHECK (quantite > 0);

ALTER TABLE _dosage ADD CONSTRAINT chk_dosage_unite_len CHECK (LENGTH(TRIM(unite)) >= 1);

ALTER TABLE _avis ADD CONSTRAINT chk_avis_note_range CHECK (noteAvis BETWEEN 1 AND 5);

ALTER TABLE _avis ADD CONSTRAINT chk_avis_titre_len CHECK (LENGTH(TRIM(titreAvis))       >= 3);

ALTER TABLE _avis ADD CONSTRAINT chk_avis_desc_len CHECK (LENGTH(TRIM(descriptionAvis)) >= 10);

ALTER TABLE _reponse ADD CONSTRAINT chk_reponse_comment_len CHECK (LENGTH(TRIM(commentaire)) >= 2);

ALTER TABLE _reponse ADD CONSTRAINT chk_reponse_self CHECK (idReponse <> idReponseParent);

ALTER TABLE _signalement ADD CONSTRAINT chk_signalement_cible CHECK (
            (idCocktail IS NOT NULL AND idAvis IS NULL     AND idCompteCible IS NULL) OR
            (idCocktail IS NULL     AND idAvis IS NOT NULL AND idCompteCible IS NULL) OR
            (idCocktail IS NULL     AND idAvis IS NULL     AND idCompteCible IS NOT NULL)
        );

ALTER TABLE _signalement ADD CONSTRAINT chk_signalement_self CHECK (idCompte <> idCompteCible);

ALTER TABLE _frigo_composition ADD CONSTRAINT chk_frigo_qte_pos CHECK (quantite > 0);

ALTER TABLE _frigo_composition ADD CONSTRAINT chk_frigo_unite_len CHECK (LENGTH(TRIM(unite)) >= 1);

ALTER TABLE _image ADD CONSTRAINT chk_image_url_len CHECK (LENGTH(TRIM(urlImage))   >= 10);

ALTER TABLE _image ADD CONSTRAINT chk_image_title_len CHECK (LENGTH(TRIM(titleImage)) >= 2);

-- ===== Fonctions =====
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

CREATE OR REPLACE FUNCTION ajouter_cocktail(
    p_nom         VARCHAR(100),
    p_description TEXT,
    p_duree       INT,
    p_idCompte    VARCHAR(13),
    p_difficulte  difficulte_enum DEFAULT 'Facile',
    p_alcool      BOOLEAN         DEFAULT FALSE,
    p_statut      statut_enum     DEFAULT 'brouillon'
)
RETURNS _cocktail AS $$
DECLARE
    v_id     VARCHAR(13);
    v_result _cocktail;
BEGIN
    v_id := 'COK-' || LPAD(nextval('seq_cocktail')::TEXT, 5, '0');

    INSERT INTO _cocktail (idCocktail, nomCocktail, description, difficulte, alcool, duree, statut, idCompte)
    VALUES (v_id, TRIM(p_nom), TRIM(p_description), p_difficulte, p_alcool, p_duree, p_statut, p_idCompte)
    RETURNING * INTO v_result;

    RETURN v_result;
END;
$$ LANGUAGE plpgsql;

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

CREATE OR REPLACE FUNCTION ajouter_dosage(
    p_idCocktail   VARCHAR(13),
    p_idIngredient VARCHAR(13),
    p_quantite     NUMERIC(6,2),
    p_unite        VARCHAR(20),
    p_idEtape      VARCHAR(13) DEFAULT NULL
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

CREATE OR REPLACE FUNCTION ajouter_ustensile_etape(
    p_idEtape     VARCHAR(13),
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

CREATE OR REPLACE FUNCTION ajouter_avis(
    p_idCocktail  VARCHAR(13),
    p_idCompte    VARCHAR(13),
    p_note        INT,
    p_titre       VARCHAR(100),
    p_description TEXT
)
RETURNS _avis AS $$
DECLARE
    v_id     VARCHAR(13);
    v_result _avis;
BEGIN
    v_id := 'AVS-' || LPAD(nextval('seq_avis')::TEXT, 5, '0');

    INSERT INTO _avis (idAvis, idCocktail, idCompte, noteAvis, titreAvis, descriptionAvis)
    VALUES (v_id, p_idCocktail, p_idCompte, p_note, TRIM(p_titre), TRIM(p_description))
    RETURNING * INTO v_result;

    RETURN v_result;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION ajouter_reponse(
    p_idAvis          VARCHAR(13),
    p_idCompte        VARCHAR(13),
    p_commentaire     TEXT,
    p_idReponseParent VARCHAR(13) DEFAULT NULL  
)
RETURNS _reponse AS $$
DECLARE
    v_id     VARCHAR(13);
    v_result _reponse;
BEGIN
    -- 1. Génération de l'identifiant unique REP-XXXXX
    v_id := 'REP-' || LPAD(nextval('seq_reponse')::TEXT, 5, '0');

    -- 2. Insertion avec la gestion du parent
    INSERT INTO _reponse (idReponse, idAvis, idCompte, idReponseParent, commentaire)
    VALUES (v_id, p_idAvis, p_idCompte, p_idReponseParent, TRIM(p_commentaire))
    RETURNING * INTO v_result;

    RETURN v_result;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION ajouter_favori(
    p_idCompte   VARCHAR(13),
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

CREATE OR REPLACE FUNCTION ajouter_signalement(
    p_idCompte      VARCHAR(13),
    p_motif         motif_enum,
    p_idCocktail    VARCHAR(13) DEFAULT NULL,
    p_idAvis        VARCHAR(13) DEFAULT NULL,
    p_idCompteCible VARCHAR(13) DEFAULT NULL
)
RETURNS _signalement AS $$
DECLARE
    v_id     VARCHAR(13);
    v_result _signalement;
BEGIN
    v_id := 'SIG-' || LPAD(nextval('seq_signalement')::TEXT, 5, '0');

    INSERT INTO _signalement (idSignalement, idCompte, motif, idCocktail, idAvis, idCompteCible)
    VALUES (v_id, p_idCompte, p_motif, p_idCocktail, p_idAvis, p_idCompteCible)
    RETURNING * INTO v_result;

    RETURN v_result;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION creer_frigo_auto()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO _frigo (idFrigo, idCompte)
    VALUES (REPLACE(NEW.idCompte, 'CPT-', 'FRG-'), NEW.idCompte);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION ajouter_image(
    p_url   VARCHAR(500),
    p_titre VARCHAR(150),
    p_type  image_enum
)
RETURNS _image AS $$
DECLARE
    v_id     VARCHAR(13);
    v_result _image;
BEGIN
    v_id := 'IMG-' || LPAD(nextval('seq_image')::TEXT, 5, '0');

    INSERT INTO _image (idImage, urlImage, titleImage, typeImage)
    VALUES (v_id, TRIM(p_url), TRIM(p_titre), p_type)
    RETURNING * INTO v_result;

    RETURN v_result;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION ajouter_image_cocktail(
    p_idCocktail VARCHAR(13),
    p_url        VARCHAR(500),
    p_titre      VARCHAR(150)
)
RETURNS _image AS $$
DECLARE
    v_id     VARCHAR(13);
    v_result _image;
BEGIN
    v_id := 'IMG-' || LPAD(nextval('seq_image')::TEXT, 5, '0');

    INSERT INTO _image (idImage, urlImage, titleImage, typeImage, idCocktail)
    VALUES (v_id, TRIM(p_url), TRIM(p_titre), 'cocktail', p_idCocktail)
    RETURNING * INTO v_result;

    RETURN v_result;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION ajouter_image_avis(
    p_idAvis VARCHAR(13),
    p_url    VARCHAR(500),
    p_titre  VARCHAR(150)
)
RETURNS _image AS $$
DECLARE
    v_id     VARCHAR(13);
    v_result _image;
BEGIN
    v_id := 'IMG-' || LPAD(nextval('seq_image')::TEXT, 5, '0');

    INSERT INTO _image (idImage, urlImage, titleImage, typeImage, idAvis)
    VALUES (v_id, TRIM(p_url), TRIM(p_titre), 'avis', p_idAvis)
    RETURNING * INTO v_result;

    RETURN v_result;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION modifier_image_compte(
    p_idCompte VARCHAR(13),
    p_url      VARCHAR(500),
    p_titre    VARCHAR(150)
)
RETURNS _image AS $$
DECLARE
    v_id     VARCHAR(13);
    v_result _image;
BEGIN
    -- Supprime l'ancienne image de profil si elle existe
    DELETE FROM _image WHERE idCompte = p_idCompte AND typeImage = 'profil';

    v_id := 'IMG-' || LPAD(nextval('seq_image')::TEXT, 5, '0');

    INSERT INTO _image (idImage, urlImage, titleImage, typeImage, idCompte)
    VALUES (v_id, TRIM(p_url), TRIM(p_titre), 'profil', p_idCompte)
    RETURNING * INTO v_result;

    RETURN v_result;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION modifier_image_ingredient(
    p_idIngredient VARCHAR(13),
    p_url          VARCHAR(500),
    p_titre        VARCHAR(150)
)
RETURNS _image AS $$
DECLARE
    v_id     VARCHAR(13);
    v_result _image;
BEGIN
    -- Supprime l'ancienne image si elle existe
    DELETE FROM _image WHERE idIngredient = p_idIngredient AND typeImage = 'ingrédient';

    v_id := 'IMG-' || LPAD(nextval('seq_image')::TEXT, 5, '0');

    INSERT INTO _image (idImage, urlImage, titleImage, typeImage, idIngredient)
    VALUES (v_id, TRIM(p_url), TRIM(p_titre), 'ingrédient', p_idIngredient)
    RETURNING * INTO v_result;

    RETURN v_result;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION modifier_image_ustensile(
    p_idUstensile VARCHAR(13),
    p_url         VARCHAR(500),
    p_titre       VARCHAR(150)
)
RETURNS _image AS $$
DECLARE
    v_id     VARCHAR(13);
    v_result _image;
BEGIN
    -- Supprime l'ancienne image si elle existe
    DELETE FROM _image WHERE idUstensile = p_idUstensile AND typeImage = 'ustensile';

    v_id := 'IMG-' || LPAD(nextval('seq_image')::TEXT, 5, '0');

    INSERT INTO _image (idImage, urlImage, titleImage, typeImage, idUstensile)
    VALUES (v_id, TRIM(p_url), TRIM(p_titre), 'ustensile', p_idUstensile)
    RETURNING * INTO v_result;

    RETURN v_result;
END;
$$ LANGUAGE plpgsql;

-- ===== Vues =====
CREATE OR REPLACE VIEW _mineur AS
SELECT
    idCompte,
    pseudo,
    (dateNaissance > CURRENT_DATE - INTERVAL '18 years') AS estMineur
FROM _compte;

CREATE OR REPLACE VIEW v_comptes_roles AS
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

CREATE OR REPLACE VIEW v_fil_discussion AS
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

CREATE OR REPLACE VIEW v_notes_cocktails AS
SELECT
    c.idCocktail,
    c.nomCocktail,
    COUNT(a.idAvis)             AS nb_avis,
    ROUND(AVG(a.noteAvis), 2)   AS note_moyenne
FROM _cocktail c
LEFT JOIN _avis a ON a.idCocktail = c.idCocktail
GROUP BY c.idCocktail, c.nomCocktail
ORDER BY note_moyenne DESC NULLS LAST;

CREATE OR REPLACE VIEW v_image_profil AS
SELECT idImage, urlImage, titleImage, typeImage, idCompte
FROM _image WHERE typeImage = 'profil'
WITH CHECK OPTION;

CREATE OR REPLACE VIEW v_image_cocktail AS
SELECT idImage, urlImage, titleImage, typeImage, idCocktail
FROM _image WHERE typeImage = 'cocktail'
WITH CHECK OPTION;

CREATE OR REPLACE VIEW v_image_avis AS
SELECT idImage, urlImage, titleImage, typeImage, idAvis
FROM _image WHERE typeImage = 'avis'
WITH CHECK OPTION;

CREATE OR REPLACE VIEW v_image_ingredient AS
SELECT idImage, urlImage, titleImage, typeImage, idIngredient
FROM _image WHERE typeImage = 'ingrédient'
WITH CHECK OPTION;

CREATE OR REPLACE VIEW v_image_ustensile AS
SELECT idImage, urlImage, titleImage, typeImage, idUstensile
FROM _image WHERE typeImage = 'ustensile'
WITH CHECK OPTION;

-- Vue de consultation (définie dans Peuplement.sql)
CREATE OR REPLACE VIEW vue_cocktails_compacte AS
SELECT
   c.nomCocktail,
   e.numeroEtape,
   e.descriptionEtape,
   STRING_AGG(
      d.quantite || ' ' || d.unite || ' de ' || i.nomIngredient,
      ', '
      ORDER BY i.nomIngredient
   ) AS liste_ingredients
FROM      _cocktail   c
JOIN      _etape      e ON c.idCocktail  = e.idCocktail
LEFT JOIN _dosage     d ON e.idEtape     = d.idEtape
LEFT JOIN _ingredient i ON d.idIngredient = i.idIngredient
GROUP BY  c.nomCocktail, e.numeroEtape, e.descriptionEtape
ORDER BY  c.nomCocktail, e.numeroEtape;

-- ===== Triggers =====
CREATE TRIGGER trg_hash_mdp
BEFORE INSERT OR UPDATE OF mdpCompte ON _compte
FOR EACH ROW EXECUTE FUNCTION hash_mdp();

CREATE TRIGGER trg_dosage_etape_cocktail
BEFORE INSERT OR UPDATE ON _dosage
FOR EACH ROW EXECUTE FUNCTION check_dosage_etape_cocktail();

CREATE TRIGGER trg_check_avis_auteur
BEFORE INSERT OR UPDATE OF idCompte, idCocktail ON _avis
FOR EACH ROW EXECUTE FUNCTION check_avis_auteur();

CREATE TRIGGER trg_creer_frigo
AFTER INSERT ON _compte
FOR EACH ROW EXECUTE FUNCTION creer_frigo_auto();
