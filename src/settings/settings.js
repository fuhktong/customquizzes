import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/authcontext.js";
import "./settings.css";

const Settings = () => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);

  const { userEmail: contextUserEmail } = useAuth(); // Renamed to show it's from context

  const fetchUserData = useCallback(async () => {
    try {
      // First check if we already have username from context
      if (contextUserEmail) {
        setUsername(contextUserEmail);
        return;
      }

      const userId = localStorage.getItem("userId");
      const authToken = localStorage.getItem("authToken");

      if (!userId || !authToken) {
        setError("You must be logged in to view settings");
        return;
      }

      const response = await fetch(
        `${process.env.REACT_APP_API_URL}api.php?action=settings&userId=${userId}`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      const data = await response.json();

      if (response.ok) {
        setUsername(data.email); // Using email from the API response
      } else {
        setError(data.error || "Failed to fetch user data");
      }
    } catch (err) {
      setError("Failed to fetch user data");
    }
  }, [contextUserEmail]);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    if (newPassword !== confirmPassword) {
      setError("New passwords do not match");
      setLoading(false);
      return;
    }

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters long");
      setLoading(false);
      return;
    }

    try {
      const userId = localStorage.getItem("userId");
      const authToken = localStorage.getItem("authToken");

      if (!userId || !authToken) {
        setError("You must be logged in to change your password");
        setLoading(false);
        return;
      }

      const response = await fetch(`/api.php?action=settings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          userId: userId,
          currentPassword,
          newPassword,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess("Password updated successfully");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        setError(data.error || "Failed to update password");
      }
    } catch (err) {
      setError("Failed to update password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="settings-container">
      <div className="settings-card">
        <h1 className="settings-title">Settings</h1>

        <div className="settings-section">
          <h3>Username</h3>
          <p className="email-display">{username}</p>
        </div>

        <div className="settings-section">
          <h3>Change Password</h3>
          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}

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

            <button type="submit" className="update-button" disabled={loading}>
              {loading ? "Updating..." : "Update Password"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Settings;
