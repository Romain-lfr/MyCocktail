/* ============================================================ */
/*         MyCocktail - Peuplement de la base de données        */
/* ============================================================ */

SET search_path TO MyCocktail;

/* ============================================================
   NETTOYAGE
   ============================================================ */
DELETE FROM _image_compte;
DELETE FROM _frigo_composition;
DELETE FROM _frigo;
DELETE FROM _signalement;
DELETE FROM _favori;
DELETE FROM _reponse;
DELETE FROM _image_avis;
DELETE FROM _avis;
DELETE FROM _image_cocktail;
DELETE FROM _etape_ustensile;
DELETE FROM _dosage;
DELETE FROM _etape;
DELETE FROM _cocktail;
DELETE FROM _image;
DELETE FROM _ustensile;
DELETE FROM _ingredient;
DELETE FROM _compte;

/* ============================================================
   1. COMPTES
   admin  → majeur, rôle admin
   romain → majeur 
   test   → mineur
   ============================================================ */
SELECT setval('seq_compte', 1, false);

SELECT inscrire_compte('admin',  'admin@mycocktail.com',  'Admin1234',  '1990-04-12', 'admin'); -- CPT-00001
SELECT inscrire_compte('romain', 'romain@mycocktail.com', 'Romain1234', '2006-12-04', 'user');  -- CPT-00002
SELECT inscrire_compte('test',   'test@mycocktail.com',   'Test1234',   '2010-11-05', 'user');  -- CPT-00003

/* ============================================================
   2. INGREDIENTS
   ============================================================ */
SELECT setval('seq_ingredient', 1, false);

SELECT ajouter_ingredient('Rhum blanc',          'alcool');  -- ING-00001
SELECT ajouter_ingredient('Gin',                 'alcool');  -- ING-00002
SELECT ajouter_ingredient('Tequila',             'alcool');  -- ING-00003
SELECT ajouter_ingredient('Vodka',               'alcool');  -- ING-00004
SELECT ajouter_ingredient('Rhum ambré',          'alcool');  -- ING-00005
SELECT ajouter_ingredient('Peach Schnapps',      'alcool');  -- ING-00006
SELECT ajouter_ingredient('Jus de citron vert',  'jus');     -- ING-00007
SELECT ajouter_ingredient('Jus d''orange',       'jus');     -- ING-00008
SELECT ajouter_ingredient('Jus de cranberry',    'jus');     -- ING-00009
SELECT ajouter_ingredient('Jus d''ananas',       'jus');     -- ING-00010
SELECT ajouter_ingredient('Eau gazeuse',         'soda');    -- ING-00011
SELECT ajouter_ingredient('Tonic',               'soda');    -- ING-00012
SELECT ajouter_ingredient('Grenadine',           'sirop');   -- ING-00013
SELECT ajouter_ingredient('Feuilles de menthe',  'autre');   -- ING-00014
SELECT ajouter_ingredient('Glaçons',             'autre');   -- ING-00015
SELECT ajouter_ingredient('Sirop de sucre',      'sirop');   -- ING-00016
SELECT ajouter_ingredient('Sucre de canne',      'sirop');   -- ING-00017
SELECT ajouter_ingredient('Fruit de la passion', 'fruit');   -- ING-00018
SELECT ajouter_ingredient('Tranches d''orange',  'fruit');   -- ING-00019

/* ============================================================
   3. USTENSILES
   ============================================================ */
SELECT setval('seq_ustensile', 1, false);

SELECT ajouter_ustensile('Shaker');             -- UST-00001
SELECT ajouter_ustensile('Pilon');              -- UST-00002
SELECT ajouter_ustensile('Verre à long drink'); -- UST-00003
SELECT ajouter_ustensile('Verre à martini');    -- UST-00004
SELECT ajouter_ustensile('Cuillère de bar');    -- UST-00005
SELECT ajouter_ustensile('Passoire à cocktail');-- UST-00006
SELECT ajouter_ustensile('Verre à punch');      -- UST-00007
SELECT ajouter_ustensile('Grande casserole');   -- UST-00008

/* ============================================================
   4. COCKTAILS
   ============================================================ */
