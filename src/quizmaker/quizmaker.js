import React, { useState, useRef, useEffect } from "react";
import { Plus, Trash2 } from "lucide-react";
import QuizInterface from "../quizinterface/quizinterface";
import "./quizmaker.css";

const QuizMaker = () => {
  const [rows, setRows] = useState([
    { name: "", description: "" },
    { name: "", description: "" },
    { name: "", description: "" },
    { name: "", description: "" },
    { name: "", description: "" },
    { name: "", description: "" },
    { name: "", description: "" },
    { name: "", description: "" },
    { name: "", description: "" },
    { name: "", description: "" },
  ]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const tableRef = useRef(null);
  const [quizTitle, setQuizTitle] = useState("");
  const [showQuiz, setShowQuiz] = useState(false);

  // Get URL query parameters to check if we're in edit mode
  const queryParams = new URLSearchParams(window.location.search);
  const isEditMode = queryParams.get("edit") === "true";
  const quizId = queryParams.get("id");
  const quizTitleFromUrl = queryParams.get("title");

  // If in edit mode, load the quiz data
  useEffect(() => {
    if (isEditMode && quizId) {
      setLoading(true);
      // Set the quiz title from URL immediately (for better UX)
      if (quizTitleFromUrl) {
        setQuizTitle(decodeURIComponent(quizTitleFromUrl));
      }

      const fetchQuizData = async () => {
        try {
          const authToken = localStorage.getItem("authToken");

          const response = await fetch(
            `api.php?action=getQuizDetails&quizId=${quizId}`,
            {
              headers: {
                Authorization: `Bearer ${authToken}`,
              },
            }
          );

          const data = await response.json();

          if (response.ok && data.questions) {
            // Format questions to match our rows format
            const quizQuestions = data.questions.map((q) => ({
              name: q.name || "",
              description: q.description || "",
            }));

            // Make sure we have at least 10 rows total (add empty ones if needed)
            if (quizQuestions.length < 10) {
              const emptyRowsNeeded = 10 - quizQuestions.length;
              const emptyRows = Array(emptyRowsNeeded)
                .fill()
                .map(() => ({ name: "", description: "" }));
              setRows([...quizQuestions, ...emptyRows]);
            } else {
              setRows(quizQuestions);
            }

            // Set title if not already set from URL
            if (!quizTitleFromUrl && data.title) {
              setQuizTitle(data.title);
            }
          } else {
            setError(data.error || "Failed to load quiz data");
          }
        } catch (err) {
          console.error("Error fetching quiz:", err);
          setError("Network error. Please try again.");
        } finally {
          setLoading(false);
        }
      };

      fetchQuizData();
    }
  }, [isEditMode, quizId, quizTitleFromUrl]);

  const handlePaste = (e) => {
    e.preventDefault();
    const clipboardData = e.clipboardData.getData("text");
    const pastedRows = clipboardData
      .split("\n")
      .map((row) => row.split("\t"))
      .filter((row) => row.length > 0 && row[0].trim() !== "");

    if (pastedRows.length > 0) {
      const newRows = pastedRows.map((row) => ({
        name: row[0]?.trim() || "",
        description: row[1]?.trim() || "",
      }));
      setRows(newRows);
    }
  };

  const handleInputChange = (index, field, value) => {
    const newRows = [...rows];
    newRows[index][field] = value;
    setRows(newRows);
  };

  const addRow = () => {
    setRows([...rows, { name: "", description: "" }]);
  };

  const removeRow = (index) => {
    if (rows.length > 1) {
      const newRows = rows.filter((_, i) => i !== index);
      setRows(newRows);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setLoading(true);

    const filledRows = rows.filter(
      (row) => row.name.trim() && row.description.trim()
    );

    if (filledRows.length < 1) {
      setError("Please fill in at least one pair of name and description");
      setLoading(false);
      return;
    }

    // Get authentication token
    const authToken = localStorage.getItem("authToken");
    if (!authToken) {
      setError("You must be logged in to create quizzes");
      setLoading(false);
      return;
    }

    // Prepare quiz data
    const quizData = {
      title: quizTitle || "Untitled Quiz",
      questions: filledRows,
    };

    // If in edit mode, add the quiz ID
    if (isEditMode && quizId) {
      quizData.quizId = quizId;
    }

    try {
      // Save quiz to database - use updateQuiz for edit mode or createQuiz for new quizzes
      const response = await fetch(
        `api.php?action=${isEditMode ? "updateQuiz" : "createQuiz"}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify(quizData),
        }
      );

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);

        // If creating a new quiz, store the new quiz ID for the interface
        if (!isEditMode && data.quizId) {
          quizData.quizId = data.quizId;
        }

        setTimeout(() => {
          setShowQuiz(true);
        }, 1500);
      } else {
        setError(
          data.error || `Failed to ${isEditMode ? "update" : "save"} quiz`
        );
      }
    } catch (err) {
      console.error(`Error ${isEditMode ? "updating" : "saving"} quiz:`, err);
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="quiz-container">
      {showQuiz ? (
        <QuizInterface
          quizItems={rows.filter(
            (row) => row.name.trim() && row.description.trim()
          )}
          quizTitle={quizTitle}
          quizId={isEditMode ? quizId : undefined}
        />
      ) : (
        <div className="quiz-card">
          <div className="quiz-header">
            <h2 className="quiz-title">
              {isEditMode ? "Edit Quiz" : "Create Your Custom Quiz"}
            </h2>
            <p className="quiz-subtitle">
              Paste directly from Excel or enter data manually. Select all cells
              in Excel and copy (Ctrl+C), then paste (Ctrl+V) into the grid
              below.
            </p>

            {loading && <div className="loading-indicator">Loading...</div>}

            <form onSubmit={handleSubmit}>
              <div className="quiz-title-input">
                <input
                  type="text"
                  value={quizTitle}
                  onChange={(e) => setQuizTitle(e.target.value)}
                  placeholder="Enter quiz title..."
                  className="title-input"
                />
              </div>
              <div
                ref={tableRef}
                onPaste={handlePaste}
                className="spreadsheet-grid"
              >
                {/* Header Row */}
                <div className="grid-header">
                  <div className="grid-header-cell">Row</div>
                  <div className="grid-header-cell">Name/Term</div>
                  <div className="grid-header-cell">Description</div>
                  <div className="grid-header-cell">Delete</div>
                </div>

                {/* Spreadsheet Grid */}
                <div className="grid-rows">
                  {rows.map((row, index) => (
                    <div key={index} className="grid-row">
                      <div className="row-number">{index + 1}</div>
                      <div className="grid-cell">
                        <input
                          type="text"
                          value={row.name}
                          onChange={(e) =>
                            handleInputChange(index, "name", e.target.value)
                          }
                          className="grid-input"
                          placeholder="Enter term..."
                        />
                      </div>
                      <div className="grid-cell">
                        <input
                          type="text"
                          value={row.description}
                          onChange={(e) =>
                            handleInputChange(
                              index,
                              "description",
                              e.target.value
                            )
                          }
                          className="grid-input"
                          placeholder="Enter description..."
                        />
                      </div>
                      <div className="delete-cell">
                        <button
                          type="button"
                          onClick={() => removeRow(index)}
                          className="delete-button"
                          disabled={rows.length === 1}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <button type="button" onClick={addRow} className="add-row-button">
                <Plus className="h-4 w-4" />
                Add Row
              </button>

              {error && <div className="error-message">{error}</div>}

              {success && (
                <div className="success-message">
                  Quiz {isEditMode ? "updated" : "created"} successfully!
                  Redirecting to quiz...
                </div>
              )}

              <button
                type="submit"
                className="submit-button"
                disabled={loading}
              >
                {loading
                  ? "Saving..."
                  : isEditMode
                  ? "Update Quiz"
                  : "Create Quiz"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuizMaker;
