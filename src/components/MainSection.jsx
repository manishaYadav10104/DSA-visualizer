import React from "react";
import { useTheme } from "../context/ThemeContext";
import FeatureCard from "./FeatureCard";
import "../styles/main.css";

const MainSection = ({ setSelectedFeature }) => {
  const { isDarkMode } = useTheme();
  
  const features = [
    {
      id: 1,
      title: "Sorting Algorithms",
      description: "Bubble, Selection, Insertion, Merge, Quick & more.",
      icon: "📊",
      color: "#FF6B6B"
    },
    {
      id: 2,
      title: "Searching Algorithms",
      description: "Linear Search, Binary Search, Jump Search and more.",
      icon: "🔍",
      color: "#4ECDC4"
    },
    {
      id: 3,
      title: "Graph Algorithms",
      description: "BFS, DFS, Dijkstra, Minimum Spanning Tree.",
      icon: "📈",
      color: "#45B7D1"
    },
    {
      id: 4,
      title: "Tree Algorithms",
      description: "Binary Tree, BST, AVL, Heap visualizations.",
      icon: "🌳",
      color: "#96CEB4"
    },
    {
      id: 5,
      title: "Stack Operations",
      description: "Learn push, pop and stack operations visually.",
      icon: "📚",
      color: "#FFEAA7"
    },
    {
      id: 6,
      title: "Queue Operations",
      description: "Understand enqueue and dequeue operations step by step.",
      icon: "📥",
      color: "#DDA0DD"
    }
  ];

  const handleCardClick = (featureId) => {
    if (typeof setSelectedFeature === 'function') {
      if (featureId === 1) {
        setSelectedFeature("sorting");
      }
      // Add more conditions for other features when you implement them
    }
  };

  return (
    <section className="main-section">
      <div className="section-container">
        <div className="section-header">
          <h2>What You Can Learn</h2>
          <p>Interactive visualizations for various algorithms and data structures</p>
        </div>
        
        <div className="features-grid">
          {features.map((feature) => (
            <FeatureCard
              key={feature.id}
              title={feature.title}
              description={feature.description}
              icon={feature.icon}
              color={feature.color}
              onClick={() => handleCardClick(feature.id)}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default MainSection;