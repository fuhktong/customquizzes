<?php

$request_uri = $_SERVER['REQUEST_URI'];

if (preg_match('/\.(css|js|jpg|jpeg|png|gif|ico|svg)$/', $request_uri)) {
    return false;
}

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

$index_file = __DIR__ . '/index.html';

if (file_exists($index_file)) {
    echo file_get_contents($index_file);
} else {
    header("HTTP/1.0 404 Not Found");
    echo "Error: Build files not found";
}
?>