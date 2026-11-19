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

    -- Variables réutilisées pour les cocktails supplémentaires (section 7 bis)
    c  VARCHAR(13);
    e1 VARCHAR(13); e2 VARCHAR(13); e3 VARCHAR(13); e4 VARCHAR(13);
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

-- Alcools
PERFORM ajouter_ingredient('Whisky',                  'alcool');  -- ING-00022
PERFORM ajouter_ingredient('Bourbon',                 'alcool');  -- ING-00023
PERFORM ajouter_ingredient('Cognac',                  'alcool');  -- ING-00024
PERFORM ajouter_ingredient('Calvados',                'alcool');  -- ING-00025
PERFORM ajouter_ingredient('Cachaça',                 'alcool');  -- ING-00026
PERFORM ajouter_ingredient('Mezcal',                  'alcool');  -- ING-00027
PERFORM ajouter_ingredient('Pisco',                   'alcool');  -- ING-00028
PERFORM ajouter_ingredient('Rhum brun',               'alcool');  -- ING-00029
PERFORM ajouter_ingredient('Rhum agricole',           'alcool');  -- ING-00030
PERFORM ajouter_ingredient('Triple sec',              'alcool');  -- ING-00031
PERFORM ajouter_ingredient('Cointreau',               'alcool');  -- ING-00032
PERFORM ajouter_ingredient('Curaçao bleu',            'alcool');  -- ING-00033
PERFORM ajouter_ingredient('Vermouth rouge',          'alcool');  -- ING-00034
PERFORM ajouter_ingredient('Vermouth blanc sec',      'alcool');  -- ING-00035
PERFORM ajouter_ingredient('Campari',                 'alcool');  -- ING-00036
PERFORM ajouter_ingredient('Apérol',                  'alcool');  -- ING-00037
PERFORM ajouter_ingredient('Liqueur de café',         'alcool');  -- ING-00038
PERFORM ajouter_ingredient('Amaretto',                'alcool');  -- ING-00039
PERFORM ajouter_ingredient('Crème de cassis',         'alcool');  -- ING-00040
PERFORM ajouter_ingredient('Crème de mûre',           'alcool');  -- ING-00041
PERFORM ajouter_ingredient('Liqueur de coco',         'alcool');  -- ING-00042
PERFORM ajouter_ingredient('Liqueur de sureau',       'alcool');  -- ING-00043
PERFORM ajouter_ingredient('Chartreuse verte',        'alcool');  -- ING-00044
PERFORM ajouter_ingredient('Bénédictine',             'alcool');  -- ING-00045
PERFORM ajouter_ingredient('Marasquin',               'alcool');  -- ING-00046
PERFORM ajouter_ingredient('Absinthe',                'alcool');  -- ING-00047
PERFORM ajouter_ingredient('Pastis',                  'alcool');  -- ING-00048
PERFORM ajouter_ingredient('Prosecco',                'alcool');  -- ING-00049
PERFORM ajouter_ingredient('Champagne',               'alcool');  -- ING-00050
PERFORM ajouter_ingredient('Vin blanc',               'alcool');  -- ING-00051
PERFORM ajouter_ingredient('Vin rouge',               'alcool');  -- ING-00052
PERFORM ajouter_ingredient('Bière blonde',            'alcool');  -- ING-00053
PERFORM ajouter_ingredient('Cidre brut',              'alcool');  -- ING-00054
PERFORM ajouter_ingredient('Angostura bitters',       'alcool');  -- ING-00055
PERFORM ajouter_ingredient('Orange bitters',          'alcool');  -- ING-00056

-- Jus
PERFORM ajouter_ingredient('Jus de citron jaune',     'jus');     -- ING-00057
PERFORM ajouter_ingredient('Jus de pamplemousse',     'jus');     -- ING-00058
PERFORM ajouter_ingredient('Jus de tomate',           'jus');     -- ING-00059
PERFORM ajouter_ingredient('Jus de mangue',           'jus');     -- ING-00060
PERFORM ajouter_ingredient('Jus de pêche',            'jus');     -- ING-00061
PERFORM ajouter_ingredient('Jus de goyave',           'jus');     -- ING-00062
PERFORM ajouter_ingredient('Jus de raisin',           'jus');     -- ING-00063
PERFORM ajouter_ingredient('Jus de grenade',          'jus');     -- ING-00064
PERFORM ajouter_ingredient('Jus de fraise',           'jus');     -- ING-00065
PERFORM ajouter_ingredient('Jus de litchi',           'jus');     -- ING-00066
PERFORM ajouter_ingredient('Jus de concombre',        'jus');     -- ING-00067
PERFORM ajouter_ingredient('Jus de gingembre',        'jus');     -- ING-00068

-- Sirops
PERFORM ajouter_ingredient('Sirop d''orgeat',         'sirop');   -- ING-00069
PERFORM ajouter_ingredient('Sirop de miel',           'sirop');   -- ING-00070
PERFORM ajouter_ingredient('Sirop d''agave',          'sirop');   -- ING-00071
PERFORM ajouter_ingredient('Sirop d''érable',         'sirop');   -- ING-00072
PERFORM ajouter_ingredient('Sirop de vanille',        'sirop');   -- ING-00073
PERFORM ajouter_ingredient('Sirop de fraise',         'sirop');   -- ING-00074
PERFORM ajouter_ingredient('Sirop de framboise',      'sirop');   -- ING-00075
PERFORM ajouter_ingredient('Sirop de menthe',         'sirop');   -- ING-00076
PERFORM ajouter_ingredient('Sirop de violette',       'sirop');   -- ING-00077
PERFORM ajouter_ingredient('Sirop de sureau',         'sirop');   -- ING-00078
PERFORM ajouter_ingredient('Sirop de gingembre',      'sirop');   -- ING-00079
PERFORM ajouter_ingredient('Sirop de cannelle',       'sirop');   -- ING-00080
PERFORM ajouter_ingredient('Sirop de caramel',        'sirop');   -- ING-00081
PERFORM ajouter_ingredient('Sirop de noix de coco',   'sirop');   -- ING-00082

-- Sodas
PERFORM ajouter_ingredient('Cola',                    'soda');    -- ING-00083
PERFORM ajouter_ingredient('Limonade',                'soda');    -- ING-00084
PERFORM ajouter_ingredient('Ginger beer',             'soda');    -- ING-00085
PERFORM ajouter_ingredient('Ginger ale',              'soda');    -- ING-00086
PERFORM ajouter_ingredient('Soda au pamplemousse',    'soda');    -- ING-00087
PERFORM ajouter_ingredient('Soda citron-citron vert', 'soda');    -- ING-00088
PERFORM ajouter_ingredient('Bitter lemon',            'soda');    -- ING-00089

-- Eaux
PERFORM ajouter_ingredient('Eau plate',               'eau');     -- ING-00090
PERFORM ajouter_ingredient('Eau de coco',             'eau');     -- ING-00091
PERFORM ajouter_ingredient('Eau de fleur d''oranger', 'eau');     -- ING-00092
PERFORM ajouter_ingredient('Eau de rose',             'eau');     -- ING-00093

