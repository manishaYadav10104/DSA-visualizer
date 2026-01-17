import React from "react";
import { useTheme } from "../context/ThemeContext";
import "../styles/header.css";

const Header = ({ setSelectedFeature }) => {
  const { isDarkMode } = useTheme();

  return (
    <header className="header">
      <div className="hero-container">
        <h1 className="hero-title">VISU-ALGO</h1>
        <h2 className="hero-subtitle">Visualize Data Structures & Algorithms</h2>
        <p className="hero-description">
          Visu-ALGO helps you understand complex algorithms through interactive 
          visualizations. Learn faster by seeing how algorithms work step-by-step.
        </p>
        <div className="hero-buttons">
          <button 
            className="btn btn-primary"
            onClick={() => setSelectedFeature && setSelectedFeature("sorting")}
          >
            Start Learning
          </button>
          <button 
            className="btn btn-secondary"
            onClick={() => setSelectedFeature && setSelectedFeature("searching")}
          >
            Explore Algorithms
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;