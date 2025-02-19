import React, { useState } from "react";
import { Settings as GearIcon } from "lucide-react";
import "./gearsettings.css";

const GearSettings = ({ questionCount, onCountChange, onReset }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="gearsettings-container">
      <button
        className="gearsettings-button"
        onClick={() => setIsOpen(!isOpen)}
      >
        <GearIcon size={24} />
      </button>
      <div className={`gearsettings-panel ${isOpen ? "open" : ""}`}>
        <div className="gearsettings-panel-title">
          <p>Number of Questions:</p>
        </div>
        <div className="question-control">
          <button
            onClick={() => onCountChange(Math.max(5, questionCount - 5))}
            disabled={questionCount <= 5}
            className="question-control-button"
          >
            −
          </button>
          <span className="question-count">{questionCount}</span>
          <button
            onClick={() => onCountChange(Math.min(30, questionCount + 5))}
            disabled={questionCount >= 30}
            className="question-control-button"
          >
            +
          </button>
        </div>
        <button onClick={onReset} className="reset-button">
          Reset Quiz
        </button>
      </div>
    </div>
  );
};

export default GearSettings;
