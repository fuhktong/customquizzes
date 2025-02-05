import React from "react";
import "./gradepopup.css";

const GradePopup = ({ score, total, onClose }) => {
  const percentage = (score / total) * 100;

  const getGradeTitle = () => {
    if (percentage >= 90) return "Aristotle's Prodigy";
    if (percentage >= 80) return "Plato's Disciple";
    if (percentage >= 70) return "Socratic Thinker";
    if (percentage >= 60) return "Pythagorean Apprentice";
    return "Philosophical Novice";
  };

  return (
    <div className="grade-overlay">
      <div className="grade-popup">
        <h2>Quiz Complete!</h2>
        <div className="grade-score">
          <span>{Math.round(percentage)}%</span>
          <p>Based on your performance, you've earned the title of:</p>
          <h1>{getGradeTitle()}</h1>
        </div>
        <button onClick={onClose} className="close-button">
          Start New Quiz
        </button>
      </div>
    </div>
  );
};

export default GradePopup;
