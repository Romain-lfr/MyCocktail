/* ============================================================ */
/* MyCocktail - Peuplement de la base de données                */
/* ============================================================ */

SET search_path TO MyCocktail;

/* ============================================================
   NETTOYAGE COMPLET
   ============================================================ */
DELETE FROM _frigo_composition;
DELETE FROM _frigo;
DELETE FROM _signalement;
DELETE FROM _favori;
DELETE FROM _reponse;
DELETE FROM _avis;
DELETE FROM _etape_ustensile;
DELETE FROM _dosage;
DELETE FROM _etape;
DELETE FROM _cocktail;
DELETE FROM _image;
DELETE FROM _ustensile;
DELETE FROM _ingredient;
DELETE FROM _compte;

-- Réinitialisation de TOUTES les séquences d'identifiants
SELECT setval('seq_compte', 1, false);
SELECT setval('seq_ingredient', 1, false);
SELECT setval('seq_ustensile', 1, false);
SELECT setval('seq_etape', 1, false);
SELECT setval('seq_image', 1, false);
SELECT setval('seq_cocktail', 1, false);
SELECT setval('seq_avis', 1, false);
SELECT setval('seq_reponse', 1, false);
-- SELECT setval('seq_signalement', 1, false);

/* ============================================================
   EXECUTION DU PEUPLEMENT DYNAMIQUE VIA FONCTIONS
   ============================================================ */
DO $$
DECLARE
    -- Variables pour stocker les IDs des cocktails générés dynamiquement
    c_moj VARCHAR(13); c_gin VARCHAR(13); c_teq VARCHAR(13);
    c_sex VARCHAR(13); c_pun VARCHAR(13); c_vmo VARCHAR(13);
    c_app VARCHAR(13);

    -- Variables pour stocker les IDs d'étapes générés dynamiquement
    e1_moj VARCHAR(13); e2_moj VARCHAR(13); e3_moj VARCHAR(13);
    e1_gin VARCHAR(13); e2_gin VARCHAR(13); e3_gin VARCHAR(13);
    e1_teq VARCHAR(13); e2_teq VARCHAR(13); e3_teq VARCHAR(13);
    e1_sex VARCHAR(13); e2_sex VARCHAR(13); e3_sex VARCHAR(13);
    e1_pun VARCHAR(13); e2_pun VARCHAR(13); e3_pun VARCHAR(13);
    e1_vmo VARCHAR(13); e2_vmo VARCHAR(13); e3_vmo VARCHAR(13);
    e1_app VARCHAR(13); e2_app VARCHAR(13); e3_app VARCHAR(13);

    -- Variables pour stocker les IDs des avis générés dynamiquement
    a1 VARCHAR(13); a2 VARCHAR(13); a3 VARCHAR(13); 
    a4 VARCHAR(13); a5 VARCHAR(13);
BEGIN

/* ============================================================
   1. COMPTES 
   ============================================================ */
PERFORM inscrire_compte('admin',  'admin@mycocktail.com',  'Admin1234',  '1990-04-12', 'admin'); -- CPT-00001
PERFORM inscrire_compte('romain', 'romain@mycocktail.com', 'Romain1234', '2006-12-04', 'user');  -- CPT-00002
PERFORM inscrire_compte('test',   'test@mycocktail.com',   'Test1234',   '2010-11-05', 'user');  -- CPT-00003

/* ============================================================
   2. INGREDIENTS
   ============================================================ */
