<?php

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

?>