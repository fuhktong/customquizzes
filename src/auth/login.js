import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/authcontext";
import "./auth.css";

const Login = () => {
  const navigate = useNavigate();
  const { login, setIsLoggedIn } = useAuth();
  const [formData, setFormData] = useState({
    username: "", // Changed from email to username to match backend
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    console.log("Attempting login with:", formData);

    try {
      const response = await fetch(`/api.php?action=login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: formData.username,
          password: formData.password,
        }),
      });

      const data = await response.json();

      console.log("API Response:", data);

      if (response.ok) {
        // Store token in localStorage
        localStorage.setItem("authToken", data.token);
        localStorage.setItem("userId", data.user.id);

        // Update auth context
        login(data.user.username);
        setIsLoggedIn(true);
        setError("");
        navigate("/");
      } else {
        setError(data.error || "Login failed");
        setLoading(false);
      }
    } catch (err) {
      console.error("Full error:", err);
      setError("Network error. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-wrapper">
        <h2>Login to Your Account</h2>
        {error && <div className="auth-error">{error}</div>}
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Username"
              required
            />
          </div>
          <div className="form-group">
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Password"
              required
            />
          </div>
          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
        <p className="auth-link">
          Don't have an account? <Link to="/register">Register here</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
