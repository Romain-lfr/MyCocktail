/* ============================================================ */
/*            Peuplement Base de données : PostgreSQL             */
/* ============================================================ */

SET SCHEMA 'MyCocktail';

DELETE FROM MyCocktail._dosage CASCADE; 
DELETE FROM MyCocktail._etape CASCADE;
DELETE FROM MyCocktail._cocktail CASCADE;
DELETE FROM MyCocktail._ingredients CASCADE;
DELETE FROM MyCocktail._ustensile CASCADE;
DELETE FROM MyCocktail._frigo CASCADE;
DELETE FROM MyCocktail._compte CASCADE;
DELETE FROM MyCocktail._etape_ustensile CASCADE;


-- 2. Compte (IDs en CO-XXXXX)
INSERT INTO MyCocktail._compte (idCompte, pseudo, mailCompte, mdpCompte, dateNaissance) VALUES  
    ('CO-00001', 'admin', 'admin@gmail.fr', 'password1234.', '1995-05-15'),
    ('CO-00002', 'Romain', 'romain@gmail.fr', 'password1234.', '2006-04-12'),
    ('CO-00003', 'Lise', 'lise@gmail.fr', 'password1234.', '1973-05-21');

-- 2. Frigo (IDs en FR-XXXX)
INSERT INTO MyCocktail._frigo (idFrigo, idCompte) VALUES  
    ('FR-0001', 'CO-00001'); 

-- 3. Ingrédients (IDs en IN-XXXX)
INSERT INTO MyCocktail._ingredients (idIngredients, nomIngredients, categorie) VALUES  
    ('IN-0001', 'Rhum Blanc', 'Alcool'),
    ('IN-0002', 'Menthe', 'Herbe'),
    ('IN-0003', 'Sucre en poudre', 'Divers'),
    ('IN-0004', 'Eau Gazeuse', 'Boisson'),
    ('IN-0005', 'Citron Vert', 'Fruit'),
    ('IN-0006', 'Jus d''orange', 'Jus'),
    ('IN-0007', 'Tequila', 'Alcool'),
    ('IN-0008', 'Sirop de grenadine', 'Sirop'),
    ('IN-0009', 'Glaçon', 'Divers');

-- 4. Ustensile (IDs en US-XXXX)
INSERT INTO MyCocktail._ustensile (idUstensile, nomUstensile) VALUES  
    ('US-0001', 'Pilon'),
    ('US-0002', 'Shaker'),
    ('US-0003', 'Doseur');

-- 5. Cocktail (IDs en CK-XXXX)
INSERT INTO MyCocktail._cocktail (idCocktail, nomCocktail, descriptionCocktail, difficulte, alcool, duree, prix, idCompte_Auteur) VALUES  
    ('CK-0001', 'Mojito', 'Le classique cubain rafraîchissant.', 2, TRUE, '3 min', 4.50, 'CO-00001'),
    ('CK-0002', 'Tequila Sunrise', 'Le classique cubain rafraîchissant.', 2, TRUE, '3 min', 4.50, 'CO-00001');

-- 6. Etape (IDs en E-XXXX)
INSERT INTO MyCocktail._etape (idEtape, descriptionEtape, numeroEtape, idCocktail) VALUES  
    ('ET-00001', 'Ajouter le sucre en poudre dans le verre, puis le jus d''1/2 citron vert.', 1, 'CK-0001'),
    ('ET-00002', 'Ecraser 4 feuilles de menthe, ajouter le rhum et compléter avec l''eau gazeuse.', 2, 'CK-0001'),
    ('ET-00003', 'Remuer et ajouter 1 branche de menthe.', 3, 'CK-0001'),
    
    ('ET-00004', 'Ajoutez les glaçons pour refroidir le récipient.', 1, 'CK-0002'),
    ('ET-00005', 'Versez la tequila directement sur les glaçons.', 2, 'CK-0002'),
    ('ET-00006', 'Ajoutez ensuite le jus d''orange doucement pour ne pas trop mélanger la tequila au jus.', 3, 'CK-0002'),
    ('ET-00007', 'Incorporez le sirop de grenadine en le versant lentement pour qu''il se dépose au fond du verre et crée l''effet '' sunrise ''.', 4, 'CK-0002'),
    ('ET-00008', 'Ne remuez pas le cocktail pour conserver le dégradé de couleurs. Servez immédiatement avec une paille ou une cuillère longue pour ceux qui préfèrent mélanger légèrement.', 5, 'CK-0002');
    

-- 7. Dosage et etape_ingredients
INSERT INTO MyCocktail._dosage (idEtape, idIngredients, quantite, unite) VALUES  
    ('ET-00001', 'IN-0003', 0.5 , 'cuillère'),
    ('ET-00001', 'IN-0005', 0.5, 'pièce'),
    ('ET-00002', 'IN-0002', 5, 'feuilles'),
    ('ET-00002', 'IN-0001', 5, 'cl'),
    ('ET-00002', 'IN-0004', NULL, NULL),
    ('ET-00003', 'IN-0002', 1, 'branches'),
    
    ('ET-00004', 'IN-0009', 4 , 'piéces'),
    ('ET-00005', 'IN-0007', 5, 'cl'),
    ('ET-00006', 'IN-0006', 15, 'cl'),
    ('ET-00007', 'IN-0008', 2, 'cuillère à soupes');
    
    
    
-- 8. Etape_ustensile
INSERT INTO MyCocktail._etape_ustensile (idEtape, idUstensile) VALUES  
    ('ET-00002', 'US-0001'),
    ('ET-00002', 'US-0003');
    

    
