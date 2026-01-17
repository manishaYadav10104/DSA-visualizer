import React from "react";
import "../styles/card.css";

const FeatureCard = ({ title, description, icon, color, onClick }) => {
  return (
    <div className="feature-card" onClick={onClick}>
      <div className="card-content">
        <div className="card-icon" style={{ backgroundColor: color }}>
          {icon}
        </div>
        <h3 className="card-title">{title}</h3>
        <p className="card-description">{description}</p>
        <button 
          className="card-button"
          style={{ backgroundColor: color }}
          onClick={(e) => {
            e.stopPropagation();
            if (typeof onClick === 'function') {
              onClick();
            }
          }}
        >
          Explore →
        </button>
      </div>
    </div>
  );
};

export default FeatureCard;