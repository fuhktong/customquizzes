<?php 

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

?>