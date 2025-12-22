import React from "react";
import "../styles/card.css"; // you can reuse your existing card CSS

const FeatureCard = ({ icon, title, description, onClick }) => {
  return (
    <div className="card" onClick={onClick}>
      <div className="card-icon">{icon}</div>
      <h4>{title}</h4>
      <p>{description}</p>
    </div>
  );
};

export default FeatureCard;
