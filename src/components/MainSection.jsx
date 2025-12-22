import React from "react";
import { 
  FaSortAmountUp, 
  FaSearch, 
  FaProjectDiagram, 
  FaTree, 
  FaLayerGroup, 
  FaStream, 
  FaBrain, 
  FaCode 
} from "react-icons/fa";

import FeatureCard from "./FeatureCard";
import "../styles/main.css";

const features = [
  { icon: <FaSortAmountUp />, title: "Sorting Algorithms", description: "Bubble, Selection, Insertion, Merge, Quick & more." },
  { icon: <FaSearch />, title: "Searching Algorithms", description: "Linear Search, Binary Search, Jump Search and more." },
  { icon: <FaProjectDiagram />, title: "Graph Algorithms", description: "BFS, DFS, Dijkstra, Minimum Spanning Tree." },
  { icon: <FaTree />, title: "Trees", description: "Binary Tree, BST, AVL, Heap visualizations." },
  { icon: <FaLayerGroup />, title: "Stack", description: "Learn push, pop and stack operations visually." },
  { icon: <FaStream />, title: "Queue", description: "Understand enqueue and dequeue operations step by step." },
  { icon: <FaBrain />, title: "Dynamic Programming", description: "Break problems into optimal sub-problems." },
  { icon: <FaCode />, title: "Step-by-Step Execution", description: "See every operation visually in real time." }
];

const MainSection = ({ setSelectedFeature }) => {
  return (
    <main className="main">
      {/* Hero Section */}
      <section className="hero">
        <h2>Visualize Data Structures & Algorithms</h2>
        <p>
          Visu-ALGO helps you understand complex algorithms through
          interactive visualizations. Learn faster by seeing how
          algorithms work step-by-step.
        </p>
        <div className="hero-buttons">
          <button>Start Learning</button>
          <button className="secondary">Explore Algorithms</button>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <h3>What You Can Learn</h3>
        <div className="feature-grid">
          {features.map((feature, index) => (
            <FeatureCard
              key={index}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
              onClick={() => setSelectedFeature(feature.title)}
            />
          ))}
        </div>
      </section>
    </main>
  );
};

export default MainSection;
