import React, { useState, useEffect } from "react";
import { useAuth } from "../context/authcontext.js";
import "./myquizzes.css";

const MyQuizzes = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { userEmail } = useAuth();

  useEffect(() => {
    const fetchUserQuizzes = async () => {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_API_URL}/get-user-quizzes.php`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ email: userEmail }),
          }
        );

        const data = await response.json();
        if (response.ok) {
          setQuizzes(data.quizzes);
        } else {
          setError(data.error || "Failed to fetch quizzes");
        }
      } catch (err) {
        setError("Network error. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchUserQuizzes();
  }, [userEmail]);

  if (loading) return <div className="my-quizzes-loading">Loading...</div>;
  if (error) return <div className="my-quizzes-error">{error}</div>;

  return (
    <div className="my-quizzes-container">
      <h1>My Quizzes</h1>
      {quizzes.length === 0 ? (
        <p>You haven't created any quizzes yet.</p>
      ) : (
        <div className="quiz-grid">
          {quizzes.map((quiz) => (
            <div key={quiz.id} className="quiz-card">
              <h2>{quiz.title}</h2>
              <p>Created: {new Date(quiz.created_at).toLocaleDateString()}</p>
              <p>Questions: {quiz.question_count}</p>
              <div className="quiz-actions">
                <button onClick={() => console.log("Edit quiz", quiz.id)}>
                  Edit
                </button>
                <button onClick={() => console.log("Delete quiz", quiz.id)}>
                  Delete
                </button>
                <button onClick={() => console.log("Take quiz", quiz.id)}>
                  Take Quiz
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyQuizzes;
