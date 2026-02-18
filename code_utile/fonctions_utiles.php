<?php

require_once("constantes.php");
require_once("db_connection.php");

/*

*/
function generation_id($prefixeTable, $table)
{
    global $dbh;
    $count_query = "SELECT COUNT(*) FROM " . SCHEMA . "." . $table . ";";
    try {
        $count = $dbh->query($count_query)->fetchColumn(); // recupere le nombre d'id deja existant
    } catch (PDOException $e) {
        die("SQL Query in generation_id() failed : " . $e->getMessage());
    }
    $count++;

    switch (strlen((string)$count)) {
        case 1:
            return $prefixeTable . "-" . "000" . strval($count);
        case 2:
            return $prefixeTable . "-" . "00" . strval($count);
        case 3:
            return $prefixeTable . "-" . "0" . strval($count);
        case 4:
            return $prefixeTable . "-" . strval($count);
        default:
            throw new Exception("Génération d'id échouée");
    }
}
?>
