import React from "react";
import { useTheme } from "../context/ThemeContext";
import "../styles/navbar.css";

const Navbar = () => {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <nav className="navbar">
      <div className="nav-container">
        <div className="logo">
          <span className="logo-text">VISU-ALGO</span>
        </div>
        <div className="nav-links">
          <a href="#" className="nav-link active">Home</a>
          <a href="#" className="nav-link">Algorithms</a>
          <a href="#" className="nav-link">Data Structures</a>
          <a href="#" className="nav-link">About</a>
          <button className="theme-toggle" onClick={toggleTheme}>
            {isDarkMode ? (
              <span className="theme-icon">☀️ Light Mode</span>
            ) : (
              <span className="theme-icon">🌙 Dark Mode</span>
            )}
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;