-- Fruits
PERFORM ajouter_ingredient('Citron vert',             'fruit');   -- ING-00094
PERFORM ajouter_ingredient('Citron jaune',            'fruit');   -- ING-00095
PERFORM ajouter_ingredient('Orange',                  'fruit');   -- ING-00096
PERFORM ajouter_ingredient('Pamplemousse',            'fruit');   -- ING-00097
PERFORM ajouter_ingredient('Fraises',                 'fruit');   -- ING-00098
PERFORM ajouter_ingredient('Framboises',              'fruit');   -- ING-00099
PERFORM ajouter_ingredient('Myrtilles',               'fruit');   -- ING-00100
PERFORM ajouter_ingredient('Mûres',                   'fruit');   -- ING-00101
PERFORM ajouter_ingredient('Ananas',                  'fruit');   -- ING-00102
PERFORM ajouter_ingredient('Mangue',                  'fruit');   -- ING-00103
PERFORM ajouter_ingredient('Pêche',                   'fruit');   -- ING-00104
PERFORM ajouter_ingredient('Pastèque',                'fruit');   -- ING-00105
PERFORM ajouter_ingredient('Melon',                   'fruit');   -- ING-00106
PERFORM ajouter_ingredient('Kiwi',                    'fruit');   -- ING-00107
PERFORM ajouter_ingredient('Banane',                  'fruit');   -- ING-00108
PERFORM ajouter_ingredient('Pomme verte',             'fruit');   -- ING-00109
PERFORM ajouter_ingredient('Cerises',                 'fruit');   -- ING-00110
PERFORM ajouter_ingredient('Cerise au marasquin',     'fruit');   -- ING-00111
PERFORM ajouter_ingredient('Grains de grenade',       'fruit');   -- ING-00112
PERFORM ajouter_ingredient('Concombre',               'fruit');   -- ING-00113
PERFORM ajouter_ingredient('Olive verte',             'fruit');   -- ING-00114

-- Autres
PERFORM ajouter_ingredient('Glace pilée',             'autre');   -- ING-00115
PERFORM ajouter_ingredient('Feuilles de basilic',     'autre');   -- ING-00116
PERFORM ajouter_ingredient('Romarin',                 'autre');   -- ING-00117
PERFORM ajouter_ingredient('Thym',                    'autre');   -- ING-00118
PERFORM ajouter_ingredient('Gingembre frais',         'autre');   -- ING-00119
PERFORM ajouter_ingredient('Bâton de cannelle',       'autre');   -- ING-00120
PERFORM ajouter_ingredient('Anis étoilé',             'autre');   -- ING-00121
PERFORM ajouter_ingredient('Gousse de vanille',       'autre');   -- ING-00122
PERFORM ajouter_ingredient('Piment',                  'autre');   -- ING-00123
PERFORM ajouter_ingredient('Poivre noir',             'autre');   -- ING-00124
PERFORM ajouter_ingredient('Sel',                     'autre');   -- ING-00125
PERFORM ajouter_ingredient('Sel au céleri',           'autre');   -- ING-00126
PERFORM ajouter_ingredient('Sauce Worcestershire',    'autre');   -- ING-00127
PERFORM ajouter_ingredient('Tabasco',                 'autre');   -- ING-00128
PERFORM ajouter_ingredient('Sucre en poudre',         'autre');   -- ING-00129
PERFORM ajouter_ingredient('Miel',                    'autre');   -- ING-00130
PERFORM ajouter_ingredient('Blanc d''œuf',            'autre');   -- ING-00131
PERFORM ajouter_ingredient('Aquafaba',                'autre');   -- ING-00132
PERFORM ajouter_ingredient('Crème liquide',           'autre');   -- ING-00133
PERFORM ajouter_ingredient('Lait',                    'autre');   -- ING-00134
PERFORM ajouter_ingredient('Lait de coco',            'autre');   -- ING-00135
PERFORM ajouter_ingredient('Crème de coco',           'autre');   -- ING-00136
PERFORM ajouter_ingredient('Café expresso',           'autre');   -- ING-00137
PERFORM ajouter_ingredient('Thé noir',                'autre');   -- ING-00138
PERFORM ajouter_ingredient('Thé vert matcha',         'autre');   -- ING-00139
PERFORM ajouter_ingredient('Chocolat en poudre',      'autre');   -- ING-00140
PERFORM ajouter_ingredient('Noix de muscade',         'autre');   -- ING-00141
PERFORM ajouter_ingredient('Zeste d''orange',         'autre');   -- ING-00142
PERFORM ajouter_ingredient('Zeste de citron',         'autre');   -- ING-00143
PERFORM ajouter_ingredient('Fleurs comestibles',      'autre');   -- ING-00144

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
PERFORM ajouter_ustensile('Verre old fashioned'); -- UST-00010
PERFORM ajouter_ustensile('Verre à mélange');     -- UST-00011
PERFORM ajouter_ustensile('Flûte à champagne');   -- UST-00012
PERFORM ajouter_ustensile('Verre à vin');         -- UST-00013
PERFORM ajouter_ustensile('Blender');             -- UST-00014
PERFORM ajouter_ustensile('Tasse en cuivre');     -- UST-00015
PERFORM ajouter_ustensile('Doseur');              -- UST-00016
PERFORM ajouter_ustensile('Zesteur');             -- UST-00017

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
   7 BIS. COCKTAILS SUPPLÉMENTAIRES (COK-00008 → COK-00039)
   Chaque bloc : cocktail, étapes, dosages, ustensiles.
   Variables c / e1..e4 réutilisées d'un bloc à l'autre.
   ============================================================ */

-- Margarita (COK-00008)
c  := (ajouter_cocktail('Margarita', 'Le cocktail mexicain par excellence : tequila, liqueur d''orange et citron vert, servi avec un bord de verre givré au sel.', 5, 'CPT-00001', 'Facile', TRUE, 'publié')).idCocktail;
e1 := (ajouter_etape_cocktail(c, 'Passer un quartier de citron vert sur le bord du verre puis le tremper dans le sel.')).idEtape;
e2 := (ajouter_etape_cocktail(c, 'Verser la tequila, le Cointreau et le jus de citron vert dans le shaker avec des glaçons, puis shaker énergiquement.')).idEtape;
e3 := (ajouter_etape_cocktail(c, 'Filtrer dans le verre givré.')).idEtape;
PERFORM ajouter_dosage(c, 'ING-00125', 1, 'pincée',  e1);
PERFORM ajouter_dosage(c, 'ING-00003', 5, 'cl',      e2);
PERFORM ajouter_dosage(c, 'ING-00032', 2, 'cl',      e2);
PERFORM ajouter_dosage(c, 'ING-00007', 3, 'cl',      e2);
PERFORM ajouter_dosage(c, 'ING-00015', 6, 'glaçons', e2);
PERFORM ajouter_ustensile_etape(e1, 'UST-00009'); PERFORM ajouter_ustensile_etape(e2, 'UST-00001'); PERFORM ajouter_ustensile_etape(e3, 'UST-00006');

-- Daiquiri (COK-00009)
c  := (ajouter_cocktail('Daiquiri', 'Un classique cubain d''une simplicité redoutable : rhum blanc, citron vert et sucre, parfaitement équilibrés.', 5, 'CPT-00001', 'Facile', TRUE, 'publié')).idCocktail;
e1 := (ajouter_etape_cocktail(c, 'Verser le rhum blanc, le jus de citron vert et le sirop de sucre dans le shaker.')).idEtape;
e2 := (ajouter_etape_cocktail(c, 'Ajouter les glaçons et shaker vigoureusement pendant 15 secondes.')).idEtape;
e3 := (ajouter_etape_cocktail(c, 'Filtrer dans un verre à cocktail bien frais.')).idEtape;
PERFORM ajouter_dosage(c, 'ING-00001', 6,   'cl',      e1);
PERFORM ajouter_dosage(c, 'ING-00007', 3,   'cl',      e1);
PERFORM ajouter_dosage(c, 'ING-00016', 1.5, 'cl',      e1);
PERFORM ajouter_dosage(c, 'ING-00015', 6,   'glaçons', e2);
PERFORM ajouter_ustensile_etape(e1, 'UST-00016'); PERFORM ajouter_ustensile_etape(e2, 'UST-00001'); PERFORM ajouter_ustensile_etape(e3, 'UST-00006'); PERFORM ajouter_ustensile_etape(e3, 'UST-00009');

