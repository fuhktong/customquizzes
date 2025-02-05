import React from "react";
import "./questioncontrol.css";

const QuestionControl = ({ questionCount, onCountChange }) => {
  const handleDecrease = () => {
    if (questionCount > 5) {
      onCountChange(questionCount - 1);
    }
  };

  const handleIncrease = () => {
    if (questionCount < 30) {
      onCountChange(questionCount + 1);
    }
  };

  return (
    <div className="question-control">
      <button
        onClick={handleDecrease}
        className="question-control-button"
        disabled={questionCount <= 5}
      >
        −
      </button>
      <div className="question-count">{questionCount}</div>
      <button
        onClick={handleIncrease}
        className="question-control-button"
        disabled={questionCount >= 30}
      >
        +
      </button>
    </div>
  );
};

export default QuestionControl;
