import React from "react";
import { useTheme } from "../context/ThemeContext";
import "../styles/navbar.css";

const Navbar = ({ setSelectedFeature, selectedFeature }) => {
  const { isDarkMode, toggleTheme } = useTheme();

  const handleNavigation = (feature) => {
    if (setSelectedFeature) {
      setSelectedFeature(feature);
    }
  };

  // Helper function to check if a nav link is active
  const isActive = (feature) => {
    return selectedFeature === feature;
  };

  return (
    <nav className="navbar">
      <div className="nav-container">
        <div className="logo" onClick={() => handleNavigation(null)}>
          <span className="logo-text">VISU-ALGO</span>
        </div>
        <div className="nav-links">
          <button 
            className={`nav-link ${!selectedFeature ? "active" : ""}`} 
            onClick={() => handleNavigation(null)}
          >
            Home
          </button>
          <button 
            className={`nav-link ${isActive("sorting") ? "active" : ""}`} 
            onClick={() => handleNavigation("sorting")}
          >
            Sorting Algorithms
          </button>
          <button 
            className={`nav-link ${isActive("searching") ? "active" : ""}`} 
            onClick={() => handleNavigation("searching")}
          >
            Searching Algorithms
          </button>
          <button 
            className={`nav-link ${isActive("graphs") ? "active" : ""}`} 
            onClick={() => handleNavigation("graphs")}
          >
            Graph Algorithms
          </button>
          <button 
            className="nav-link"
            onClick={() => {
              // You can add a future "About" page or Data Structures page here
              alert("Coming soon: Data Structures and About pages!");
            }}
          >
            Data Structures
          </button>
          <button 
            className="nav-link"
            onClick={() => {
              // You can add a future "About" page here
              alert("Coming soon: About page!");
            }}
          >
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