INSERT INTO _cocktail (idCocktail, nomCocktail, description, difficulte, alcool, duree, statut, idCompte) VALUES
    ('CKT-00001', 'Mojito',
     'Le grand classique cubain à base de rhum, menthe fraîche et citron vert. Rafraîchissant et incontournable.',
     'Facile', TRUE, 10, 'publié', 'CPT-00001'),

    ('CKT-00002', 'Gin Tonic',
     'Un cocktail sobre et élégant, le mariage parfait entre le gin et le tonic avec une tranche de citron vert.',
     'Facile', TRUE, 5, 'publié', 'CPT-00001'),

    ('CKT-00003', 'Tequila Sunrise',
     'Un cocktail solaire aux couleurs du lever de soleil, mêlant tequila, jus d''orange et grenadine.',
     'Facile', TRUE, 8, 'publié', 'CPT-00001'),

    ('CKT-00004', 'Sex on the Beach',
     'Un cocktail fruité et coloré à base de vodka, peach schnapps, jus d''orange et jus de cranberry.',
     'Facile', TRUE, 8, 'publié', 'CPT-00001'),

    ('CKT-00005', 'Punch',
     'Un punch festif et généreux à base de rhum ambré, jus de fruits et grenadine. Idéal pour les grandes occasions.',
     'Moyen', TRUE, 20, 'publié', 'CPT-00001');

/* ============================================================
   5. ETAPES
   ============================================================ */
INSERT INTO _etape (idEtape, idCocktail, numeroEtape, descriptionEtape) VALUES
    -- Mojito
    ('ETP-00001', 'CKT-00001', 1, 'Écraser les feuilles de menthe et le citron vert au pilon dans le verre.'),
    ('ETP-00002', 'CKT-00001', 2, 'Ajouter le sirop de sucre et le rhum blanc, puis mélanger avec la cuillère de bar.'),
    ('ETP-00003', 'CKT-00001', 3, 'Remplir de glaçons puis compléter avec l''eau gazeuse. Décorer d''une feuille de menthe.'),

    -- Gin Tonic
    ('ETP-00004', 'CKT-00002', 1, 'Remplir un verre à long drink de glaçons.'),
    ('ETP-00005', 'CKT-00002', 2, 'Verser le gin sur les glaçons puis compléter avec le tonic.'),
    ('ETP-00006', 'CKT-00002', 3, 'Mélanger délicatement avec la cuillère de bar. Décorer d''une tranche de citron vert.'),

    -- Tequila Sunrise
    ('ETP-00007', 'CKT-00003', 1, 'Remplir un verre à long drink de glaçons et y verser la tequila.'),
    ('ETP-00008', 'CKT-00003', 2, 'Ajouter le jus d''orange sans mélanger.'),
    ('ETP-00009', 'CKT-00003', 3, 'Verser lentement la grenadine le long du verre pour créer l''effet sunrise. Ne pas mélanger.'),

    -- Sex on the Beach
    ('ETP-00010', 'CKT-00004', 1, 'Verser la vodka et le peach schnapps dans le shaker avec des glaçons.'),
    ('ETP-00011', 'CKT-00004', 2, 'Ajouter le jus d''orange et le jus de cranberry, puis shaker.'),
    ('ETP-00012', 'CKT-00004', 3, 'Filtrer et verser dans un verre à long drink rempli de glaçons. Décorer d''une tranche d''orange.'),

    -- Punch
    ('ETP-00013', 'CKT-00005', 1, 'Verser le rhum ambré dans la grande casserole.'),
    ('ETP-00014', 'CKT-00005', 2, 'Ajouter le jus d''orange, le jus d''ananas, le jus de fruit de la passion et la grenadine.'),
    ('ETP-00015', 'CKT-00005', 3, 'Mélanger et réfrigérer au moins 1 heure avant de servir avec des glaçons.');

/* ============================================================
   6. DOSAGES
   ============================================================ */