-- Caïpirinha (COK-00010)
c  := (ajouter_cocktail('Caïpirinha', 'Le cocktail national brésilien : cachaça, citron vert pilé et sucre de canne sur glace pilée.', 5, 'CPT-00002', 'Facile', TRUE, 'publié')).idCocktail;
e1 := (ajouter_etape_cocktail(c, 'Couper le citron vert en quartiers et les placer dans le verre avec le sucre de canne.')).idEtape;
e2 := (ajouter_etape_cocktail(c, 'Piler fermement pour extraire le jus et dissoudre le sucre.')).idEtape;
e3 := (ajouter_etape_cocktail(c, 'Remplir de glace pilée, verser la cachaça et mélanger.')).idEtape;
PERFORM ajouter_dosage(c, 'ING-00094', 1,  'pièce',     e1);
PERFORM ajouter_dosage(c, 'ING-00017', 2,  'cuillères', e1);
PERFORM ajouter_dosage(c, 'ING-00115', 15, 'cl',        e3);
PERFORM ajouter_dosage(c, 'ING-00026', 6,  'cl',        e3);
PERFORM ajouter_ustensile_etape(e1, 'UST-00010'); PERFORM ajouter_ustensile_etape(e2, 'UST-00002'); PERFORM ajouter_ustensile_etape(e3, 'UST-00005');

-- Cosmopolitan (COK-00011)
c  := (ajouter_cocktail('Cosmopolitan', 'Élégant et acidulé, le Cosmopolitan associe vodka, liqueur d''orange, cranberry et citron vert.', 5, 'CPT-00001', 'Facile', TRUE, 'publié')).idCocktail;
e1 := (ajouter_etape_cocktail(c, 'Verser la vodka, le Cointreau, le jus de cranberry et le jus de citron vert dans le shaker.')).idEtape;
e2 := (ajouter_etape_cocktail(c, 'Ajouter des glaçons et shaker 10 secondes.')).idEtape;
e3 := (ajouter_etape_cocktail(c, 'Filtrer dans un verre à martini et décorer d''un zeste d''orange.')).idEtape;
PERFORM ajouter_dosage(c, 'ING-00004', 4,   'cl',      e1);
PERFORM ajouter_dosage(c, 'ING-00032', 1.5, 'cl',      e1);
PERFORM ajouter_dosage(c, 'ING-00009', 3,   'cl',      e1);
PERFORM ajouter_dosage(c, 'ING-00007', 1.5, 'cl',      e1);
PERFORM ajouter_dosage(c, 'ING-00015', 6,   'glaçons', e2);
PERFORM ajouter_dosage(c, 'ING-00142', 1,   'zeste',   e3);
PERFORM ajouter_ustensile_etape(e2, 'UST-00001'); PERFORM ajouter_ustensile_etape(e3, 'UST-00006'); PERFORM ajouter_ustensile_etape(e3, 'UST-00004'); PERFORM ajouter_ustensile_etape(e3, 'UST-00017');

-- Negroni (COK-00012)
c  := (ajouter_cocktail('Negroni', 'L''apéritif italien amer et parfumé : gin, Campari et vermouth rouge à parts égales.', 5, 'CPT-00001', 'Moyen', TRUE, 'publié')).idCocktail;
e1 := (ajouter_etape_cocktail(c, 'Verser le gin, le Campari et le vermouth rouge dans un verre à mélange rempli de glaçons.')).idEtape;
e2 := (ajouter_etape_cocktail(c, 'Remuer 30 secondes à la cuillère de bar.')).idEtape;
e3 := (ajouter_etape_cocktail(c, 'Filtrer sur un gros glaçon dans un verre old fashioned et parfumer d''un zeste d''orange.')).idEtape;
PERFORM ajouter_dosage(c, 'ING-00002', 3, 'cl',      e1);
PERFORM ajouter_dosage(c, 'ING-00036', 3, 'cl',      e1);
PERFORM ajouter_dosage(c, 'ING-00034', 3, 'cl',      e1);
PERFORM ajouter_dosage(c, 'ING-00015', 8, 'glaçons', e1);
PERFORM ajouter_dosage(c, 'ING-00142', 1, 'zeste',   e3);
PERFORM ajouter_ustensile_etape(e1, 'UST-00011'); PERFORM ajouter_ustensile_etape(e2, 'UST-00005'); PERFORM ajouter_ustensile_etape(e3, 'UST-00006'); PERFORM ajouter_ustensile_etape(e3, 'UST-00010');

-- Old Fashioned (COK-00013)
c  := (ajouter_cocktail('Old Fashioned', 'Le cocktail des puristes : bourbon, sucre et bitters, adouci par la dilution lente de la glace.', 7, 'CPT-00001', 'Moyen', TRUE, 'publié')).idCocktail;
e1 := (ajouter_etape_cocktail(c, 'Déposer le sucre de canne dans le verre et l''imbiber d''Angostura.')).idEtape;
e2 := (ajouter_etape_cocktail(c, 'Ajouter les glaçons et le bourbon, puis remuer longuement à la cuillère de bar.')).idEtape;
e3 := (ajouter_etape_cocktail(c, 'Exprimer un zeste d''orange au-dessus du verre et le déposer dedans.')).idEtape;
PERFORM ajouter_dosage(c, 'ING-00017', 1, 'cuillère', e1);
PERFORM ajouter_dosage(c, 'ING-00055', 3, 'traits',   e1);
PERFORM ajouter_dosage(c, 'ING-00023', 6, 'cl',       e2);
PERFORM ajouter_dosage(c, 'ING-00015', 3, 'glaçons',  e2);
PERFORM ajouter_dosage(c, 'ING-00142', 1, 'zeste',    e3);
PERFORM ajouter_ustensile_etape(e1, 'UST-00010'); PERFORM ajouter_ustensile_etape(e2, 'UST-00005'); PERFORM ajouter_ustensile_etape(e3, 'UST-00017');

-- Spritz (COK-00014)
c  := (ajouter_cocktail('Spritz', 'L''apéritif vénitien pétillant et orangé, parfait pour les terrasses d''été.', 3, 'CPT-00002', 'Facile', TRUE, 'publié')).idCocktail;
e1 := (ajouter_etape_cocktail(c, 'Remplir un grand verre à vin de glaçons.')).idEtape;
e2 := (ajouter_etape_cocktail(c, 'Verser le prosecco, puis l''Apérol et compléter avec l''eau gazeuse.')).idEtape;
e3 := (ajouter_etape_cocktail(c, 'Mélanger délicatement et décorer d''une tranche d''orange.')).idEtape;
PERFORM ajouter_dosage(c, 'ING-00015', 6, 'glaçons', e1);
PERFORM ajouter_dosage(c, 'ING-00049', 9, 'cl',      e2);
PERFORM ajouter_dosage(c, 'ING-00037', 6, 'cl',      e2);
PERFORM ajouter_dosage(c, 'ING-00011', 3, 'cl',      e2);
PERFORM ajouter_dosage(c, 'ING-00019', 1, 'tranche', e3);
PERFORM ajouter_ustensile_etape(e1, 'UST-00013'); PERFORM ajouter_ustensile_etape(e3, 'UST-00005');