PERFORM ajouter_ingredient('Rhum blanc',          'alcool');  -- ING-00001
PERFORM ajouter_ingredient('Gin',                 'alcool');  -- ING-00002
PERFORM ajouter_ingredient('Tequila',             'alcool');  -- ING-00003
PERFORM ajouter_ingredient('Vodka',               'alcool');  -- ING-00004
PERFORM ajouter_ingredient('Rhum ambré',          'alcool');  -- ING-00005
PERFORM ajouter_ingredient('Peach Schnapps',      'alcool');  -- ING-00006
PERFORM ajouter_ingredient('Jus de citron vert',  'jus');     -- ING-00007
PERFORM ajouter_ingredient('Jus d''orange',       'jus');     -- ING-00008
PERFORM ajouter_ingredient('Jus de cranberry',    'jus');     -- ING-00009
PERFORM ajouter_ingredient('Jus d''ananas',       'jus');     -- ING-00010
PERFORM ajouter_ingredient('Eau gazeuse',         'soda');    -- ING-00011
PERFORM ajouter_ingredient('Tonic',               'soda');    -- ING-00012
PERFORM ajouter_ingredient('Grenadine',           'sirop');   -- ING-00013
PERFORM ajouter_ingredient('Feuilles de menthe',  'autre');   -- ING-00014
PERFORM ajouter_ingredient('Glaçons',             'autre');   -- ING-00015
PERFORM ajouter_ingredient('Sirop de sucre',      'sirop');   -- ING-00016
PERFORM ajouter_ingredient('Sucre de canne',      'sirop');   -- ING-00017
PERFORM ajouter_ingredient('Fruit de la passion', 'fruit');   -- ING-00018
PERFORM ajouter_ingredient('Tranches d''orange',  'fruit');   -- ING-00019
PERFORM ajouter_ingredient('Jus de pomme',        'jus');     -- ING-00020
PERFORM ajouter_ingredient('Sirop de rose',       'sirop');   -- ING-00021

/* ============================================================
   3. USTENSILES
   ============================================================ */
PERFORM ajouter_ustensile('Shaker');              -- UST-00001
PERFORM ajouter_ustensile('Pilon');               -- UST-00002
PERFORM ajouter_ustensile('Verre à long drink');  -- UST-00003
PERFORM ajouter_ustensile('Verre à martini');     -- UST-00004
PERFORM ajouter_ustensile('Cuillère de bar');     -- UST-00005
PERFORM ajouter_ustensile('Passoire à cocktail'); -- UST-00006
PERFORM ajouter_ustensile('Verre à punch');       -- UST-00007
PERFORM ajouter_ustensile('Grande casserole');    -- UST-00008
PERFORM ajouter_ustensile('Verre à cocktail');    -- UST-00009

/* ============================================================
   4. COCKTAILS 
   ============================================================ */
c_moj := (ajouter_cocktail('Mojito', 'Le grand classique cubain à base de rhum, menthe fraîche et citron vert. Rafraîchissant et incontournable.', 10, 'CPT-00001', 'Facile', TRUE, 'publié')).idCocktail;
c_gin := (ajouter_cocktail('Gin Tonic', 'Un cocktail sobre et élégant, le mariage parfait entre le gin and le tonic avec une tranche de citron vert.', 5, 'CPT-00001', 'Facile', TRUE, 'publié')).idCocktail;
c_teq := (ajouter_cocktail('Tequila Sunrise', 'Un cocktail solaire aux couleurs du lever de soleil, mêlant tequila, jus d''orange et grenadine.', 8, 'CPT-00001', 'Facile', TRUE, 'publié')).idCocktail;
c_sex := (ajouter_cocktail('Sex on the Beach', 'Un cocktail fruité et coloré à base de vodka, peach schnapps, jus d''orange et jus de cranberry.', 8, 'CPT-00001', 'Facile', TRUE, 'publié')).idCocktail;
c_pun := (ajouter_cocktail('Punch', 'Un punch festif et généreux à base de rhum ambré, jus de fruits et grenadine. Idéal pour les grandes occasions.', 20, 'CPT-00001', 'Moyen', TRUE, 'publié')).idCocktail;
c_vmo := (ajouter_cocktail('Virgin Mojito', 'La version sans alcool du célèbre cocktail cubain. Tout aussi rafraîchissant grâce à la menthe fraîche et au citron vert.', 8, 'CPT-00001', 'Facile', FALSE, 'publié')).idCocktail;
c_app := (ajouter_cocktail('Apple Rose', 'Un cocktail sans alcool doux et floral, associant la fraîcheur du jus de pomme au parfum délicat du sirop de rose.', 5, 'CPT-00001', 'Facile', FALSE, 'publié')).idCocktail;

