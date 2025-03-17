import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/authcontext.js";
import "./myquizzes.css";

const MyQuizzes = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const { userEmail } = useAuth();

  const fetchUserQuizzes = useCallback(async () => {
    try {
      const authToken = localStorage.getItem("authToken");
      const userId = localStorage.getItem("userId");

      if (!authToken || !userId) {
        setError("You must be logged in to view your quizzes");
        setLoading(false);
        return;
      }

      const response = await fetch(
        `/backend_apiandconfig/api.php?action=getUserQuizzes`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify({
            email: userEmail,
            userId: userId,
          }),
        }
      );

      const data = await response.json();
      if (response.ok) {
        setQuizzes(data.quizzes || []);
      } else {
        setError(data.error || "Failed to fetch quizzes");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [userEmail]);

  useEffect(() => {
    fetchUserQuizzes();
  }, [fetchUserQuizzes]);

  const editQuiz = (quizId, quizTitle) => {
    // Navigate to quiz maker with query parameters
    window.location.href = `/quiz-maker?edit=true&id=${quizId}&title=${encodeURIComponent(
      quizTitle
    )}`;
  };

  const deleteQuiz = async (quizId) => {
    if (!window.confirm("Are you sure you want to delete this quiz?")) {
      return;
    }

    try {
      const authToken = localStorage.getItem("authToken");

      const response = await fetch(
        `/backend_apiandconfig/api.php?action=deleteQuiz`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify({
            quizId: quizId,
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        // Remove the deleted quiz from state
        setQuizzes(quizzes.filter((quiz) => quiz.id !== quizId));
        setSuccessMessage("Quiz deleted successfully");

        // Clear success message after 3 seconds
        setTimeout(() => {
          setSuccessMessage(null);
        }, 3000);
      } else {
        setError(data.error || "Failed to delete quiz");

        // Clear error after 3 seconds
        setTimeout(() => {
          setError(null);
        }, 3000);
      }
    } catch (err) {
      setError("Network error. Please try again.");

      // Clear error after 3 seconds
      setTimeout(() => {
        setError(null);
      }, 3000);
    }
  };

  const takeQuiz = (quizId, quizTitle) => {
    // Use the quiz-interface route with query parameters
    window.location.href = `/quiz-interface?id=${quizId}&title=${encodeURIComponent(
      quizTitle
    )}`;
  };

  if (loading) return <div className="my-quizzes-loading">Loading...</div>;

  return (
    <div className="my-quizzes-container">
      <h1>My Quizzes</h1>

      {error && <div className="my-quizzes-error">{error}</div>}
      {successMessage && (
        <div className="my-quizzes-success">{successMessage}</div>
      )}

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
                <button onClick={() => editQuiz(quiz.id, quiz.title)}>
                  Edit
                </button>
                <button onClick={() => deleteQuiz(quiz.id)}>Delete</button>
                <button onClick={() => takeQuiz(quiz.id, quiz.title)}>
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