-- Moscow Mule (COK-00015)
c  := (ajouter_cocktail('Moscow Mule', 'Vodka, ginger beer et citron vert servis dans la mythique tasse en cuivre. Frais et piquant.', 4, 'CPT-00001', 'Facile', TRUE, 'publié')).idCocktail;
e1 := (ajouter_etape_cocktail(c, 'Remplir la tasse en cuivre de glaçons.')).idEtape;
e2 := (ajouter_etape_cocktail(c, 'Verser la vodka et le jus de citron vert, puis compléter avec la ginger beer.')).idEtape;
e3 := (ajouter_etape_cocktail(c, 'Remuer brièvement et décorer d''une rondelle de citron vert.')).idEtape;
PERFORM ajouter_dosage(c, 'ING-00015', 6,   'glaçons',  e1);
PERFORM ajouter_dosage(c, 'ING-00004', 5,   'cl',       e2);
PERFORM ajouter_dosage(c, 'ING-00007', 1.5, 'cl',       e2);
PERFORM ajouter_dosage(c, 'ING-00085', 12,  'cl',       e2);
PERFORM ajouter_dosage(c, 'ING-00094', 1,   'rondelle', e3);
PERFORM ajouter_ustensile_etape(e1, 'UST-00015'); PERFORM ajouter_ustensile_etape(e3, 'UST-00005');

-- Piña Colada (COK-00016)
c  := (ajouter_cocktail('Piña Colada', 'Le cocktail tropical crémeux de Porto Rico : rhum, ananas et coco mixés sur glace.', 5, 'CPT-00001', 'Facile', TRUE, 'publié')).idCocktail;
e1 := (ajouter_etape_cocktail(c, 'Verser le rhum blanc, le jus d''ananas et la crème de coco dans le blender.')).idEtape;
e2 := (ajouter_etape_cocktail(c, 'Ajouter la glace pilée et mixer jusqu''à obtenir une texture lisse.')).idEtape;
e3 := (ajouter_etape_cocktail(c, 'Servir dans un verre à long drink et décorer d''un morceau d''ananas.')).idEtape;
PERFORM ajouter_dosage(c, 'ING-00001', 5,  'cl',     e1);
PERFORM ajouter_dosage(c, 'ING-00010', 10, 'cl',     e1);
PERFORM ajouter_dosage(c, 'ING-00136', 4,  'cl',     e1);
PERFORM ajouter_dosage(c, 'ING-00115', 15, 'cl',     e2);
PERFORM ajouter_dosage(c, 'ING-00102', 1,  'morceau', e3);
PERFORM ajouter_ustensile_etape(e1, 'UST-00014'); PERFORM ajouter_ustensile_etape(e3, 'UST-00003');

-- Whisky Sour (COK-00017)
c  := (ajouter_cocktail('Whisky Sour', 'Bourbon, citron et sucre, avec un blanc d''œuf pour une mousse soyeuse.', 8, 'CPT-00001', 'Moyen', TRUE, 'publié')).idCocktail;
e1 := (ajouter_etape_cocktail(c, 'Verser le bourbon, le jus de citron jaune, le sirop de sucre et le blanc d''œuf dans le shaker sans glace.')).idEtape;
e2 := (ajouter_etape_cocktail(c, 'Shaker à sec 10 secondes pour émulsionner, puis ajouter les glaçons et shaker à nouveau.')).idEtape;
e3 := (ajouter_etape_cocktail(c, 'Filtrer dans un verre old fashioned et déposer quelques gouttes d''Angostura sur la mousse.')).idEtape;
PERFORM ajouter_dosage(c, 'ING-00023', 5, 'cl',      e1);
PERFORM ajouter_dosage(c, 'ING-00057', 3, 'cl',      e1);
PERFORM ajouter_dosage(c, 'ING-00016', 2, 'cl',      e1);
PERFORM ajouter_dosage(c, 'ING-00131', 1, 'pièce',   e1);
PERFORM ajouter_dosage(c, 'ING-00015', 6, 'glaçons', e2);
PERFORM ajouter_dosage(c, 'ING-00055', 3, 'gouttes', e3);
PERFORM ajouter_ustensile_etape(e1, 'UST-00016'); PERFORM ajouter_ustensile_etape(e2, 'UST-00001'); PERFORM ajouter_ustensile_etape(e3, 'UST-00006'); PERFORM ajouter_ustensile_etape(e3, 'UST-00010');

-- Espresso Martini (COK-00018)
c  := (ajouter_cocktail('Espresso Martini', 'Vodka, liqueur de café et expresso fraîchement coulé : le cocktail qui réveille autant qu''il régale.', 7, 'CPT-00002', 'Moyen', TRUE, 'publié')).idCocktail;
e1 := (ajouter_etape_cocktail(c, 'Préparer un expresso et le laisser tiédir quelques instants.')).idEtape;
e2 := (ajouter_etape_cocktail(c, 'Verser la vodka, la liqueur de café, l''expresso et le sirop de sucre dans le shaker avec des glaçons.')).idEtape;
e3 := (ajouter_etape_cocktail(c, 'Shaker très énergiquement pour créer la mousse, puis filtrer dans un verre à martini.')).idEtape;
PERFORM ajouter_dosage(c, 'ING-00137', 3,   'cl',      e1);
PERFORM ajouter_dosage(c, 'ING-00004', 5,   'cl',      e2);
PERFORM ajouter_dosage(c, 'ING-00038', 2,   'cl',      e2);
PERFORM ajouter_dosage(c, 'ING-00016', 1,   'cl',      e2);
PERFORM ajouter_dosage(c, 'ING-00015', 6,   'glaçons', e2);
PERFORM ajouter_ustensile_etape(e2, 'UST-00001'); PERFORM ajouter_ustensile_etape(e3, 'UST-00006'); PERFORM ajouter_ustensile_etape(e3, 'UST-00004');

-- Kir Royal (COK-00019)
c  := (ajouter_cocktail('Kir Royal', 'L''apéritif festif à la française : crème de cassis rehaussée de champagne.', 2, 'CPT-00001', 'Facile', TRUE, 'publié')).idCocktail;
e1 := (ajouter_etape_cocktail(c, 'Verser la crème de cassis au fond d''une flûte.')).idEtape;
e2 := (ajouter_etape_cocktail(c, 'Compléter doucement avec le champagne bien frais.')).idEtape;
PERFORM ajouter_dosage(c, 'ING-00040', 1,  'cl', e1);
PERFORM ajouter_dosage(c, 'ING-00050', 12, 'cl', e2);
PERFORM ajouter_ustensile_etape(e1, 'UST-00012');

-- Bloody Mary (COK-00020)
c  := (ajouter_cocktail('Bloody Mary', 'Le cocktail salé et épicé du brunch : vodka, jus de tomate, citron et assaisonnements.', 8, 'CPT-00001', 'Moyen', TRUE, 'publié')).idCocktail;
e1 := (ajouter_etape_cocktail(c, 'Remplir un verre à long drink de glaçons.')).idEtape;
e2 := (ajouter_etape_cocktail(c, 'Verser la vodka, le jus de tomate et le jus de citron jaune.')).idEtape;
e3 := (ajouter_etape_cocktail(c, 'Assaisonner avec la sauce Worcestershire, le Tabasco, le sel au céleri et le poivre.')).idEtape;
e4 := (ajouter_etape_cocktail(c, 'Mélanger à la cuillère de bar et goûter pour ajuster l''assaisonnement.')).idEtape;
PERFORM ajouter_dosage(c, 'ING-00015', 6,  'glaçons', e1);
PERFORM ajouter_dosage(c, 'ING-00004', 4,  'cl',      e2);
PERFORM ajouter_dosage(c, 'ING-00059', 12, 'cl',      e2);
PERFORM ajouter_dosage(c, 'ING-00057', 1,  'cl',      e2);
PERFORM ajouter_dosage(c, 'ING-00127', 3,  'traits',  e3);
PERFORM ajouter_dosage(c, 'ING-00128', 2,  'gouttes', e3);
PERFORM ajouter_dosage(c, 'ING-00126', 1,  'pincée',  e3);
PERFORM ajouter_dosage(c, 'ING-00124', 1,  'pincée',  e3);
PERFORM ajouter_ustensile_etape(e1, 'UST-00003'); PERFORM ajouter_ustensile_etape(e4, 'UST-00005');

