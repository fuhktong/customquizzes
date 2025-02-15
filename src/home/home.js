import React from "react";
import { Link } from "react-router-dom";
import PageTransition from "../pagetransition.js";
import "./home.css";

const HomePage = () => {
  return (
    <PageTransition>
      <div className="container">
        <div className="home-wrapper">
          <img
            src="/customquizzeslogo.png"
            alt="Custom Quizzes"
            className="home-image"
          />
          <h1>
            Create your own customized quizzes, great for educators and learners
            of all ages!
          </h1>
          <p>Click here to start making your quiz:</p>
          <div className="quiz-template-buttons">
            <Link to="/quiz-maker" className="quiz-button">
              Start Quiz Maker
            </Link>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default HomePage;
