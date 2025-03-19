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

require_once 'config.php'; 
require_once 'backend_apifunctions/createquiz.php';
require_once 'backend_apifunctions/deletequiz.php';
require_once 'backend_apifunctions/generatetoken.php';
require_once 'backend_apifunctions/getquizdetails.php';
require_once 'backend_apifunctions/getuseridfromtoken.php';
require_once 'backend_apifunctions/getuserquizzes.php';
require_once 'backend_apifunctions/getusersettings.php';
require_once 'backend_apifunctions/login.php';
require_once 'backend_apifunctions/logout.php';
require_once 'backend_apifunctions/register.php';
require_once 'backend_apifunctions/updatequiz.php';
require_once 'backend_apifunctions/updateuserpassword.php';

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

// Close the database connection
$conn->close();
?>