/* ============================================================
   5. ÉTAPES
   ============================================================ */
-- Mojito
e1_moj := (ajouter_etape_cocktail(c_moj, 'Écraser les feuilles de menthe et le citron vert au pilon dans le verre.')).idEtape;
e2_moj := (ajouter_etape_cocktail(c_moj, 'Ajouter le sirop de sucre et le rhum blanc, puis mélanger avec la cuillère de bar.')).idEtape;
e3_moj := (ajouter_etape_cocktail(c_moj, 'Remplir de glaçons puis compléter avec l''eau gazeuse. Décorer d''une feuille de menthe.')).idEtape;

-- Gin Tonic
e1_gin := (ajouter_etape_cocktail(c_gin, 'Remplir un verre à long drink de glaçons.')).idEtape;
e2_gin := (ajouter_etape_cocktail(c_gin, 'Verser le gin sur les glaçons puis compléter avec le tonic.')).idEtape;
e3_gin := (ajouter_etape_cocktail(c_gin, 'Mélanger délicatement avec la cuillère de bar. Décorer d''une tranche de citron vert.')).idEtape;

-- Tequila Sunrise
e1_teq := (ajouter_etape_cocktail(c_teq, 'Remplir un verre à long drink de glaçons et y verser la tequila.')).idEtape;
e2_teq := (ajouter_etape_cocktail(c_teq, 'Ajouter le jus d''orange sans mélanger.')).idEtape;
e3_teq := (ajouter_etape_cocktail(c_teq, 'Verser lentement la grenadine le long du verre pour créer l''effet sunrise. Ne pas mélanger.')).idEtape;

-- Sex on the Beach
e1_sex := (ajouter_etape_cocktail(c_sex, 'Verser la vodka et le peach schnapps dans le shaker avec des glaçons.')).idEtape;
e2_sex := (ajouter_etape_cocktail(c_sex, 'Ajouter le jus d''orange et le jus de cranberry, puis shaker.')).idEtape;
e3_sex := (ajouter_etape_cocktail(c_sex, 'Filtrer et verser dans un verre à long drink rempli de glaçons. Décorer d''une tranche d''orange.')).idEtape;

-- Punch
e1_pun := (ajouter_etape_cocktail(c_pun, 'Verser le rhum ambré dans la grande casserole.')).idEtape;
e2_pun := (ajouter_etape_cocktail(c_pun, 'Ajouter le jus d''orange, le jus d''ananas, le jus de fruit de la passion et la grenadine.')).idEtape;
e3_pun := (ajouter_etape_cocktail(c_pun, 'Mélanger et réfrigérer au moins 1 heure avant de servir avec des glaçons.')).idEtape;

-- Virgin Mojito
e1_vmo := (ajouter_etape_cocktail(c_vmo, 'Écraser les feuilles de menthe et les morceaux de citron vert au pilon au fond du verre.')).idEtape;
e2_vmo := (ajouter_etape_cocktail(c_vmo, 'Ajouter le sirop de sucre, puis remplir le verre à moitié de glaçons (ou glace pilée).')).idEtape;
e3_vmo := (ajouter_etape_cocktail(c_vmo, 'Compléter avec de l''eau gazeuse et mélanger délicatement à la cuillère.')).idEtape;

-- Apple Rose
e1_app := (ajouter_etape_cocktail(c_app, 'Remplir le shaker de glaçons.')).idEtape;
e2_app := (ajouter_etape_cocktail(c_app, 'Verser le jus de pomme, le jus de citron vert et le sirop de rose dans le shaker, puis agiter vigoureusement.')).idEtape;
e3_app := (ajouter_etape_cocktail(c_app, 'Filtrer et verser le mélange dans un verre à cocktail.')).idEtape;

/* ============================================================
   6. DOSAGES 
   ============================================================ */
