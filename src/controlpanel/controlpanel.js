import React from "react";
import QuestionControl from "../questioncontrol/questioncontrol.js";
import ResetButton from "../resetbutton/resetbutton.js";
import "./controlpanel.css";

const ControlPanel = ({ questionCount, onCountChange, onReset }) => {
  return (
    <div className="control-panel">
      {/* <img src="logicalfallacyhomepic3.png" alt="Logical Fallacy" /> */}
      <QuestionControl
        questionCount={questionCount}
        onCountChange={onCountChange}
      />
      <ResetButton onReset={onReset} />
    </div>
  );
};

export default ControlPanel;
