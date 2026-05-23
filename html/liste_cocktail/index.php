<?php

    require_once '../../code_utile/fonctions_utiles.php';

    function getCocktail($dbh) {
        $cocktails = "
            SELECT a.*, i.urlImage 
            FROM MyCocktail._cocktail a
            LEFT JOIN MyCocktail._image_cocktail ia ON a.idCocktail = ia.idCocktail
            LEFT JOIN MyCocktail._image i ON ia.urlImage = i.urlImage
            WHERE a.enLigne = true 
            ORDER BY a.noteCocktail DESC, a.idCocktail DESC
            LIMIT 3";
        
        $stmt = $dbh->prepare($cocktails);
        $stmt->execute();
        
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

?>

<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>TEST</title>
    </head>
    <body>
        <?php 
            
        
        ?>
    </body>
</html>