-- Mai Tai (COK-00021)
c  := (ajouter_cocktail('Mai Tai', 'Le grand classique tiki : deux rhums, liqueur d''orange, orgeat et citron vert sur glace pilée.', 10, 'CPT-00001', 'Difficile', TRUE, 'publié')).idCocktail;
e1 := (ajouter_etape_cocktail(c, 'Verser le rhum ambré, le triple sec, le sirop d''orgeat et le jus de citron vert dans le shaker.')).idEtape;
e2 := (ajouter_etape_cocktail(c, 'Ajouter quelques glaçons et shaker brièvement.')).idEtape;
e3 := (ajouter_etape_cocktail(c, 'Verser sur glace pilée dans un verre old fashioned.')).idEtape;
e4 := (ajouter_etape_cocktail(c, 'Faire flotter le rhum brun en surface et décorer d''un brin de menthe.')).idEtape;
PERFORM ajouter_dosage(c, 'ING-00005', 3,   'cl',       e1);
PERFORM ajouter_dosage(c, 'ING-00031', 1.5, 'cl',       e1);
PERFORM ajouter_dosage(c, 'ING-00069', 1.5, 'cl',       e1);
PERFORM ajouter_dosage(c, 'ING-00007', 2,   'cl',       e1);
PERFORM ajouter_dosage(c, 'ING-00015', 4,   'glaçons',  e2);
PERFORM ajouter_dosage(c, 'ING-00115', 15,  'cl',       e3);
PERFORM ajouter_dosage(c, 'ING-00029', 3,   'cl',       e4);
PERFORM ajouter_dosage(c, 'ING-00014', 1,   'brin',     e4);
PERFORM ajouter_ustensile_etape(e1, 'UST-00016'); PERFORM ajouter_ustensile_etape(e2, 'UST-00001'); PERFORM ajouter_ustensile_etape(e3, 'UST-00010'); PERFORM ajouter_ustensile_etape(e4, 'UST-00005');

-- Paloma (COK-00022)
c  := (ajouter_cocktail('Paloma', 'Le long drink préféré des Mexicains : tequila et soda au pamplemousse, avec une pointe de sel.', 4, 'CPT-00002', 'Facile', TRUE, 'publié')).idCocktail;
e1 := (ajouter_etape_cocktail(c, 'Givrer le bord du verre avec du sel puis le remplir de glaçons.')).idEtape;
e2 := (ajouter_etape_cocktail(c, 'Verser la tequila et le jus de citron vert, puis compléter avec le soda au pamplemousse.')).idEtape;
PERFORM ajouter_dosage(c, 'ING-00125', 1,  'pincée',  e1);
PERFORM ajouter_dosage(c, 'ING-00015', 6,  'glaçons', e1);
PERFORM ajouter_dosage(c, 'ING-00003', 5,  'cl',      e2);
PERFORM ajouter_dosage(c, 'ING-00007', 1,  'cl',      e2);
PERFORM ajouter_dosage(c, 'ING-00087', 12, 'cl',      e2);
PERFORM ajouter_ustensile_etape(e1, 'UST-00003'); PERFORM ajouter_ustensile_etape(e2, 'UST-00005');

-- Dark 'n' Stormy (COK-00023)
c  := (ajouter_cocktail('Dark ''n'' Stormy', 'Rhum brun flottant sur ginger beer : un orage de saveurs épicées venu des Bermudes.', 3, 'CPT-00001', 'Facile', TRUE, 'publié')).idCocktail;
e1 := (ajouter_etape_cocktail(c, 'Remplir un verre à long drink de glaçons et verser la ginger beer et le jus de citron vert.')).idEtape;
e2 := (ajouter_etape_cocktail(c, 'Verser doucement le rhum brun sur le dos d''une cuillère pour qu''il flotte en surface.')).idEtape;
PERFORM ajouter_dosage(c, 'ING-00015', 6,  'glaçons', e1);
PERFORM ajouter_dosage(c, 'ING-00085', 12, 'cl',      e1);
PERFORM ajouter_dosage(c, 'ING-00007', 1,  'cl',      e1);
PERFORM ajouter_dosage(c, 'ING-00029', 5,  'cl',      e2);
PERFORM ajouter_ustensile_etape(e1, 'UST-00003'); PERFORM ajouter_ustensile_etape(e2, 'UST-00005');

-- Blue Lagoon (COK-00024)
c  := (ajouter_cocktail('Blue Lagoon', 'Un cocktail d''un bleu éclatant à base de vodka, curaçao bleu et limonade.', 4, 'CPT-00002', 'Facile', TRUE, 'publié')).idCocktail;
e1 := (ajouter_etape_cocktail(c, 'Remplir un verre à long drink de glaçons.')).idEtape;
e2 := (ajouter_etape_cocktail(c, 'Verser la vodka et le curaçao bleu, puis compléter avec la limonade.')).idEtape;
e3 := (ajouter_etape_cocktail(c, 'Mélanger délicatement et décorer d''une cerise.')).idEtape;
PERFORM ajouter_dosage(c, 'ING-00015', 6,  'glaçons', e1);
PERFORM ajouter_dosage(c, 'ING-00004', 4,  'cl',      e2);
PERFORM ajouter_dosage(c, 'ING-00033', 2,  'cl',      e2);
PERFORM ajouter_dosage(c, 'ING-00084', 12, 'cl',      e2);
PERFORM ajouter_dosage(c, 'ING-00111', 1,  'pièce',   e3);
PERFORM ajouter_ustensile_etape(e1, 'UST-00003'); PERFORM ajouter_ustensile_etape(e3, 'UST-00005');

-- Hugo (COK-00025)
c  := (ajouter_cocktail('Hugo', 'Le cousin floral du Spritz : liqueur de sureau, prosecco, menthe et citron vert.', 4, 'CPT-00001', 'Facile', TRUE, 'publié')).idCocktail;
e1 := (ajouter_etape_cocktail(c, 'Froisser légèrement les feuilles de menthe et les déposer dans un verre à vin avec le citron vert.')).idEtape;
e2 := (ajouter_etape_cocktail(c, 'Ajouter les glaçons et la liqueur de sureau.')).idEtape;
e3 := (ajouter_etape_cocktail(c, 'Compléter avec le prosecco et un trait d''eau gazeuse, puis remuer doucement.')).idEtape;
PERFORM ajouter_dosage(c, 'ING-00014', 6,  'feuilles', e1);
PERFORM ajouter_dosage(c, 'ING-00094', 2,  'rondelles', e1);
PERFORM ajouter_dosage(c, 'ING-00015', 6,  'glaçons',  e2);
PERFORM ajouter_dosage(c, 'ING-00043', 2,  'cl',       e2);
PERFORM ajouter_dosage(c, 'ING-00049', 10, 'cl',       e3);
PERFORM ajouter_dosage(c, 'ING-00011', 3,  'cl',       e3);
PERFORM ajouter_ustensile_etape(e1, 'UST-00013'); PERFORM ajouter_ustensile_etape(e3, 'UST-00005');

