<?php
// Simple router for development

// Enable CORS
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Route the request to api.php
if (strpos($_SERVER['REQUEST_URI'], '/api.php') !== false) {
    require_once 'api.php';
    exit();
}

// Default response for other routes
echo json_encode(["error" => "Invalid endpoint"]);