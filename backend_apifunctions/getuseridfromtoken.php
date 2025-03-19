<?php 

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

?>