-- Sangria (COK-00026)
c  := (ajouter_cocktail('Sangria', 'La boisson espagnole conviviale à partager : vin rouge, cognac, fruits frais et cannelle.', 20, 'CPT-00002', 'Moyen', TRUE, 'publié')).idCocktail;
e1 := (ajouter_etape_cocktail(c, 'Couper l''orange et la pomme verte en morceaux et les placer dans la grande casserole avec le sucre et la cannelle.')).idEtape;
e2 := (ajouter_etape_cocktail(c, 'Verser le vin rouge, le cognac et le jus d''orange, puis mélanger.')).idEtape;
e3 := (ajouter_etape_cocktail(c, 'Laisser macérer au réfrigérateur au moins 2 heures.')).idEtape;
e4 := (ajouter_etape_cocktail(c, 'Servir dans un verre à punch avec des glaçons et quelques fruits.')).idEtape;
PERFORM ajouter_dosage(c, 'ING-00096', 1,  'pièce',    e1);
PERFORM ajouter_dosage(c, 'ING-00109', 1,  'pièce',    e1);
PERFORM ajouter_dosage(c, 'ING-00129', 4,  'cuillères', e1);
PERFORM ajouter_dosage(c, 'ING-00120', 1,  'bâton',    e1);
PERFORM ajouter_dosage(c, 'ING-00052', 75, 'cl',       e2);
PERFORM ajouter_dosage(c, 'ING-00024', 5,  'cl',       e2);
PERFORM ajouter_dosage(c, 'ING-00008', 20, 'cl',       e2);
PERFORM ajouter_dosage(c, 'ING-00015', 15, 'glaçons',  e4);
PERFORM ajouter_ustensile_etape(e1, 'UST-00008'); PERFORM ajouter_ustensile_etape(e2, 'UST-00005'); PERFORM ajouter_ustensile_etape(e4, 'UST-00007');

-- French 75 (COK-00027)
c  := (ajouter_cocktail('French 75', 'Gin, citron et sucre, allongés au champagne : pétillant et sophistiqué.', 6, 'CPT-00001', 'Moyen', TRUE, 'publié')).idCocktail;
e1 := (ajouter_etape_cocktail(c, 'Verser le gin, le jus de citron jaune et le sirop de sucre dans le shaker avec des glaçons.')).idEtape;
e2 := (ajouter_etape_cocktail(c, 'Shaker puis filtrer dans une flûte.')).idEtape;
e3 := (ajouter_etape_cocktail(c, 'Compléter avec le champagne et décorer d''un zeste de citron.')).idEtape;
PERFORM ajouter_dosage(c, 'ING-00002', 3,   'cl',      e1);
PERFORM ajouter_dosage(c, 'ING-00057', 1.5, 'cl',      e1);
PERFORM ajouter_dosage(c, 'ING-00016', 1.5, 'cl',      e1);
PERFORM ajouter_dosage(c, 'ING-00015', 6,   'glaçons', e1);
PERFORM ajouter_dosage(c, 'ING-00050', 6,   'cl',      e3);
PERFORM ajouter_dosage(c, 'ING-00143', 1,   'zeste',   e3);
PERFORM ajouter_ustensile_etape(e1, 'UST-00001'); PERFORM ajouter_ustensile_etape(e2, 'UST-00006'); PERFORM ajouter_ustensile_etape(e2, 'UST-00012'); PERFORM ajouter_ustensile_etape(e3, 'UST-00017');

-- Amaretto Sour (COK-00028)
c  := (ajouter_cocktail('Amaretto Sour', 'La douceur de l''amande équilibrée par le citron, avec une mousse onctueuse.', 7, 'CPT-00002', 'Moyen', TRUE, 'publié')).idCocktail;
e1 := (ajouter_etape_cocktail(c, 'Verser l''amaretto, le jus de citron jaune, le sirop de sucre et le blanc d''œuf dans le shaker.')).idEtape;
e2 := (ajouter_etape_cocktail(c, 'Shaker à sec, puis ajouter les glaçons et shaker de nouveau.')).idEtape;
e3 := (ajouter_etape_cocktail(c, 'Filtrer dans un verre old fashioned et décorer d''une cerise au marasquin.')).idEtape;
PERFORM ajouter_dosage(c, 'ING-00039', 5,   'cl',      e1);
PERFORM ajouter_dosage(c, 'ING-00057', 3,   'cl',      e1);
PERFORM ajouter_dosage(c, 'ING-00016', 1,   'cl',      e1);
PERFORM ajouter_dosage(c, 'ING-00131', 1,   'pièce',   e1);
PERFORM ajouter_dosage(c, 'ING-00015', 6,   'glaçons', e2);
PERFORM ajouter_dosage(c, 'ING-00111', 1,   'pièce',   e3);
PERFORM ajouter_ustensile_etape(e2, 'UST-00001'); PERFORM ajouter_ustensile_etape(e3, 'UST-00006'); PERFORM ajouter_ustensile_etape(e3, 'UST-00010');

-- Dry Martini (COK-00029)
c  := (ajouter_cocktail('Dry Martini', 'L''icône du cocktail : gin et vermouth sec remués sur glace, servis avec une olive.', 5, 'CPT-00001', 'Difficile', TRUE, 'publié')).idCocktail;
e1 := (ajouter_etape_cocktail(c, 'Remplir le verre à mélange de glaçons, verser le vermouth sec, remuer puis jeter l''excédent.')).idEtape;
e2 := (ajouter_etape_cocktail(c, 'Ajouter le gin et remuer 30 secondes à la cuillère de bar.')).idEtape;
e3 := (ajouter_etape_cocktail(c, 'Filtrer dans un verre à martini glacé et ajouter une olive verte.')).idEtape;
PERFORM ajouter_dosage(c, 'ING-00015', 8,   'glaçons', e1);
PERFORM ajouter_dosage(c, 'ING-00035', 1,   'cl',      e1);
PERFORM ajouter_dosage(c, 'ING-00002', 6,   'cl',      e2);
PERFORM ajouter_dosage(c, 'ING-00114', 1,   'pièce',   e3);
PERFORM ajouter_ustensile_etape(e1, 'UST-00011'); PERFORM ajouter_ustensile_etape(e2, 'UST-00005'); PERFORM ajouter_ustensile_etape(e3, 'UST-00006'); PERFORM ajouter_ustensile_etape(e3, 'UST-00004');

-- Ti' Punch (COK-00030)
c  := (ajouter_cocktail('Ti'' Punch', 'Le rituel antillais : rhum agricole, citron vert et sucre de canne, à doser selon son goût.', 3, 'CPT-00002', 'Facile', TRUE, 'publié')).idCocktail;
e1 := (ajouter_etape_cocktail(c, 'Presser un quartier de citron vert dans le verre et ajouter le sucre de canne.')).idEtape;
e2 := (ajouter_etape_cocktail(c, 'Verser le rhum agricole et remuer jusqu''à dissolution du sucre.')).idEtape;
PERFORM ajouter_dosage(c, 'ING-00094', 1, 'quartier', e1);
PERFORM ajouter_dosage(c, 'ING-00017', 1, 'cuillère', e1);
PERFORM ajouter_dosage(c, 'ING-00030', 5, 'cl',       e2);
PERFORM ajouter_ustensile_etape(e1, 'UST-00010'); PERFORM ajouter_ustensile_etape(e2, 'UST-00005');

