<?php

function getUserQuizzes($conn, $data) {
    // Validate data
    if (!isset($data['userId']) && !isset($data['email'])) {
        http_response_code(400);
        echo json_encode(['error' => 'User information is required']);
        return;
    }

    // Use userId if provided, otherwise look up by email
    if (isset($data['userId'])) {
        $userId = $data['userId'];
    } else {
        // Get userId from email
        $stmt = $conn->prepare("SELECT id FROM users WHERE username = ?");
        $stmt->bind_param("s", $data['email']);
        $stmt->execute();
        $result = $stmt->get_result();
        
        if ($result->num_rows === 0) {
            http_response_code(404);
            echo json_encode(['error' => 'User not found']);
            return;
        }
        
        $user = $result->fetch_assoc();
        $userId = $user['id'];
    }

    $stmt = $conn->prepare("SELECT q.id, q.title, q.created_at, 
                         (SELECT COUNT(*) FROM quiz_questions WHERE quiz_id = q.id) as question_count 
                         FROM quizzes q 
                         WHERE q.created_by = ? 
                         ORDER BY q.created_at DESC");
    $stmt->bind_param("i", $userId);
    $stmt->execute();
    $result = $stmt->get_result();
    
    $quizzes = [];
    while ($row = $result->fetch_assoc()) {
        $quizzes[] = $row;
    }
    
    echo json_encode(['quizzes' => $quizzes]);
}

?>