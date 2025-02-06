import React, { useState, useEffect } from "react";
import "./quizinterface.css";

const QuizInterface = ({ quizItems }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [showScore, setShowScore] = useState(false);
  const [options, setOptions] = useState([]);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isCorrect, setIsCorrect] = useState(null);

  useEffect(() => {
    if (quizItems && quizItems.length > 0) {
      // Generate options for current question
      const generateOptions = () => {
        // Get current term's correct description
        const correctAnswer = quizItems[currentQuestion].description;

        // Get 3 random wrong descriptions
        const wrongAnswers = quizItems
          .filter((item, index) => index !== currentQuestion)
          .map((item) => item.description)
          .sort(() => Math.random() - 0.5)
          .slice(0, 3);

        // Combine and shuffle all options
        const allOptions = [...wrongAnswers, correctAnswer].sort(
          () => Math.random() - 0.5
        );

        setOptions(allOptions);
      };

      generateOptions();
    }
  }, [currentQuestion, quizItems]);

  const handleAnswerClick = (selectedDescription) => {
    if (isCorrect !== null) return; // Prevent multiple answers

    const correct =
      selectedDescription === quizItems[currentQuestion].description;
    setSelectedAnswer(selectedDescription);
    setIsCorrect(correct);

    if (correct) {
      setScore(score + 1);
    }

    // Wait before moving to next question
    setTimeout(() => {
      if (currentQuestion < quizItems.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
        setSelectedAnswer(null);
        setIsCorrect(null);
      } else {
        setShowScore(true);
      }
    }, 1500);
  };

  const restartQuiz = () => {
    setCurrentQuestion(0);
    setScore(0);
    setShowScore(false);
    setSelectedAnswer(null);
    setIsCorrect(null);
  };

  if (!quizItems || quizItems.length === 0) {
    return <div className="quiz-container">No quiz items available.</div>;
  }

  if (showScore) {
    return (
      <div className="quiz-container">
        <div className="quiz-card">
          <div className="quiz-header">
            <h2 className="quiz-title">Quiz Complete!</h2>
            <div className="score-display">
              <p>
                You scored {score} out of {quizItems.length}
              </p>
              <p className="score-percentage">
                {Math.round((score / quizItems.length) * 100)}%
              </p>
            </div>
            <button onClick={restartQuiz} className="restart-button">
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="quiz-container">
      <div className="quiz-card">
        <div className="quiz-header">
          <div className="quiz-progress">
            Question {currentQuestion + 1} of {quizItems.length}
          </div>
          <div className="score-indicator">Score: {score}</div>
          <h2 className="quiz-title">{quizItems[currentQuestion].name}</h2>
          <div className="options-grid">
            {options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswerClick(option)}
                className={`option-button ${
                  selectedAnswer === option
                    ? isCorrect
                      ? "correct"
                      : "incorrect"
                    : ""
                }`}
                disabled={selectedAnswer !== null}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizInterface;
