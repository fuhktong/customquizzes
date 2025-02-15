import React, { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState(null);

  useEffect(() => {
    const email = localStorage.getItem("userEmail");
    if (email) {
      setIsLoggedIn(true);
      setUserEmail(email);
    }
  }, []);

  const login = (email) => {
    localStorage.setItem("userEmail", email);
    setIsLoggedIn(true);
    setUserEmail(email);
  };

  const logout = () => {
    localStorage.removeItem("userEmail");
    setIsLoggedIn(false);
    setUserEmail(null);
  };

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn,
        userEmail,
        login,
        logout,
        setIsLoggedIn,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
