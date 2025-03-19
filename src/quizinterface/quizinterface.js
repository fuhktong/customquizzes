import React, { useState, useEffect } from "react";
import GearSettings from "../gearsettings/gearsettings.js";
import "./quizinterface.css";

const QuizInterface = (props) => {
  // State for quiz data and functionality
  const [quizItems, setQuizItems] = useState([]);
  const [quizTitle, setQuizTitle] = useState("");
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [showScore, setShowScore] = useState(false);
  const [options, setOptions] = useState([]);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [questionCount, setQuestionCount] = useState(10); // Default to 10 questions

  // State for loading quiz from URL
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Get URL parameters if present
  const queryParams = new URLSearchParams(window.location.search);
  const quizIdFromUrl = queryParams.get("id");
  const quizTitleFromUrl = queryParams.get("title");

  // Load quiz data from API if accessed via URL parameters
  useEffect(() => {
    // Get quiz items and title from props inside the effect
    const propQuizItems = props.quizItems || [];
    const propQuizTitle = props.quizTitle || "";

    if (quizIdFromUrl && propQuizItems.length === 0) {
      setLoading(true);
      const loadQuizData = async () => {
        try {
          const authToken = localStorage.getItem("authToken");

          const response = await fetch(
            `api.php?action=getQuizDetails&quizId=${quizIdFromUrl}`,
            {
              headers: {
                Authorization: `Bearer ${authToken}`,
              },
            }
          );

          const data = await response.json();

          if (response.ok && data.questions) {
            // Set quiz items from API response
            setQuizItems(data.questions);

            // Set quiz title
            const finalTitle = quizTitleFromUrl || data.title || "Quiz";
            setQuizTitle(finalTitle);
          } else {
            setError(data.error || "Failed to load quiz");
          }
        } catch (err) {
          console.error("Error loading quiz:", err);
          setError("Network error. Please try again.");
        } finally {
          setLoading(false);
        }
      };

      loadQuizData();
    } else if (propQuizItems.length > 0) {
      // Initialize from props if available
      setQuizItems(propQuizItems);
      setQuizTitle(propQuizTitle);
    }
  }, [quizIdFromUrl, quizTitleFromUrl, props.quizItems, props.quizTitle]);

  // Generate multiple choice options when current question changes
  useEffect(() => {
    if (quizItems && quizItems.length > 0) {
      const generateOptions = () => {
        const correctAnswer = quizItems[currentQuestion].description;
        const wrongAnswers = quizItems
          .filter((item, index) => index !== currentQuestion)
          .map((item) => item.description)
          .sort(() => Math.random() - 0.5)
          .slice(0, 3);

        const allOptions = [...wrongAnswers, correctAnswer].sort(
          () => Math.random() - 0.5
        );

        setOptions(allOptions);
      };

      generateOptions();
      setIsAnswered(false);
      setSelectedAnswer(null);
    }
  }, [currentQuestion, quizItems]);

  const handleAnswerClick = (selectedDescription) => {
    if (isAnswered) return;

    setSelectedAnswer(selectedDescription);
    setIsAnswered(true);

    if (selectedDescription === quizItems[currentQuestion].description) {
      setScore(score + 1);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestion < Math.min(questionCount - 1, quizItems.length - 1)) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setShowScore(true);
    }
  };

  const handleReset = () => {
    setCurrentQuestion(0);
    setScore(0);
    setShowScore(false);
    setSelectedAnswer(null);
    setIsAnswered(false);
  };

  const handleQuestionCountChange = (newCount) => {
    setQuestionCount(newCount);
    if (currentQuestion >= newCount) {
      setCurrentQuestion(0);
      handleReset();
    }
  };

  // Show loading indicator while fetching quiz
  if (loading) {
    return <div className="quiz-container">Loading quiz...</div>;
  }

  // Show error message if something went wrong
  if (error) {
    return <div className="quiz-container">{error}</div>;
  }

  // Show message if no quiz items are available
  if (!quizItems || quizItems.length === 0) {
    return <div className="quiz-container">No quiz items available.</div>;
  }

  // Show the score screen when quiz is complete
  if (showScore) {
    return (
      <div className="quiz-container">
        <div className="quiz-card">
          <div className="quiz-header">
            <h2 className="quiz-title">Quiz Complete!</h2>
            <div className="score-display">
              <p>
                You scored {score} out of{" "}
                {Math.min(questionCount, quizItems.length)}
              </p>
              <p className="score-percentage">
                {Math.round(
                  (score / Math.min(questionCount, quizItems.length)) * 100
                )}
                %
              </p>
            </div>
            <button onClick={handleReset} className="restart-button">
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Render the quiz interface
  return (
    <div className="quiz-container">
      <div className="quiz-card">
        <div className="quiz-header">
          <h1 className="quiz-main-title">{quizTitle}</h1>
          <div className="quiz-progress">
            Question {currentQuestion + 1} of{" "}
            {Math.min(questionCount, quizItems.length)}
          </div>
          <div className="name-term-question">
            <p>
              What is the definition of "{quizItems[currentQuestion].name}" ?
            </p>
          </div>
          <div className="options-grid">
            {options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswerClick(option)}
                className={`option-button ${
                  isAnswered
                    ? option === quizItems[currentQuestion].description
                      ? "correct"
                      : option === selectedAnswer && "incorrect"
                    : ""
                }`}
                disabled={isAnswered}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="bottom-container">
        {isAnswered && (
          <button onClick={handleNextQuestion} className="next-button">
            Next Question
          </button>
        )}
        <div className="controls">
          <div className="score">
            Score: {score}/{Math.min(questionCount, quizItems.length)}
          </div>
          <GearSettings
            questionCount={questionCount}
            onCountChange={handleQuestionCountChange}
            onReset={handleReset}
          />
        </div>
      </div>
    </div>
  );
};

export default QuizInterface;