INSERT INTO _dosage (idCocktail, idIngredient, quantite, unite, idEtape) VALUES
    -- Mojito
    ('CKT-00001', 'ING-00001', 5,  'cl',       'ETP-00002'),  -- Rhum blanc
    ('CKT-00001', 'ING-00007', 3,  'cl',       'ETP-00001'),  -- Jus de citron vert
    ('CKT-00001', 'ING-00016', 2,  'cl',       'ETP-00002'),  -- Sirop de sucre
    ('CKT-00001', 'ING-00011', 10, 'cl',       'ETP-00003'),  -- Eau gazeuse
    ('CKT-00001', 'ING-00014', 6,  'feuilles', 'ETP-00001'),  -- Feuilles de menthe
    ('CKT-00001', 'ING-00015', 6,  'glaçons',  'ETP-00003'),  -- Glaçons

    -- Gin Tonic
    ('CKT-00002', 'ING-00002', 5,  'cl',      'ETP-00005'),   -- Gin
    ('CKT-00002', 'ING-00012', 15, 'cl',      'ETP-00005'),   -- Tonic
    ('CKT-00002', 'ING-00015', 6,  'glaçons', 'ETP-00004'),   -- Glaçons

    -- Tequila Sunrise
    ('CKT-00003', 'ING-00003', 5,  'cl',      'ETP-00007'),   -- Tequila
    ('CKT-00003', 'ING-00008', 10, 'cl',      'ETP-00008'),   -- Jus d''orange
    ('CKT-00003', 'ING-00013', 2,  'cl',      'ETP-00009'),   -- Grenadine
    ('CKT-00003', 'ING-00015', 6,  'glaçons', 'ETP-00007'),   -- Glaçons

    -- Sex on the Beach
    ('CKT-00004', 'ING-00004', 4,  'cl',      'ETP-00010'),   -- Vodka
    ('CKT-00004', 'ING-00006', 2,  'cl',      'ETP-00010'),   -- Peach Schnapps
    ('CKT-00004', 'ING-00008', 6,  'cl',      'ETP-00011'),   -- Jus d''orange
    ('CKT-00004', 'ING-00009', 6,  'cl',      'ETP-00011'),   -- Jus de cranberry
    ('CKT-00004', 'ING-00015', 6,  'glaçons', 'ETP-00010'),   -- Glaçons

    -- Punch
    ('CKT-00005', 'ING-00005', 50, 'cl',      'ETP-00013'),   -- Rhum ambré
    ('CKT-00005', 'ING-00008', 50, 'cl',      'ETP-00014'),   -- Jus d''orange
    ('CKT-00005', 'ING-00010', 50, 'cl',      'ETP-00014'),   -- Jus d''ananas
    ('CKT-00005', 'ING-00018', 30, 'cl',      'ETP-00014'),   -- Fruit de la passion
    ('CKT-00005', 'ING-00013', 10, 'cl',      'ETP-00014'),   -- Grenadine
    ('CKT-00005', 'ING-00015', 20, 'glaçons', 'ETP-00015');   -- Glaçons

/* ============================================================
   7. ETAPE_USTENSILE
   ============================================================ */
INSERT INTO _etape_ustensile (idEtape, idUstensile) VALUES

    -- Mojito
    ('ETP-00001', 'UST-00002'),  -- Pilon
    ('ETP-00001', 'UST-00003'),  -- Verre long drink
    ('ETP-00002', 'UST-00005'),  -- Cuillère de bar
    
    -- Gin Tonic
    ('ETP-00004', 'UST-00003'),  -- Verre long drink
    ('ETP-00006', 'UST-00005'),  -- Cuillère de bar
    
    -- Tequila Sunrise
    ('ETP-00007', 'UST-00003'),  -- Verre long drink
    
    -- Sex on the Beach
    ('ETP-00010', 'UST-00001'),  -- Shaker
    ('ETP-00012', 'UST-00006'),  -- Passoire à cocktail
    ('ETP-00012', 'UST-00003'),  -- Verre long drink
    
    -- Punch
    ('ETP-00013', 'UST-00008'),  -- Grande casserole
    ('ETP-00015', 'UST-00007');  -- Verre à punch

/* ============================================================
   8. FRIGOS
   ============================================================ */

