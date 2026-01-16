import React from "react";
import { useTheme } from "../context/ThemeContext";
import "../styles/footer.css";

const Footer = () => {
  const { isDarkMode } = useTheme();

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
              <a href="#">Sorting</a>
              <a href="#">Searching</a>
              <a href="#">Graph</a>
              <a href="#">Trees</a>
            </div>
            <div className="footer-section">
              <h4>Resources</h4>
              <a href="#">Documentation</a>
              <a href="#">Tutorials</a>
              <a href="#">Examples</a>
              <a href="#">Blog</a>
            </div>
            <div className="footer-section">
              <h4>Connect</h4>
              <a href="#">GitHub</a>
              <a href="#">Twitter</a>
              <a href="#">LinkedIn</a>
              <a href="#">Contact</a>
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