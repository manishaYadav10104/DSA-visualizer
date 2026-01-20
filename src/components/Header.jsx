import React from "react";
import { useTheme } from "../context/ThemeContext";
import "../styles/header.css";

const Header = ({ setSelectedFeature }) => {
  const { isDarkMode } = useTheme();

  const scrollToMainSection = () => {
    // If MainSection is already visible (when on homepage), just scroll to it
    const mainSection = document.querySelector('.main-section');
    if (mainSection) {
      mainSection.scrollIntoView({ behavior: 'smooth' });
    } else {
      // If not on homepage, set feature to null to show homepage with MainSection
      setSelectedFeature && setSelectedFeature(null);
      // Then scroll after a brief delay to ensure MainSection is rendered
      setTimeout(() => {
        const mainSection = document.querySelector('.main-section');
        if (mainSection) {
          mainSection.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    }
  };

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
            onClick={scrollToMainSection}
          >
            Start Learning
          </button>
          <button 
            className="btn btn-secondary"
            onClick={() => setSelectedFeature && setSelectedFeature("sorting")}
          >
            Start Sorting
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;