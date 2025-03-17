<?php
// Force PHP to display all errors for debugging
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Essential: Always send CORS headers first, before any other output
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Access-Control-Max-Age: 86400"); // Cache preflight for 24 hours

// Immediately handle preflight OPTIONS requests and exit
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    // Ensure 200 OK status and exit
    http_response_code(200);
    exit;
}

// Set content type to JSON for all other responses
header("Content-Type: application/json");

// Include database configuration
require_once 'config.php';

// Create a new database connection
$conn = new mysqli(DB_SERVER, DB_USERNAME, DB_PASSWORD, DB_NAME);

// Check connection
if ($conn->connect_error) {
    http_response_code(500);
    die(json_encode(["error" => "Connection failed: " . $conn->connect_error]));
}

// Add a new column to users table for auth token if it doesn't exist
$sql = "SHOW COLUMNS FROM users LIKE 'auth_token'";
$result = $conn->query($sql);
if ($result->num_rows == 0) {
    $sql = "ALTER TABLE users ADD COLUMN auth_token VARCHAR(255)";
    if ($conn->query($sql) === FALSE) {
        http_response_code(500);
        die(json_encode(["error" => "Failed to update users table: " . $conn->error]));
    }
}

// Get the HTTP method
$method = $_SERVER['REQUEST_METHOD'];

// Get the request body
$data = json_decode(file_get_contents("php://input"), true);

// Get the action from query parameter
$action = isset($_GET['action']) ? $_GET['action'] : '';

// Get auth token from headers or query
$authToken = null;
if (isset($_SERVER['HTTP_AUTHORIZATION']) && strpos($_SERVER['HTTP_AUTHORIZATION'], 'Bearer ') === 0) {
    $authToken = substr($_SERVER['HTTP_AUTHORIZATION'], 7);
} elseif (isset($_GET['token'])) {
    $authToken = $_GET['token'];
}

// Debug output - uncomment if needed
// error_log("Action: $action, Method: $method, Data: " . json_encode($data));

// Handle different actions
switch ($action) {
    case 'register':
        register($conn, $data);
        break;
    case 'login':
        login($conn, $data);
        break;
    case 'logout':
        logout($conn, $authToken);
        break;
    case 'createQuiz':
        if ($method === 'POST') {
            createQuiz($conn, $data, $authToken);
        }
        break;
    case 'getUserQuizzes':
        if ($method === 'POST') {
            getUserQuizzes($conn, $data);
        } else {
            http_response_code(405); // Method Not Allowed
            echo json_encode(["error" => "Method not allowed for this action"]);
        }
        break;
    case 'getQuizDetails':
        getQuizDetails($conn, $_GET['quizId'], $authToken);
        break;
    case 'updateQuiz':
        if ($method === 'POST') {
            updateQuiz($conn, $data, $authToken);
        }
        break;
    case 'deleteQuiz':
        if ($method === 'POST') {
            deleteQuiz($conn, $data, $authToken);
        }
        break;
    case 'settings':
        if ($method === 'GET') {
            getUserSettings($conn, $_GET['userId']);
        } elseif ($method === 'POST') {
            updateUserPassword($conn, $data);
        } else {
            http_response_code(405); // Method Not Allowed
            echo json_encode(["error" => "Method not allowed for this action"]);
        }
        break;
    case 'test':
        // Test endpoint for debugging
        echo json_encode(["message" => "API is working", "method" => $method, "data" => $data]);
        break;
    default:
        http_response_code(404);
        echo json_encode(["error" => "Action not found: $action"]);
}

// Generate a random token
function generateToken() {
    return bin2hex(random_bytes(32));
}

