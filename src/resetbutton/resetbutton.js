import React from "react";
import "./resetbutton.css";

const ResetButton = ({ onReset }) => {
  return (
    <button onClick={onReset} className="reset-button">
      Reset Quiz
    </button>
  );
};

export default ResetButton;
