import React, { useState, useEffect, useCallback } from "react";
import "./settings.css";

const Settings = () => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [email, setEmail] = useState("");

  const userId = localStorage.getItem("userId");

  const fetchUserEmail = useCallback(async () => {
    try {
      const response = await fetch(
        `http://localhost/your-backend-path/settings.php?userId=${userId}`
      );
      const data = await response.json();

      if (response.ok) {
        setEmail(data.email);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError("Failed to fetch user email");
    }
  }, [userId]);

  useEffect(() => {
    fetchUserEmail();
  }, [fetchUserEmail]);

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (newPassword !== confirmPassword) {
      setError("New passwords do not match");
      return;
    }

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    try {
      const response = await fetch(
        "http://localhost/your-backend-path/settings.php",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId,
            currentPassword,
            newPassword,
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        setSuccess("Password updated successfully");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError("Failed to update password. Please try again.");
    }
  };

  return (
    <div className="settings-container">
      <div className="settings-card">
        <h1 className="settings-title">Settings</h1>

        <div className="settings-section">
          <h3>Email Address</h3>
          <p className="email-display">{email}</p>
        </div>

        <div className="settings-section">
          <h3>Change Password</h3>
          <form onSubmit={handlePasswordChange} className="password-form">
            <div className="form-group">
              <label>Current Password</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Confirm New Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            {error && <div className="error-message">{error}</div>}

            {success && <div className="success-message">{success}</div>}

            <button type="submit" className="update-button">
              Update Password
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Settings;
