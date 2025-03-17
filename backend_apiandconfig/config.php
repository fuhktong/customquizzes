<?php
// config.php - production build

// define('DB_SERVER', 'localhost');
// define('DB_USERNAME', 'u767733958_customquizzes1');
// define('DB_PASSWORD', '>W7@O$5Z~d');
// define('DB_NAME', 'u767733958_customquizzes');


// config.php - development build

define('DB_SERVER', 'localhost');
define('DB_USERNAME', 'root');
define('DB_PASSWORD', '');
define('DB_NAME', 'customquizzes');

// Create connection
$conn = new mysqli(DB_SERVER, DB_USERNAME, DB_PASSWORD);

// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// Create database if it doesn't exist
$sql = "CREATE DATABASE IF NOT EXISTS " . DB_NAME;
if ($conn->query($sql) === FALSE) {
    die("Error creating database: " . $conn->error);
}

// Select the database
$conn->select_db(DB_NAME);

// Create users table if it doesn't exist
$sql = "CREATE TABLE IF NOT EXISTS users (
    id INT(11) AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    auth_token VARCHAR(255) NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)";

if ($conn->query($sql) === FALSE) {
    die("Error creating users table: " . $conn->error);
}

// Make sure auth_token column exists in users table
$sql = "SHOW COLUMNS FROM users LIKE 'auth_token'";
$result = $conn->query($sql);
if ($result->num_rows == 0) {
    $sql = "ALTER TABLE users ADD COLUMN auth_token VARCHAR(255)";
    if ($conn->query($sql) === FALSE) {
        die("Error updating users table: " . $conn->error);
    }
}

// Create quizzes table if it doesn't exist
$sql = "CREATE TABLE IF NOT EXISTS quizzes (
    id INT(11) AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    created_by INT(11) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id)
)";

if ($conn->query($sql) === FALSE) {
    die("Error creating quizzes table: " . $conn->error);
}

// Create quiz_questions table if it doesn't exist
$sql = "CREATE TABLE IF NOT EXISTS quiz_questions (
    id INT(11) AUTO_INCREMENT PRIMARY KEY,
    quiz_id INT(11) NOT NULL,
    question TEXT NOT NULL,
    FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE
)";

if ($conn->query($sql) === FALSE) {
    die("Error creating quiz_questions table: " . $conn->error);
}

// Create quiz_answers table if it doesn't exist
$sql = "CREATE TABLE IF NOT EXISTS quiz_answers (
    id INT(11) AUTO_INCREMENT PRIMARY KEY,
    question_id INT(11) NOT NULL,
    answer_text TEXT NOT NULL,
    is_correct BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (question_id) REFERENCES quiz_questions(id) ON DELETE CASCADE
)";

if ($conn->query($sql) === FALSE) {
    die("Error creating quiz_answers table: " . $conn->error);
}

// Create user_quiz_results table if it doesn't exist
$sql = "CREATE TABLE IF NOT EXISTS user_quiz_results (
    id INT(11) AUTO_INCREMENT PRIMARY KEY,
    user_id INT(11) NOT NULL,
    quiz_id INT(11) NOT NULL,
    score DECIMAL(5,2) NOT NULL,
    completion_time INT NULL,
    completed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE
)";

if ($conn->query($sql) === FALSE) {
    die("Error creating user_quiz_results table: " . $conn->error);
}

// Close this connection as we'll create a new one in each API endpoint
$conn->close();
?>