INSERT INTO _frigo_composition (idFrigo, idIngredient, quantite, unite) VALUES
    -- Frigo admin : de quoi faire un Mojito
    ('FRG-00001', 'ING-00001', 70,  'cl'),        -- Rhum blanc
    ('FRG-00001', 'ING-00007', 10,  'cl'),        -- Jus de citron vert
    ('FRG-00001', 'ING-00014', 30,  'feuilles'),  -- Feuilles de menthe
    ('FRG-00001', 'ING-00016', 50,  'cl'),        -- Sirop de sucre
    ('FRG-00001', 'ING-00011', 150, 'cl'),        -- Eau gazeuse

    -- Frigo romain : de quoi faire un Tequila Sunrise
    ('FRG-00002', 'ING-00003', 70,  'cl'),        -- Tequila
    ('FRG-00002', 'ING-00008', 100, 'cl'),        -- Jus d''orange
    ('FRG-00002', 'ING-00013', 20,  'cl'),        -- Grenadine

    -- Frigo test (mineur) : uniquement des softs
    ('FRG-00003', 'ING-00008', 200, 'cl'),        -- Jus d''orange
    ('FRG-00003', 'ING-00012', 200, 'cl'),        -- Tonic
    ('FRG-00003', 'ING-00013', 150, 'cl');        -- Grenadine

/* ============================================================
   9. AVIS
   ============================================================ */
INSERT INTO _avis (idAvis, idCocktail, idCompte, noteAvis, titreAvis, descriptionAvis) VALUES
    -- admin note le Mojito
    ('AVS-00001', 'CKT-00001', 'CPT-00001', 5,
     'Un incontournable !',
     'Recette parfaite, le mojito le plus rafraîchissant que j''aie jamais préparé. La menthe fraîche fait toute la différence.'),

    -- romain note le Mojito
    ('AVS-00002', 'CKT-00001', 'CPT-00002', 4,
     'Très bon mais sucré',
     'Excellente recette, facile à suivre. Je mettrais un peu moins de sirop de sucre la prochaine fois mais c''est vraiment bon.'),

    -- admin note le Gin Tonic
    ('AVS-00003', 'CKT-00002', 'CPT-00001', 4,
     'Simple et efficace',
     'Rien de compliqué, c''est exactement ça le charme du Gin Tonic. Bien équilibré entre l''amertume du tonic et le gin.'),

    -- romain note le Gin Tonic
    ('AVS-00004', 'CKT-00002', 'CPT-00002', 3,
     'Correct sans plus',
     'C''est un Gin Tonic classique, rien de surprenant. Ça manque un peu d''originalité à mon goût mais la recette est bonne.'),

    -- admin note le Tequila Sunrise
    ('AVS-00005', 'CKT-00003', 'CPT-00001', 5,
     'Magnifique à regarder et à boire',
     'L''effet dégradé est vraiment impressionnant quand on verse la grenadine doucement. Beau visuellement et délicieux.'),

    -- romain note le Sex on the Beach
    ('AVS-00006', 'CKT-00004', 'CPT-00002', 5,
     'Mon cocktail préféré !',
     'Je fais cette recette tout l''été, mes amis adorent. Le mélange cranberry et orange est parfait, pas trop sucré.'),

    -- admin note le Punch
    ('AVS-00007', 'CKT-00005', 'CPT-00001', 4,
     'Parfait pour les soirées',
     'Idéal quand on reçoit beaucoup de monde. La préparation à l''avance est un vrai plus. Je rajoute un peu de jus de citron vert.'),

    -- romain note le Punch
    ('AVS-00008', 'CKT-00005', 'CPT-00002', 4,
     'Festif et généreux',
     'On a testé pour un anniversaire, tout le monde a adoré. Les quantités sont bien pensées pour un grand groupe.');

/* ============================================================
   10. REPONSES
   ============================================================ */