// Register a new user
function register($conn, $data) {
    // Validate data
    if (!isset($data['username']) || !isset($data['password'])) {
        http_response_code(400);
        echo json_encode(["error" => "Username and password are required"]);
        return;
    }

    $username = $data['username'];
    $password = $data['password'];

    // Check if user exists
    $stmt = $conn->prepare("SELECT id FROM users WHERE username = ?");
    $stmt->bind_param("s", $username);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows > 0) {
        http_response_code(400);
        echo json_encode(["error" => "Username already exists"]);
        return;
    }

    // Hash the password
    $hashed_password = password_hash($password, PASSWORD_DEFAULT);

    // Insert the new user
    $stmt = $conn->prepare("INSERT INTO users (username, password) VALUES (?, ?)");
    $stmt->bind_param("ss", $username, $hashed_password);

    if ($stmt->execute()) {
        http_response_code(201);
        echo json_encode(["message" => "User registered successfully"]);
    } else {
        http_response_code(500);
        echo json_encode(["error" => "Server error: " . $conn->error]);
    }
}

// Login a user
function login($conn, $data) {
    // Validate data
    if (!isset($data['username']) || !isset($data['password'])) {
        http_response_code(400);
        echo json_encode(["error" => "Username and password are required"]);
        return;
    }

    $username = $data['username'];
    $password = $data['password'];

    // Get the user
    $stmt = $conn->prepare("SELECT id, username, password FROM users WHERE username = ?");
    $stmt->bind_param("s", $username);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows === 0) {
        http_response_code(400);
        echo json_encode(["error" => "Invalid credentials"]);
        return;
    }

    $user = $result->fetch_assoc();

    // Verify the password
    if (password_verify($password, $user['password'])) {
        // Generate a token
        $token = generateToken();
        
        // Save token to user record
        $stmt = $conn->prepare("UPDATE users SET auth_token = ? WHERE id = ?");
        $stmt->bind_param("si", $token, $user['id']);
        $stmt->execute();

        echo json_encode([
            "message" => "Login successful",
            "user" => [
                "id" => $user['id'],
                "username" => $user['username']
            ],
            "token" => $token
        ]);
    } else {
        http_response_code(400);
        echo json_encode(["error" => "Invalid credentials"]);
    }
}

// Logout a user
function logout($conn, $token) {
    if (!$token) {
        http_response_code(401);
        echo json_encode(["error" => "No authentication token provided"]);
        return;
    }

    // Clear the token
    $stmt = $conn->prepare("UPDATE users SET auth_token = NULL WHERE auth_token = ?");
    $stmt->bind_param("s", $token);
    $stmt->execute();

    echo json_encode(["message" => "Logged out successfully"]);
}

// Verify token and get user ID
function getUserIdFromToken($conn, $token) {
    if (!$token) {
        return null;
    }

    $stmt = $conn->prepare("SELECT id FROM users WHERE auth_token = ?");
    $stmt->bind_param("s", $token);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows === 0) {
        return null;
    }

    $user = $result->fetch_assoc();
    return $user['id'];
}

