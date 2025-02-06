import React, { useState, useRef } from "react";
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
  const tableRef = useRef(null);

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

  const [showQuiz, setShowQuiz] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    const filledRows = rows.filter(
      (row) => row.name.trim() && row.description.trim()
    );

    if (filledRows.length < 1) {
      setError("Please fill in at least one pair of name and description");
      return;
    }

    setSuccess(true);
    setTimeout(() => {
      setShowQuiz(true);
    }, 1500);
  };

  return (
    <div className="quiz-container">
      {!showQuiz ? (
        <div className="quiz-card">
          <div className="quiz-header">
            <h2 className="quiz-title">Create Your Custom Quiz</h2>
            <p className="quiz-subtitle">
              Paste directly from Excel or enter data manually. Select all cells
              in Excel and copy (Ctrl+C), then paste (Ctrl+V) into the grid
              below.
            </p>

            <form onSubmit={handleSubmit}>
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
                  Quiz content saved successfully! Redirecting to quiz...
                </div>
              )}

              <button type="submit" className="submit-button">
                Create Quiz
              </button>
            </form>
          </div>
        </div>
      ) : (
        <QuizInterface
          quizItems={rows.filter(
            (row) => row.name.trim() && row.description.trim()
          )}
        />
      )}
    </div>
  );
};

export default QuizMaker;