-- Basil Smash (COK-00031) — privé
c  := (ajouter_cocktail('Basil Smash', 'Ma version du Gin Basil Smash : gin, basilic frais pilé et citron, d''un vert éclatant.', 6, 'CPT-00002', 'Moyen', TRUE, 'privé')).idCocktail;
e1 := (ajouter_etape_cocktail(c, 'Piler les feuilles de basilic avec le jus de citron jaune et le sirop de sucre dans le shaker.')).idEtape;
e2 := (ajouter_etape_cocktail(c, 'Ajouter le gin et les glaçons puis shaker énergiquement.')).idEtape;
e3 := (ajouter_etape_cocktail(c, 'Filtrer finement dans un verre old fashioned rempli de glace.')).idEtape;
PERFORM ajouter_dosage(c, 'ING-00116', 10,  'feuilles', e1);
PERFORM ajouter_dosage(c, 'ING-00057', 2.5, 'cl',       e1);
PERFORM ajouter_dosage(c, 'ING-00016', 2,   'cl',       e1);
PERFORM ajouter_dosage(c, 'ING-00002', 6,   'cl',       e2);
PERFORM ajouter_dosage(c, 'ING-00015', 8,   'glaçons',  e2);
PERFORM ajouter_ustensile_etape(e1, 'UST-00002'); PERFORM ajouter_ustensile_etape(e2, 'UST-00001'); PERFORM ajouter_ustensile_etape(e3, 'UST-00006'); PERFORM ajouter_ustensile_etape(e3, 'UST-00010');

-- Shirley Temple (COK-00032) — sans alcool
c  := (ajouter_cocktail('Shirley Temple', 'Le mocktail rétro et pétillant : ginger ale et grenadine, couronné d''une cerise.', 3, 'CPT-00001', 'Facile', FALSE, 'publié')).idCocktail;
e1 := (ajouter_etape_cocktail(c, 'Remplir un verre à long drink de glaçons et verser la ginger ale.')).idEtape;
e2 := (ajouter_etape_cocktail(c, 'Ajouter la grenadine, qui va glisser au fond du verre, et décorer d''une cerise au marasquin.')).idEtape;
PERFORM ajouter_dosage(c, 'ING-00015', 6,  'glaçons', e1);
PERFORM ajouter_dosage(c, 'ING-00086', 20, 'cl',      e1);
PERFORM ajouter_dosage(c, 'ING-00013', 2,  'cl',      e2);
PERFORM ajouter_dosage(c, 'ING-00111', 1,  'pièce',   e2);
PERFORM ajouter_ustensile_etape(e1, 'UST-00003');

-- Virgin Colada (COK-00033) — sans alcool
c  := (ajouter_cocktail('Virgin Colada', 'Toute la gourmandise de la Piña Colada, sans une goutte d''alcool.', 5, 'CPT-00001', 'Facile', FALSE, 'publié')).idCocktail;
e1 := (ajouter_etape_cocktail(c, 'Verser le jus d''ananas, la crème de coco et le jus de citron vert dans le blender.')).idEtape;
e2 := (ajouter_etape_cocktail(c, 'Ajouter la glace pilée et mixer jusqu''à obtenir une texture onctueuse.')).idEtape;
e3 := (ajouter_etape_cocktail(c, 'Servir dans un verre à long drink et décorer d''un morceau d''ananas.')).idEtape;
PERFORM ajouter_dosage(c, 'ING-00010', 15, 'cl',      e1);
PERFORM ajouter_dosage(c, 'ING-00136', 5,  'cl',      e1);
PERFORM ajouter_dosage(c, 'ING-00007', 1,  'cl',      e1);
PERFORM ajouter_dosage(c, 'ING-00115', 15, 'cl',      e2);
PERFORM ajouter_dosage(c, 'ING-00102', 1,  'morceau', e3);
PERFORM ajouter_ustensile_etape(e1, 'UST-00014'); PERFORM ajouter_ustensile_etape(e3, 'UST-00003');

-- Limonade Fraise Basilic (COK-00034) — sans alcool
c  := (ajouter_cocktail('Limonade Fraise Basilic', 'Une limonade maison fruitée et herbacée, parfaite pour les après-midi d''été.', 8, 'CPT-00002', 'Facile', FALSE, 'publié')).idCocktail;
e1 := (ajouter_etape_cocktail(c, 'Piler les fraises et les feuilles de basilic avec le sirop de sucre au fond du verre.')).idEtape;
e2 := (ajouter_etape_cocktail(c, 'Ajouter le jus de citron jaune et remplir de glaçons.')).idEtape;
e3 := (ajouter_etape_cocktail(c, 'Compléter avec l''eau gazeuse et mélanger.')).idEtape;
PERFORM ajouter_dosage(c, 'ING-00098', 4,  'pièces',   e1);
PERFORM ajouter_dosage(c, 'ING-00116', 4,  'feuilles', e1);
PERFORM ajouter_dosage(c, 'ING-00016', 2,  'cl',       e1);
PERFORM ajouter_dosage(c, 'ING-00057', 3,  'cl',       e2);
PERFORM ajouter_dosage(c, 'ING-00015', 6,  'glaçons',  e2);
PERFORM ajouter_dosage(c, 'ING-00011', 12, 'cl',       e3);
PERFORM ajouter_ustensile_etape(e1, 'UST-00002'); PERFORM ajouter_ustensile_etape(e1, 'UST-00003'); PERFORM ajouter_ustensile_etape(e3, 'UST-00005');

-- Virgin Mule (COK-00035) — sans alcool
c  := (ajouter_cocktail('Virgin Mule', 'Ginger beer, citron vert, menthe et concombre : la fraîcheur piquante du Moscow Mule sans alcool.', 4, 'CPT-00001', 'Facile', FALSE, 'publié')).idCocktail;
e1 := (ajouter_etape_cocktail(c, 'Déposer les rondelles de concombre et les feuilles de menthe dans la tasse en cuivre et les presser légèrement.')).idEtape;
e2 := (ajouter_etape_cocktail(c, 'Remplir de glaçons, ajouter le jus de citron vert et compléter avec la ginger beer.')).idEtape;
PERFORM ajouter_dosage(c, 'ING-00113', 3,  'rondelles', e1);
PERFORM ajouter_dosage(c, 'ING-00014', 5,  'feuilles',  e1);
PERFORM ajouter_dosage(c, 'ING-00015', 6,  'glaçons',   e2);
PERFORM ajouter_dosage(c, 'ING-00007', 2,  'cl',        e2);
PERFORM ajouter_dosage(c, 'ING-00085', 15, 'cl',        e2);
PERFORM ajouter_ustensile_etape(e1, 'UST-00015'); PERFORM ajouter_ustensile_etape(e1, 'UST-00002'); PERFORM ajouter_ustensile_etape(e2, 'UST-00005');

