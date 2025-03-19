<?php

function updateQuiz($conn, $data, $authToken) {
    // Authenticate the user
    $userId = getUserIdFromToken($conn, $authToken);
    if (!$userId) {
        http_response_code(401);
        echo json_encode(['error' => 'Authentication required']);
        return;
    }

    // Validate data
    if (!isset($data['quizId']) || !isset($data['title']) || !isset($data['questions']) || !is_array($data['questions'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid quiz data']);
        return;
    }

    // Verify the quiz belongs to this user
    $stmt = $conn->prepare("SELECT id FROM quizzes WHERE id = ? AND created_by = ?");
    $stmt->bind_param("ii", $data['quizId'], $userId);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows === 0) {
        http_response_code(403);
        echo json_encode(['error' => 'You do not have permission to edit this quiz']);
        return;
    }

    // Start transaction
    $conn->begin_transaction();

    try {
        // Update quiz title
        $stmt = $conn->prepare("UPDATE quizzes SET title = ? WHERE id = ?");
        $stmt->bind_param("si", $data['title'], $data['quizId']);
        $stmt->execute();
        
        // Delete existing questions and answers (cascade deletes answers because of foreign key)
        $stmt = $conn->prepare("DELETE FROM quiz_questions WHERE quiz_id = ?");
        $stmt->bind_param("i", $data['quizId']);
        $stmt->execute();
        
        // Insert updated questions
        foreach ($data['questions'] as $question) {
            if (!empty($question['name']) && !empty($question['description'])) {
                $stmt = $conn->prepare("INSERT INTO quiz_questions (quiz_id, question) VALUES (?, ?)");
                $stmt->bind_param("is", $data['quizId'], $question['name']);
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
            'message' => 'Quiz updated successfully',
            'quizId' => $data['quizId']
        ]);
    } catch (Exception $e) {
        // Rollback on error
        $conn->rollback();
        http_response_code(500);
        echo json_encode(['error' => 'Failed to update quiz: ' . $e->getMessage()]);
    }
}

?>