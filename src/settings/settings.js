import React, { useState } from "react";
import { Settings as GearIcon } from "lucide-react";
import "./settings.css";

const Settings = ({ questionCount, onCountChange, onReset }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="settings-container">
      <button className="settings-button" onClick={() => setIsOpen(!isOpen)}>
        <GearIcon size={24} />
      </button>
      <div className={`settings-panel ${isOpen ? "open" : ""}`}>
        <div className="settings-panel-title">
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

export default Settings;
