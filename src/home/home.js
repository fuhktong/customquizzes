import React from "react";
import { Link } from "react-router-dom";
import PageTransition from "../pagetransition.js";
import "./home.css";

const HomePage = () => {
  return (
    <PageTransition>
      <div className="container">
        <div className="home-title-wrapper">
          <div className="home-title">
            <h1>The Logical Fallacy Quiz</h1>
            <h2>Test Your Critical Thinking Skills</h2>
          </div>
        </div>

        <div className="home-image-wrapper">
          {" "}
          <img
            src="/logicalfallacyhomepic3.png"
            alt="Logical Fallacy Quiz"
            className="home-image"
          />
        </div>

        <div className="quiz-template-wrapper">
          <h2>Choose your Quiz Template:</h2>
          <div className="quiz-template-buttons">
            <Link to="/names" className="quiz-button">
              Names
            </Link>
            <Link to="/descriptions" className="quiz-button">
              Descriptions
            </Link>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default HomePage;
