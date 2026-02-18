<?php
$driver = "pgsql";
$dbname = "breizh_info";
$host = "localhost";
$port = "5432";
$user = "postgres";
$pass = "2006";


try {
    $dbh = new PDO("$driver:host=$host;port=$port;dbname=$dbname", $user, $pass);
    $dbh->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    echo "Erreur de connexion : " . $e->getMessage();
}
?>