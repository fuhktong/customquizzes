import React, { useState, useEffect } from "react";
import PageTransition from "../pagetransition";
import "./definitions.css";

const Definitions = () => {
  const [fallacies, setFallacies] = useState([]);

  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_URL}/get-fallacies.php`)
      .then((response) => response.json())
      .then((data) => setFallacies(data))
      .catch((error) => console.error("Error:", error));
  }, []);

  return (
    <PageTransition>
      <div className="defintions-page">
        <h2>Logical Fallacy Quiz - Definitions</h2>
        <div className="fallacy-container">
          {fallacies.map((fallacy, index) => (
            <div key={index} className="fallacy">
              <h1>{fallacy.name}</h1>
              <p>{fallacy.description}</p>
            </div>
          ))}
        </div>
      </div>
    </PageTransition>
  );
};

export default Definitions;
