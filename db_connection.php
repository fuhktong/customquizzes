<?php
$host = 'localhost';
$dbname = 'quiz_maker';
$username = 'root';  
$password = '';      

try {
    $pdo = new PDO(
        "mysql:host=$host;dbname=$dbname;charset=utf8mb4",
        $username,
        $password,
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
        ]
    );

} catch(PDOException $e) {
    echo "Connection failed: " . $e->getMessage();
    die();
}
?>