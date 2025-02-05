import React, { useState, useEffect, useCallback } from "react";
import Settings from "../settings/settings.js";
import GradePopup from "../gradepopup/gradepopup.js";
import PageTransition from "../pagetransition.js";
import "./names.css";

const Names = () => {
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
    const otherFallacies = allQuestions.filter(
      (q) => q.description !== correctAnswer
    );

    while (options.length < 4) {
      const random =
        otherFallacies[Math.floor(Math.random() * otherFallacies.length)];
      if (!options.includes(random.description))
        options.push(random.description);
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
        console.log("Shuffled names array:", shuffled);
        setShuffledQuestions(shuffled);
        setCurrentOptions(generateOptions(shuffled[0].description, data));
      });
  }, [generateOptions, questionLimit]);

  const handleSelect = (index) => {
    setSelectedAnswer(index);
    if (currentOptions[index] === shuffledQuestions[currentIndex].description) {
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
        generateOptions(
          shuffledQuestions[nextIndex].description,
          shuffledQuestions
        )
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
    setCurrentOptions(
      generateOptions(newShuffled[0].description, shuffledQuestions)
    );
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
      <div className="names-quiz-container">
        <div className="names-question-counter">
          Question #{currentIndex + 1}:
        </div>
        <div className="names-question">
          <p>What is the defintion of "{currentQuestion.name}" ?</p>
        </div>
        <div className="names-options">
          {currentOptions.map((option, index) => (
            <button
              key={index}
              onClick={() => handleSelect(index)}
              disabled={selectedAnswer !== null}
              className={`names-option ${
                selectedAnswer !== null
                  ? option === currentQuestion.description
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
        <div className="names-bottom-container">
          {selectedAnswer !== null && (
            <button onClick={handleNext} className="names-next-question">
              Next Question
            </button>
          )}
          <div className="names-controls">
            <div className="names-score">
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

export default Names;
