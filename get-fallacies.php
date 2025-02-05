<?php
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');

require_once 'fallacy-data.php';

echo json_encode($logical_fallacies);
?>