<?php
require_once 'db_connection.php';

try {

    $stmt = $pdo->query('SELECT * FROM quizzes LIMIT 1');
    $quiz = $stmt->fetch();
    
    if ($quiz) {
        echo "Successfully connected and retrieved quiz with ID: " . $quiz['id'];
    } else {
        echo "Connected to database but no quizzes found";
    }
} catch(PDOException $e) {
    echo "Error: " . $e->getMessage();
}
?>