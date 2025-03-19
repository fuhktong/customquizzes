<?php

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

?>