-- Mojito
PERFORM ajouter_dosage(c_moj, 'ING-00001', 5,  'cl',       e2_moj);
PERFORM ajouter_dosage(c_moj, 'ING-00007', 3,  'cl',       e1_moj);
PERFORM ajouter_dosage(c_moj, 'ING-00016', 2,  'cl',       e2_moj);
PERFORM ajouter_dosage(c_moj, 'ING-00011', 10, 'cl',       e3_moj);
PERFORM ajouter_dosage(c_moj, 'ING-00014', 6,  'feuilles', e1_moj);
PERFORM ajouter_dosage(c_moj, 'ING-00015', 6,  'glaçons',  e3_moj);

-- Gin Tonic
PERFORM ajouter_dosage(c_gin, 'ING-00002', 5,  'cl',      e2_gin);
PERFORM ajouter_dosage(c_gin, 'ING-00012', 15, 'cl',      e2_gin);
PERFORM ajouter_dosage(c_gin, 'ING-00015', 6,  'glaçons', e1_gin);

-- Tequila Sunrise
PERFORM ajouter_dosage(c_teq, 'ING-00003', 5,  'cl',      e1_teq);
PERFORM ajouter_dosage(c_teq, 'ING-00008', 10, 'cl',      e2_teq);
PERFORM ajouter_dosage(c_teq, 'ING-00013', 2,  'cl',      e3_teq);
PERFORM ajouter_dosage(c_teq, 'ING-00015', 6,  'glaçons', e1_teq);

-- Sex on the Beach
PERFORM ajouter_dosage(c_sex, 'ING-00004', 4,  'cl',      e1_sex);
PERFORM ajouter_dosage(c_sex, 'ING-00006', 2,  'cl',      e1_sex);
PERFORM ajouter_dosage(c_sex, 'ING-00008', 6,  'cl',      e2_sex);
PERFORM ajouter_dosage(c_sex, 'ING-00009', 6,  'cl',      e2_sex);
PERFORM ajouter_dosage(c_sex, 'ING-00015', 6,  'glaçons', e1_sex);

-- Punch
PERFORM ajouter_dosage(c_pun, 'ING-00005', 50, 'cl',      e1_pun);
PERFORM ajouter_dosage(c_pun, 'ING-00008', 50, 'cl',      e2_pun);
PERFORM ajouter_dosage(c_pun, 'ING-00010', 50, 'cl',      e2_pun);
PERFORM ajouter_dosage(c_pun, 'ING-00018', 30, 'cl',      e2_pun);
PERFORM ajouter_dosage(c_pun, 'ING-00013', 10, 'cl',      e2_pun);
PERFORM ajouter_dosage(c_pun, 'ING-00015', 20, 'glaçons', e3_pun);
   
-- Virgin Mojito
PERFORM ajouter_dosage(c_vmo, 'ING-00007', 3,  'cl',       e1_vmo);
PERFORM ajouter_dosage(c_vmo, 'ING-00014', 6,  'feuilles', e1_vmo);
PERFORM ajouter_dosage(c_vmo, 'ING-00016', 2,  'cl',       e2_vmo);
PERFORM ajouter_dosage(c_vmo, 'ING-00015', 6,  'glaçons',  e2_vmo);
PERFORM ajouter_dosage(c_vmo, 'ING-00011', 15, 'cl',       e3_vmo);

-- Apple Rose
PERFORM ajouter_dosage(c_app, 'ING-00015', 6,  'glaçons',  e1_app);
PERFORM ajouter_dosage(c_app, 'ING-00020', 12, 'cl',       e2_app);
PERFORM ajouter_dosage(c_app, 'ING-00007', 2,  'cl',       e2_app);
PERFORM ajouter_dosage(c_app, 'ING-00021', 1.5, 'cl',      e2_app);

/* ============================================================
   7. ETAPE_USTENSILE 
   ============================================================ */
