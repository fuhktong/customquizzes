<?php 

function deleteQuiz($conn, $data, $authToken) {
    // Authenticate the user
    $userId = getUserIdFromToken($conn, $authToken);
    if (!$userId) {
        http_response_code(401);
        echo json_encode(['error' => 'Authentication required']);
        return;
    }

    // Validate data
    if (!isset($data['quizId'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Quiz ID is required']);
        return;
    }

    // Verify the quiz belongs to this user
    $stmt = $conn->prepare("SELECT id FROM quizzes WHERE id = ? AND created_by = ?");
    $stmt->bind_param("ii", $data['quizId'], $userId);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows === 0) {
        http_response_code(403);
        echo json_encode(['error' => 'You do not have permission to delete this quiz']);
        return;
    }

    // Delete the quiz (questions and answers will be deleted via ON DELETE CASCADE)
    $stmt = $conn->prepare("DELETE FROM quizzes WHERE id = ?");
    $stmt->bind_param("i", $data['quizId']);
    
    if ($stmt->execute()) {
        echo json_encode(['success' => true, 'message' => 'Quiz deleted successfully']);
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to delete quiz: ' . $conn->error]);
    }
}

?>