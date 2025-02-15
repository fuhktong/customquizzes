import React from "react";
import { Link } from "react-router-dom";
import PageTransition from "../pagetransition.js";
import "./landing.css";

const LandingNames = () => {
  return (
    <PageTransition>
      <div className="landing-container">
        <div className="landing-title-wrapper">
          <div className="landing-title">
            <h1>The Logical Fallacy Quiz</h1>
            <h2>Test Your Critical Thinking Skills</h2>
          </div>
        </div>

        <div className="landing-image-wrapper">
          {" "}
          <img
            src="/logicalfallacyhomepic3.png"
            alt="Logical Fallacy Quiz"
            className="landing-image"
          />
        </div>

        <div className="landing-quiz-template-wrapper">
          <h2>Take the Logical Fallacy Quiz</h2>
          <p>
            After seeing a random Logical Fallacy, select the correct
            definition:
          </p>
          <div className="landing-quiz-template-buttons">
            <Link to="/names" className="landing-quiz-button">
              Start Names Quiz
            </Link>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default LandingNames;
