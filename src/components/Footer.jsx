import React from "react";
import { useTheme } from "../context/ThemeContext";
import "../styles/footer.css";

const Footer = ({ setSelectedFeature }) => {
  const { isDarkMode } = useTheme();

  const handleNavigation = (feature) => {
    if (setSelectedFeature) {
      setSelectedFeature(feature);
    }
  };
// this is footer
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-content">
          <div className="footer-brand">
            <h3>VISU-ALGO</h3>
            <p>Interactive algorithm visualizer for learning data structures and algorithms</p>
          </div>
          <div className="footer-links">
            <div className="footer-section">
              <h4>Algorithms</h4>
              <button onClick={() => handleNavigation("sorting")}>Sorting</button>
              <button onClick={() => handleNavigation("searching")}>Searching</button>
              <button onClick={() => handleNavigation("graphs")}>Graph Algorithms</button>
              <button onClick={() => handleNavigation("trees")}>Tree Algorithms</button>
            </div>
            <div className="footer-section">
              <h4>Resources</h4>
              <button>Documentation</button>
              <button>Tutorials</button>
              <button>Examples</button>
              <button>Blog</button>
            </div>
            <div className="footer-section">
              <h4>Connect</h4>
              <button>GitHub</button>
              <button>Twitter</button>
              <button>LinkedIn</button>
              <button>Contact</button>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} VISU-ALGO. All rights reserved.</p>
          <p>Made with ❤️ for learners worldwide</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;