INSERT INTO _reponse (idReponse, idAvis, idCompte, commentaire) VALUES
    -- Réponses sur AVS001 (admin note le Mojito → 5 étoiles)
    ('REP-00001', 'AVS-00001', 'CPT-00002',
     'Totalement d''accord, la menthe fraîche c''est obligatoire, avec de la menthe séchée c''est une catastrophe !'),
    ('REP-00002', 'AVS-00001', 'CPT-00001',
     'Exactement ! Et un bon rhum blanc fait aussi toute la différence, évite les rhums bas de gamme.'),
    ('REP-00003', 'AVS-00001', 'CPT-00002',
     'Tu recommandes quelle marque de rhum ? Je tourne toujours sur Bacardi mais je veux changer.'),

    -- Réponses sur AVS002 (romain note le Mojito → 4 étoiles)
    ('REP-00004', 'AVS-00002', 'CPT-00001',
     'Bonne idée pour le sucre, tu peux aussi remplacer le sirop par du sucre de canne directement pilonné avec la menthe !'),
    ('REP-00005', 'AVS-00002', 'CPT-00002',
     'Oui j''ai essayé avec du sucre de canne, c''est vraiment mieux, ça donne plus de texture.'),

    -- Réponses sur AVS004 (romain note le Gin Tonic → 3 étoiles)
    ('REP-00006', 'AVS-00004', 'CPT-00001',
     'Pour plus d''originalité tu peux ajouter quelques baies de genièvre ou un zeste de pamplemousse !'),
    ('REP-00007', 'AVS-00004', 'CPT-00002',
     'Bonne idée le pamplemousse, je vais tester ça ce week-end.'),
    ('REP-00008', 'AVS-00004', 'CPT-00001',
     'Le choix du gin change tout aussi - un gin plus floral donne une dimension complètement différente.'),

    -- Réponses sur AVS005 (admin note le Tequila Sunrise → 5 étoiles)
    ('REP-00009', 'AVS-00005', 'CPT-00002',
     'L''astuce c''est vraiment de verser la grenadine avec le dos d''une cuillère pour qu''elle coule doucement.'),
    ('REP-00010', 'AVS-00005', 'CPT-00001',
     'Oui ! Et de ne surtout pas mélanger ensuite, sinon l''effet dégradé disparaît complètement.'),

    -- Réponses sur AVS006 (romain note le Sex on the Beach → 5 étoiles)
    ('REP-00011', 'AVS-00006', 'CPT-00001',
     'Super recette en effet ! Pour varier tu peux remplacer le peach schnapps par du Malibu, ça donne une touche coco sympa.'),
    ('REP-00012', 'AVS-00006', 'CPT-00002',
     'Bonne idée le Malibu, je note ça pour la prochaine fois. Merci admin !'),

    -- Réponses sur AVS007 (admin note le Punch → 4 étoiles)
    ('REP-00013', 'AVS-00007', 'CPT-00002',
     'Le citron vert c''est une super idée, ça coupe un peu le sucré. J''ajoute aussi une pincée de cannelle personnellement.'),
    ('REP-00014', 'AVS-00007', 'CPT-00001',
     'La cannelle ?! Je n''aurais pas pensé à ça, je vais essayer au prochain repas de famille.'),
    ('REP-00015', 'AVS-00007', 'CPT-00002',
     'Oui et tu peux aussi ajouter quelques tranches de fruits frais directement dans le saladier, c''est joli visuellement.');

/* ============================================================
   11. FAVORIS
   ============================================================ */
INSERT INTO _favori (idCompte, idCocktail) VALUES
    ('CPT-00001', 'CKT-00001'),  -- admin aime le Mojito
    ('CPT-00001', 'CKT-00003'),  -- admin aime le Tequila Sunrise
    ('CPT-00002', 'CKT-00001'),  -- romain aime le Mojito
    ('CPT-00002', 'CKT-00004'),  -- romain aime le Sex on the Beach
    ('CPT-00002', 'CKT-00005');  -- romain aime le Punch

/* ============================================================
   12. SIGNALEMENTS
   ============================================================ */
INSERT INTO _signalement (idSignalement, idCompte, idCocktail, idAvis, motif) VALUES
    ('SIG-00001', 'CPT-00002', 'CKT-00001', NULL, 'spam'),         -- romain signale le Mojito (test)
    ('SIG-00002', 'CPT-00001', NULL, 'AVS-00004',  'hors_sujet');  -- admin signale l'avis AVS004

/* ============================================================
   VUES
   ============================================================ */

-- Vue : cocktails avec leurs étapes et ingrédients associés
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
