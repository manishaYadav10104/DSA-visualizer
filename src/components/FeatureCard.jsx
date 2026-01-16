import React, { useState } from "react";
import "../styles/card.css";

const FeatureCard = ({ title, description, icon, color, onClick }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async (e) => {
    e.preventDefault();
    if (typeof onClick === 'function' && !isLoading) {
      setIsLoading(true);
      try {
        await onClick();
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="feature-card" onClick={handleClick}>
      <div className="card-content">
        <div className="card-icon" style={{ backgroundColor: color }}>
          {icon}
        </div>
        <h3 className="card-title">{title}</h3>
        <p className="card-description">{description}</p>
        <button 
          className="card-button"
          style={{ backgroundColor: color }}
          onClick={handleClick}
          disabled={isLoading}
        >
          {isLoading ? (
            <span className="loading">Loading...</span>
          ) : (
            "Explore →"
          )}
        </button>
      </div>
    </div>
  );
};

export default FeatureCard;