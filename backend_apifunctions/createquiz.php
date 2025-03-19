<?php

function createQuiz($conn, $data, $authToken) {
    // Authenticate the user
    $userId = getUserIdFromToken($conn, $authToken);
    if (!$userId) {
        http_response_code(401);
        echo json_encode(['error' => 'Authentication required']);
        return;
    }

    // Validate data
    if (!isset($data['title']) || !isset($data['questions']) || !is_array($data['questions'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid quiz data']);
        return;
    }

    // Start transaction
    $conn->begin_transaction();

    try {
        // Insert quiz
        $stmt = $conn->prepare("INSERT INTO quizzes (title, created_by) VALUES (?, ?)");
        $stmt->bind_param("si", $data['title'], $userId);
        $stmt->execute();
        $quizId = $conn->insert_id;

        // Insert quiz questions
        foreach ($data['questions'] as $question) {
            if (!empty($question['name']) && !empty($question['description'])) {
                $stmt = $conn->prepare("INSERT INTO quiz_questions (quiz_id, question) VALUES (?, ?)");
                $stmt->bind_param("is", $quizId, $question['name']);
                $stmt->execute();
                
                $questionId = $conn->insert_id;
                
                // Add description as an answer
                $stmt = $conn->prepare("INSERT INTO quiz_answers (question_id, answer_text, is_correct) VALUES (?, ?, 1)");
                $stmt->bind_param("is", $questionId, $question['description']);
                $stmt->execute();
            }
        }

        // Commit transaction
        $conn->commit();
        
        echo json_encode([
            'success' => true,
            'message' => 'Quiz created successfully',
            'quizId' => $quizId
        ]);
    } catch (Exception $e) {
        // Rollback on error
        $conn->rollback();
        http_response_code(500);
        echo json_encode(['error' => 'Failed to create quiz: ' . $e->getMessage()]);
    }
}

?>