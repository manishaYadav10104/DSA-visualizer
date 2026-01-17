import React from "react";
import { useTheme } from "../context/ThemeContext";
import "../styles/navbar.css";

const Navbar = ({ setSelectedFeature }) => {
  const { isDarkMode, toggleTheme } = useTheme();

  const handleNavigation = (feature) => {
    if (setSelectedFeature) {
      setSelectedFeature(feature);
    }
  };

  return (
    <nav className="navbar">
      <div className="nav-container">
        <div className="logo" onClick={() => handleNavigation(null)}>
          <span className="logo-text">VISU-ALGO</span>
        </div>
        <div className="nav-links">
          <button 
            className="nav-link active" 
            onClick={() => handleNavigation(null)}
          >
            Home
          </button>
          <button 
            className="nav-link" 
            onClick={() => handleNavigation("sorting")}
          >
            Sorting Algorithms
          </button>
          <button 
            className="nav-link" 
            onClick={() => handleNavigation("searching")}
          >
            Searching Algorithms
          </button>
          <button className="nav-link">
            Data Structures
          </button>
          <button className="nav-link">
            About
          </button>
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