-- Mojito
PERFORM ajouter_ustensile_etape(e1_moj, 'UST-00002'); PERFORM ajouter_ustensile_etape(e1_moj, 'UST-00003'); PERFORM ajouter_ustensile_etape(e2_moj, 'UST-00005');
-- Gin Tonic
PERFORM ajouter_ustensile_etape(e1_gin, 'UST-00003'); PERFORM ajouter_ustensile_etape(e3_gin, 'UST-00005');
-- Tequila Sunrise
PERFORM ajouter_ustensile_etape(e1_teq, 'UST-00003');
-- Sex on the Beach
PERFORM ajouter_ustensile_etape(e1_sex, 'UST-00001'); PERFORM ajouter_ustensile_etape(e3_sex, 'UST-00006'); PERFORM ajouter_ustensile_etape(e3_sex, 'UST-00003');
-- Punch
PERFORM ajouter_ustensile_etape(e1_pun, 'UST-00008'); PERFORM ajouter_ustensile_etape(e3_pun, 'UST-00007');
-- Virgin Mojito
PERFORM ajouter_ustensile_etape(e1_vmo, 'UST-00002'); PERFORM ajouter_ustensile_etape(e1_vmo, 'UST-00003'); PERFORM ajouter_ustensile_etape(e3_vmo, 'UST-00005');
-- Apple Rose
PERFORM ajouter_ustensile_etape(e1_app, 'UST-00001'); PERFORM ajouter_ustensile_etape(e3_app, 'UST-00006'); PERFORM ajouter_ustensile_etape(e3_app, 'UST-00009');

/* ============================================================
   8. CONTENU DES FRIGOS
   ============================================================ */
INSERT INTO _frigo_composition (idFrigo, idIngredient, quantite, unite) VALUES
   ('FRG-00001', 'ING-00001', 70,  'cl'),       
   ('FRG-00001', 'ING-00007', 10,  'cl'),       
   ('FRG-00001', 'ING-00014', 30,  'feuilles'), 
   ('FRG-00001', 'ING-00016', 50,  'cl'),       
   ('FRG-00001', 'ING-00011', 150, 'cl'),       

   ('FRG-00002', 'ING-00003', 70,  'cl'),       
   ('FRG-00002', 'ING-00008', 100, 'cl'),       
   ('FRG-00002', 'ING-00013', 20,  'cl'),       

   ('FRG-00003', 'ING-00008', 200, 'cl'),       
   ('FRG-00003', 'ING-00012', 200, 'cl'),       
   ('FRG-00003', 'ING-00013', 150, 'cl');       

/* ============================================================
   9. AVIS 
   ============================================================ */
a1 := (ajouter_avis(c_moj, 'CPT-00002', 5, 'Un incontournable !', 'Recette parfaite, le mojito le plus rafraîchissant que j''aie jamais préparé.')).idAvis;
a2 := (ajouter_avis(c_gin, 'CPT-00002', 4, 'Simple et efficace', 'Rien de compliqué, c''est exactement ça le charme du Gin Tonic.')).idAvis;
a3 := (ajouter_avis(c_teq, 'CPT-00002', 5, 'Magnifique à regarder et à boire', 'L''effet dégradé est vraiment impressionnant quand on verse la grenadine.')).idAvis;
a4 := (ajouter_avis(c_sex, 'CPT-00002', 5, 'Mon cocktail préféré !', 'Je fais cette recette tout l''été, mes amis adorent.')).idAvis;
a5 := (ajouter_avis(c_pun, 'CPT-00002', 4, 'Parfait pour les soirées', 'Idéal quand on reçoit beaucoup de monde.')).idAvis;

/* ============================================================
   10. REPONSES
   ============================================================ */
