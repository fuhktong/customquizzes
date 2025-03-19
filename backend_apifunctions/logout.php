<?php

function logout($conn, $token) {
    if (!$token) {
        http_response_code(401);
        echo json_encode(["error" => "No authentication token provided"]);
        return;
    }

    $stmt = $conn->prepare("UPDATE users SET auth_token = NULL WHERE auth_token = ?");
    $stmt->bind_param("s", $token);
    $stmt->execute();

    echo json_encode(["message" => "Logged out successfully"]);
}

?>