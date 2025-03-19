<?php 

function login($conn, $data) {
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

?>