PERFORM ajouter_reponse(a1, 'CPT-00001', 'Totalement d''accord, la menthe fraîche c''est obligatoire !');
PERFORM ajouter_reponse(a1, 'CPT-00002', 'Exactement ! Et un bon rhum blanc fait aussi toute la différence.');
PERFORM ajouter_reponse(a1, 'CPT-00003', 'Tu recommandes quelle marque de rhum ?');
PERFORM ajouter_reponse(a2, 'CPT-00001', 'Pour plus d''originalité tu peux ajouter quelques baies de genièvre !');
PERFORM ajouter_reponse(a2, 'CPT-00002', 'Bonne idée, je vais tester ça ce week-end.');
PERFORM ajouter_reponse(a3, 'CPT-00001', 'L''astuce c''est vraiment de verser la grenadine doucement.');
PERFORM ajouter_reponse(a3, 'CPT-00002', 'Oui ! Et de ne surtout pas mélanger ensuite.');
PERFORM ajouter_reponse(a4, 'CPT-00001', 'Super recette en effet !');
PERFORM ajouter_reponse(a5, 'CPT-00001', 'Le citron vert c''est une super idée, ça coupe un peu le sucré.');
PERFORM ajouter_reponse(a5, 'CPT-00002', 'Je vais essayer au prochain repas de famille.');
   
/* ============================================================
   11. SIGNALEMENTS 
   ============================================================ */

PERFORM ajouter_signalement('CPT-00002', 'spam', c_moj, NULL, NULL);        
PERFORM ajouter_signalement('CPT-00001', 'hors_sujet', NULL, a3, NULL);

/* ============================================================
   12. IMAGES DES COCKTAILS
   ============================================================ */

INSERT INTO v_image_cocktail (idImage, urlImage, titleImage, typeImage) VALUES
('IMG-' || LPAD(nextval('seq_image')::TEXT, 5, '0'), '/public/images/mojito.jpg', 'Mojito', 'cocktail'),
('IMG-' || LPAD(nextval('seq_image')::TEXT, 5, '0'), '/public/images/gin_tonic.jpg', 'Gin Tonic', 'cocktail'),
('IMG-' || LPAD(nextval('seq_image')::TEXT, 5, '0'), '/public/images/tequila_sunrise.webp', 'Tequila Sunrise', 'cocktail'),
('IMG-' || LPAD(nextval('seq_image')::TEXT, 5, '0'), '/public/images/sex_on_the_beach.webp', 'Sex on the Beach', 'cocktail'),
('IMG-' || LPAD(nextval('seq_image')::TEXT, 5, '0'), '/public/images/punch.webp', 'Punch', 'cocktail'),
('IMG-' || LPAD(nextval('seq_image')::TEXT, 5, '0'), '/public/images/virgin_mojito.webp', 'Virgin Mojito', 'cocktail'),
('IMG-' || LPAD(nextval('seq_image')::TEXT, 5, '0'), '/public/images/apple_rose.jpg', 'Apple Rose', 'cocktail');


/* ============================================================
   13. IMAGES DES INGRÉDIENTS (Via la vue sécurisée v_image_ingredient)
   ============================================================ */

INSERT INTO v_image_ingredient (idImage, urlImage, titleImage, typeImage) VALUES
('IMG-' || LPAD(nextval('seq_image')::TEXT, 5, '0'), 'https://mon-site.com/uploads/ingredients/rhum_blanc.jpg', 'Rhum Blanc', 'ingrédient'),
('IMG-' || LPAD(nextval('seq_image')::TEXT, 5, '0'), 'https://mon-site.com/uploads/ingredients/gin.jpg', 'Gin', 'ingrédient'),
('IMG-' || LPAD(nextval('seq_image')::TEXT, 5, '0'), 'https://mon-site.com/uploads/ingredients/tequila.jpg', 'Tequila', 'ingrédient'),
('IMG-' || LPAD(nextval('seq_image')::TEXT, 5, '0'), 'https://mon-site.com/uploads/ingredients/vodka.jpg', 'Vodka', 'ingrédient'),
('IMG-' || LPAD(nextval('seq_image')::TEXT, 5, '0'), 'https://mon-site.com/uploads/ingredients/citron_vert.jpg', 'Jus de Citron Vert', 'ingrédient');

END $$;

/* ============================================================
   VUES DE CONSULTATION
   ============================================================ */
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
