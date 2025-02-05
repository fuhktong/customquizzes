import React, { useState, useEffect, useCallback } from "react";
import Settings from "../settings/settings.js";
import GradePopup from "../gradepopup/gradepopup.js";
import PageTransition from "../pagetransition.js";
import "./descriptions.css";

const Descriptions = () => {
  const [shuffledQuestions, setShuffledQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [score, setScore] = useState(0);
  const [currentOptions, setCurrentOptions] = useState([]);
  const [questionCount, setQuestionCount] = useState(10);
  const [desiredCount, setDesiredCount] = useState(10);
  const [showGrade, setShowGrade] = useState(false);

  const questionLimit = questionCount;

  const generateOptions = useCallback((correctAnswer, allQuestions) => {
    let options = [correctAnswer];
    const otherFallacies = allQuestions.filter((q) => q.name !== correctAnswer);

    while (options.length < 4) {
      const random =
        otherFallacies[Math.floor(Math.random() * otherFallacies.length)];
      if (!options.includes(random.name)) options.push(random.name);
    }
    return options.sort(() => Math.random() - 0.5);
  }, []);

  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_URL}/get-fallacies.php`)
      .then((response) => response.json())
      .then((data) => {
        const shuffled = [...data]
          .sort(() => Math.random() - 0.5)
          .slice(0, questionLimit);
        console.log("Shuffled questions array:", shuffled);
        setShuffledQuestions(shuffled);
        setCurrentOptions(generateOptions(shuffled[0].name, data));
      });
  }, [generateOptions, questionLimit]);

  const handleSelect = (index) => {
    setSelectedAnswer(index);
    if (currentOptions[index] === shuffledQuestions[currentIndex].name) {
      setScore(score + 1);
    }
  };

  const handleNext = () => {
    const nextIndex =
      currentIndex === shuffledQuestions.length - 1 ? 0 : currentIndex + 1;
    if (currentIndex === shuffledQuestions.length - 1) {
      setShowGrade(true);
    } else {
      setCurrentOptions(
        generateOptions(shuffledQuestions[nextIndex].name, shuffledQuestions)
      );
      setCurrentIndex(nextIndex);
      setSelectedAnswer(null);
    }
  };

  const handleReset = () => {
    const newShuffled = [...shuffledQuestions]
      .sort(() => Math.random() - 0.5)
      .slice(0, desiredCount);
    setQuestionCount(desiredCount);
    setShuffledQuestions(newShuffled);
    setCurrentIndex(0);
    setScore(0);
    setSelectedAnswer(null);
    setCurrentOptions(generateOptions(newShuffled[0].name, shuffledQuestions));
  };

  if (!shuffledQuestions.length) return <div>Loading...</div>;

  if (showGrade) {
    return (
      <GradePopup
        score={score}
        total={shuffledQuestions.length}
        onClose={() => {
          handleReset();
          setShowGrade(false);
        }}
      />
    );
  }

  const currentQuestion = shuffledQuestions[currentIndex];

  return (
    <PageTransition>
      <div className="descriptions-quiz-container">
        <div className="descriptions-question-counter">
          Question #{currentIndex + 1}:
        </div>
        <div className="descriptions-question">
          <p>Which logical fallacy is: "{currentQuestion.description}"</p>{" "}
        </div>
        <div className="descriptions-options">
          {currentOptions.map((option, index) => (
            <button
              key={index}
              onClick={() => handleSelect(index)}
              disabled={selectedAnswer !== null}
              className={`descriptions-option ${
                selectedAnswer !== null
                  ? option === currentQuestion.name
                    ? "correct"
                    : index === selectedAnswer
                    ? "incorrect"
                    : ""
                  : ""
              }`}
            >
              {option}
            </button>
          ))}
        </div>
        <div className="descriptions-bottom-container">
          {selectedAnswer !== null && (
            <button onClick={handleNext} className="descriptions-next-question">
              Next Question
            </button>
          )}
          <div className="descriptions-controls">
            <div className="descriptions-score">
              Score: {score}/{shuffledQuestions.length}
            </div>
            <Settings
              questionCount={desiredCount}
              onCountChange={setDesiredCount}
              onReset={handleReset}
            />
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default Descriptions;