// Create a new quiz
function createQuiz($conn, $data, $authToken) {
    // Authenticate the user
    $userId = getUserIdFromToken($conn, $authToken);
    if (!$userId) {
        http_response_code(401);
        echo json_encode(['error' => 'Authentication required']);
        return;
    }

    // Validate data
    if (!isset($data['title']) || !isset($data['questions']) || !is_array($data['questions'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid quiz data']);
        return;
    }

    // Start transaction
    $conn->begin_transaction();

    try {
        // Insert quiz
        $stmt = $conn->prepare("INSERT INTO quizzes (title, created_by) VALUES (?, ?)");
        $stmt->bind_param("si", $data['title'], $userId);
        $stmt->execute();
        $quizId = $conn->insert_id;

        // Insert quiz questions
        foreach ($data['questions'] as $question) {
            if (!empty($question['name']) && !empty($question['description'])) {
                $stmt = $conn->prepare("INSERT INTO quiz_questions (quiz_id, question) VALUES (?, ?)");
                $stmt->bind_param("is", $quizId, $question['name']);
                $stmt->execute();
                
                $questionId = $conn->insert_id;
                
                // Add description as an answer
                $stmt = $conn->prepare("INSERT INTO quiz_answers (question_id, answer_text, is_correct) VALUES (?, ?, 1)");
                $stmt->bind_param("is", $questionId, $question['description']);
                $stmt->execute();
            }
        }

        // Commit transaction
        $conn->commit();
        
        echo json_encode([
            'success' => true,
            'message' => 'Quiz created successfully',
            'quizId' => $quizId
        ]);
    } catch (Exception $e) {
        // Rollback on error
        $conn->rollback();
        http_response_code(500);
        echo json_encode(['error' => 'Failed to create quiz: ' . $e->getMessage()]);
    }
}

// Get user's quizzes
function getUserQuizzes($conn, $data) {
    // Validate data
    if (!isset($data['userId']) && !isset($data['email'])) {
        http_response_code(400);
        echo json_encode(['error' => 'User information is required']);
        return;
    }

    // Use userId if provided, otherwise look up by email
    if (isset($data['userId'])) {
        $userId = $data['userId'];
    } else {
        // Get userId from email
        $stmt = $conn->prepare("SELECT id FROM users WHERE username = ?");
        $stmt->bind_param("s", $data['email']);
        $stmt->execute();
        $result = $stmt->get_result();
        
        if ($result->num_rows === 0) {
            http_response_code(404);
            echo json_encode(['error' => 'User not found']);
            return;
        }
        
        $user = $result->fetch_assoc();
        $userId = $user['id'];
    }

    $stmt = $conn->prepare("SELECT q.id, q.title, q.created_at, 
                         (SELECT COUNT(*) FROM quiz_questions WHERE quiz_id = q.id) as question_count 
                         FROM quizzes q 
                         WHERE q.created_by = ? 
                         ORDER BY q.created_at DESC");
    $stmt->bind_param("i", $userId);
    $stmt->execute();
    $result = $stmt->get_result();
    
    $quizzes = [];
    while ($row = $result->fetch_assoc()) {
        $quizzes[] = $row;
    }
    
    echo json_encode(['quizzes' => $quizzes]);
}

// Delete a quiz
function deleteQuiz($conn, $data, $authToken) {
    // Authenticate the user
    $userId = getUserIdFromToken($conn, $authToken);
    if (!$userId) {
        http_response_code(401);
        echo json_encode(['error' => 'Authentication required']);
        return;
    }

    // Validate data
    if (!isset($data['quizId'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Quiz ID is required']);
        return;
    }

    // Verify the quiz belongs to this user
    $stmt = $conn->prepare("SELECT id FROM quizzes WHERE id = ? AND created_by = ?");
    $stmt->bind_param("ii", $data['quizId'], $userId);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows === 0) {
        http_response_code(403);
        echo json_encode(['error' => 'You do not have permission to delete this quiz']);
        return;
    }

    // Delete the quiz (questions and answers will be deleted via ON DELETE CASCADE)
    $stmt = $conn->prepare("DELETE FROM quizzes WHERE id = ?");
    $stmt->bind_param("i", $data['quizId']);
    
    if ($stmt->execute()) {
        echo json_encode(['success' => true, 'message' => 'Quiz deleted successfully']);
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to delete quiz: ' . $conn->error]);
    }
}

// Get user settings
function getUserSettings($conn, $userId) {
    if (!$userId) {
        http_response_code(400);
        echo json_encode(['error' => 'User ID is required']);
        return;
    }

    $stmt = $conn->prepare("SELECT username FROM users WHERE id = ?");
    $stmt->bind_param("i", $userId);
    $stmt->execute();
    $result = $stmt->get_result();
    $user = $result->fetch_assoc();
    
    if ($user) {
        echo json_encode(['email' => $user['username']]);
    } else {
        http_response_code(404);
        echo json_encode(['error' => 'User not found']);
    }
}

// Update user password
function updateUserPassword($conn, $data) {
    if (!isset($data['userId']) || !isset($data['currentPassword']) || !isset($data['newPassword'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Missing required fields']);
        return;
    }

    $stmt = $conn->prepare("SELECT password FROM users WHERE id = ?");
    $stmt->bind_param("i", $data['userId']);
    $stmt->execute();
    $result = $stmt->get_result();
    $user = $result->fetch_assoc();

    if (!$user) {
        http_response_code(404);
        echo json_encode(['error' => 'User not found']);
        return;
    }

    if (!password_verify($data['currentPassword'], $user['password'])) {
        http_response_code(401);
        echo json_encode(['error' => 'Current password is incorrect']);
        return;
    }

    $new_password_hash = password_hash($data['newPassword'], PASSWORD_DEFAULT);
    $stmt = $conn->prepare("UPDATE users SET password = ? WHERE id = ?");
    $stmt->bind_param("si", $new_password_hash, $data['userId']);
    
    if ($stmt->execute()) {
        echo json_encode(['message' => 'Password updated successfully']);
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'Database error']);
    }
}

function getQuizDetails($conn, $quizId, $authToken) {
    // Validate quiz ID
    if (!$quizId) {
        http_response_code(400);
        echo json_encode(['error' => 'Quiz ID is required']);
        return;
    }
    
    // Get quiz basic info
    $stmt = $conn->prepare("SELECT q.id, q.title, q.created_by, q.created_at 
                           FROM quizzes q 
                           WHERE q.id = ?");
    $stmt->bind_param("i", $quizId);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows === 0) {
        http_response_code(404);
        echo json_encode(['error' => 'Quiz not found']);
        return;
    }
    
    $quizData = $result->fetch_assoc();
    
    // Get quiz questions and answers
    $stmt = $conn->prepare("SELECT qq.id, qq.question as name, 
                          (SELECT answer_text FROM quiz_answers qa WHERE qa.question_id = qq.id LIMIT 1) as description
                          FROM quiz_questions qq
                          WHERE qq.quiz_id = ?");
    $stmt->bind_param("i", $quizId);
    $stmt->execute();
    $result = $stmt->get_result();
    
    $questions = [];
    while ($row = $result->fetch_assoc()) {
        $questions[] = $row;
    }
    
    $quizData['questions'] = $questions;
    
    echo json_encode($quizData);
}

// Update quiz
function updateQuiz($conn, $data, $authToken) {
    // Authenticate the user
    $userId = getUserIdFromToken($conn, $authToken);
    if (!$userId) {
        http_response_code(401);
        echo json_encode(['error' => 'Authentication required']);
        return;
    }

    // Validate data
    if (!isset($data['quizId']) || !isset($data['title']) || !isset($data['questions']) || !is_array($data['questions'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid quiz data']);
        return;
    }

    // Verify the quiz belongs to this user
    $stmt = $conn->prepare("SELECT id FROM quizzes WHERE id = ? AND created_by = ?");
    $stmt->bind_param("ii", $data['quizId'], $userId);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows === 0) {
        http_response_code(403);
        echo json_encode(['error' => 'You do not have permission to edit this quiz']);
        return;
    }

    // Start transaction
    $conn->begin_transaction();

    try {
        // Update quiz title
        $stmt = $conn->prepare("UPDATE quizzes SET title = ? WHERE id = ?");
        $stmt->bind_param("si", $data['title'], $data['quizId']);
        $stmt->execute();
        
        // Delete existing questions and answers (cascade deletes answers because of foreign key)
        $stmt = $conn->prepare("DELETE FROM quiz_questions WHERE quiz_id = ?");
        $stmt->bind_param("i", $data['quizId']);
        $stmt->execute();
        
        // Insert updated questions
        foreach ($data['questions'] as $question) {
            if (!empty($question['name']) && !empty($question['description'])) {
                $stmt = $conn->prepare("INSERT INTO quiz_questions (quiz_id, question) VALUES (?, ?)");
                $stmt->bind_param("is", $data['quizId'], $question['name']);
                $stmt->execute();
                
                $questionId = $conn->insert_id;
                
                // Add description as an answer
                $stmt = $conn->prepare("INSERT INTO quiz_answers (question_id, answer_text, is_correct) VALUES (?, ?, 1)");
                $stmt->bind_param("is", $questionId, $question['description']);
                $stmt->execute();
            }
        }

        // Commit transaction
        $conn->commit();
        
        echo json_encode([
            'success' => true,
            'message' => 'Quiz updated successfully',
            'quizId' => $data['quizId']
        ]);
    } catch (Exception $e) {
        // Rollback on error
        $conn->rollback();
        http_response_code(500);
        echo json_encode(['error' => 'Failed to update quiz: ' . $e->getMessage()]);
    }
}

// Close the database connection
$conn->close();
?>