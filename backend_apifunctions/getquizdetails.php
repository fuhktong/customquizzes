<?php

function getQuizDetails($conn, $quizId, $authToken) {
    // Validate quiz ID
    if (!$quizId) {
        http_response_code(400);
        echo json_encode(['error' => 'Quiz ID is required']);
        return;
    }
    
    // Get quiz basic info
    $stmt = $conn->prepare("SELECT q.id, q.title, q.created_by, q.created_at 
                           FROM quizzes q 
                           WHERE q.id = ?");
    $stmt->bind_param("i", $quizId);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows === 0) {
        http_response_code(404);
        echo json_encode(['error' => 'Quiz not found']);
        return;
    }
    
    $quizData = $result->fetch_assoc();
    
    // Get quiz questions and answers
    $stmt = $conn->prepare("SELECT qq.id, qq.question as name, 
                          (SELECT answer_text FROM quiz_answers qa WHERE qa.question_id = qq.id LIMIT 1) as description
                          FROM quiz_questions qq
                          WHERE qq.quiz_id = ?");
    $stmt->bind_param("i", $quizId);
    $stmt->execute();
    $result = $stmt->get_result();
    
    $questions = [];
    while ($row = $result->fetch_assoc()) {
        $questions[] = $row;
    }
    
    $quizData['questions'] = $questions;
    
    echo json_encode($quizData);
}

?>