-- Smoothie Mangue Coco (COK-00036) — sans alcool
c  := (ajouter_cocktail('Smoothie Mangue Coco', 'Un mocktail velouté et exotique : mangue, lait de coco et une touche de citron vert.', 6, 'CPT-00002', 'Facile', FALSE, 'publié')).idCocktail;
e1 := (ajouter_etape_cocktail(c, 'Éplucher la mangue et la couper en morceaux.')).idEtape;
e2 := (ajouter_etape_cocktail(c, 'Mixer la mangue avec le lait de coco, le jus de citron vert, le sirop d''agave et la glace pilée.')).idEtape;
e3 := (ajouter_etape_cocktail(c, 'Verser dans un verre à long drink et servir aussitôt.')).idEtape;
PERFORM ajouter_dosage(c, 'ING-00103', 1,  'pièce', e1);
PERFORM ajouter_dosage(c, 'ING-00135', 10, 'cl',    e2);
PERFORM ajouter_dosage(c, 'ING-00007', 1,  'cl',    e2);
PERFORM ajouter_dosage(c, 'ING-00071', 1,  'cl',    e2);
PERFORM ajouter_dosage(c, 'ING-00115', 10, 'cl',    e2);
PERFORM ajouter_ustensile_etape(e2, 'UST-00014'); PERFORM ajouter_ustensile_etape(e3, 'UST-00003');

-- Thé Glacé Pêche (COK-00037) — sans alcool
c  := (ajouter_cocktail('Thé Glacé Pêche', 'Un thé noir infusé puis refroidi, adouci au miel et parfumé à la pêche.', 15, 'CPT-00001', 'Facile', FALSE, 'publié')).idCocktail;
e1 := (ajouter_etape_cocktail(c, 'Infuser le thé noir 4 minutes puis le laisser refroidir complètement.')).idEtape;
e2 := (ajouter_etape_cocktail(c, 'Verser le thé, le jus de pêche, le sirop de miel et le jus de citron jaune dans un verre rempli de glaçons.')).idEtape;
e3 := (ajouter_etape_cocktail(c, 'Mélanger et décorer de tranches de pêche.')).idEtape;
PERFORM ajouter_dosage(c, 'ING-00138', 12, 'cl',       e1);
PERFORM ajouter_dosage(c, 'ING-00061', 6,  'cl',       e2);
PERFORM ajouter_dosage(c, 'ING-00070', 1.5,'cl',       e2);
PERFORM ajouter_dosage(c, 'ING-00057', 1,  'cl',       e2);
PERFORM ajouter_dosage(c, 'ING-00015', 6,  'glaçons',  e2);
PERFORM ajouter_dosage(c, 'ING-00104', 2,  'tranches', e3);
PERFORM ajouter_ustensile_etape(e2, 'UST-00003'); PERFORM ajouter_ustensile_etape(e3, 'UST-00005');

-- Pastèque Menthe Cooler (COK-00038) — sans alcool
c  := (ajouter_cocktail('Pastèque Menthe Cooler', 'Pastèque mixée, menthe et citron vert, allongés d''eau gazeuse : la quintessence de l''été.', 7, 'CPT-00002', 'Facile', FALSE, 'publié')).idCocktail;
e1 := (ajouter_etape_cocktail(c, 'Mixer les morceaux de pastèque avec le jus de citron vert et le sirop d''agave.')).idEtape;
e2 := (ajouter_etape_cocktail(c, 'Piler légèrement la menthe au fond d''un verre à long drink et ajouter les glaçons.')).idEtape;
e3 := (ajouter_etape_cocktail(c, 'Verser le jus de pastèque filtré et compléter avec l''eau gazeuse.')).idEtape;
PERFORM ajouter_dosage(c, 'ING-00105', 200, 'g',        e1);
PERFORM ajouter_dosage(c, 'ING-00007', 2,   'cl',       e1);
PERFORM ajouter_dosage(c, 'ING-00071', 1,   'cl',       e1);
PERFORM ajouter_dosage(c, 'ING-00014', 6,   'feuilles', e2);
PERFORM ajouter_dosage(c, 'ING-00015', 6,   'glaçons',  e2);
PERFORM ajouter_dosage(c, 'ING-00011', 6,   'cl',       e3);
PERFORM ajouter_ustensile_etape(e1, 'UST-00014'); PERFORM ajouter_ustensile_etape(e2, 'UST-00002'); PERFORM ajouter_ustensile_etape(e2, 'UST-00003'); PERFORM ajouter_ustensile_etape(e3, 'UST-00006');

-- Fleur d'Oranger Fizz (COK-00039) — sans alcool, brouillon
c  := (ajouter_cocktail('Fleur d''Oranger Fizz', 'Brouillon : agrumes et fleur d''oranger, à ajuster.', 4, 'CPT-00002', 'Facile', FALSE, 'brouillon')).idCocktail;
e1 := (ajouter_etape_cocktail(c, 'Verser le jus d''orange, le jus de pamplemousse et l''eau de fleur d''oranger sur glaçons.')).idEtape;
e2 := (ajouter_etape_cocktail(c, 'Compléter avec l''eau gazeuse et mélanger.')).idEtape;
PERFORM ajouter_dosage(c, 'ING-00008', 8, 'cl',      e1);
PERFORM ajouter_dosage(c, 'ING-00058', 4, 'cl',      e1);
PERFORM ajouter_dosage(c, 'ING-00092', 2, 'traits',  e1);
PERFORM ajouter_dosage(c, 'ING-00015', 6, 'glaçons', e1);
PERFORM ajouter_dosage(c, 'ING-00011', 8, 'cl',      e2);
PERFORM ajouter_ustensile_etape(e1, 'UST-00003'); PERFORM ajouter_ustensile_etape(e2, 'UST-00005');

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

-- Avis sur les cocktails supplémentaires (jamais par l'auteur ; CPT-00003 est mineur → sans alcool uniquement)
PERFORM ajouter_avis('COK-00008', 'CPT-00002', 5, 'La meilleure Margarita', 'Le bord salé fait toute la différence, recette impeccable.');
PERFORM ajouter_avis('COK-00012', 'CPT-00002', 4, 'Amer mais addictif', 'Un peu fort pour moi au début, mais on y prend vite goût.');
PERFORM ajouter_avis('COK-00018', 'CPT-00001', 5, 'Mousse parfaite', 'En shakant bien fort la mousse tient jusqu''à la dernière gorgée.');
PERFORM ajouter_avis('COK-00026', 'CPT-00001', 4, 'Très conviviale', 'La macération de 2 heures est indispensable, ne pas la sauter.');
PERFORM ajouter_avis('COK-00032', 'CPT-00003', 5, 'Trop bon !', 'Super facile à faire et tout le monde a adoré à mon anniversaire.');
PERFORM ajouter_avis('COK-00033', 'CPT-00002', 4, 'Gourmand', 'Très bon, j''ajoute parfois un peu de lait de coco pour plus de douceur.');
PERFORM ajouter_avis('COK-00036', 'CPT-00003', 4, 'Rafraîchissant', 'Un vrai dessert en verre, je le refais souvent.');
PERFORM ajouter_avis('COK-00037', 'CPT-00003', 5, 'Mieux qu''en bouteille', 'Bien meilleur que le thé glacé du commerce et moins sucré.');

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

PERFORM ajouter_image_cocktail('COK-00001', '/public/images/mojito.jpg', 'Mojito');
PERFORM ajouter_image_cocktail('COK-00002', '/public/images/gin_tonic.jpg', 'Gin Tonic');
PERFORM ajouter_image_cocktail('COK-00003', '/public/images/tequila_sunrise.webp', 'Tequila Sunrise');
PERFORM ajouter_image_cocktail('COK-00004', '/public/images/sex_on_the_beach.webp', 'Sex on the Beach');
PERFORM ajouter_image_cocktail('COK-00005', '/public/images/punch.webp', 'Punch');
PERFORM ajouter_image_cocktail('COK-00006', '/public/images/virgin_mojito.webp', 'Virgin Mojito');
PERFORM ajouter_image_cocktail('COK-00007', '/public/images/apple_rose.jpg', 'Apple Rose');

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
