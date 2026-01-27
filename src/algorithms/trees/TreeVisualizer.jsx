import React, { useState, useEffect } from "react";
import { useTheme } from "../../context/ThemeContext";
import BinaryTree from "./algorithms/binaryTree.js";
import BinarySearchTree from "./algorithms/binary_search_tree.js";
import AVLTree from "./algorithms/AVL_tree.js";
import "./tree.css";

const TreeVisualizer = ({ goBack }) => {
  const { isDarkMode } = useTheme();
  const [treeData, setTreeData] = useState([]);
  const [treeType, setTreeType] = useState("binary");
  const [selectedOperation, setSelectedOperation] = useState("insert");
  const [inputValue, setInputValue] = useState("");
  const [animationSpeed, setAnimationSpeed] = useState(300);
  const [isAnimating, setIsAnimating] = useState(false);
  const [traversalResult, setTraversalResult] = useState([]);

  const treeTypes = [
    { id: "binary", name: "Binary", icon: "🟦", color: "#4361ee" },
    { id: "bst", name: "BST", icon: "🟩", color: "#06d6a0" },
    { id: "avl", name: "AVL", icon: "🟪", color: "#7209b7" }
  ];

  const operations = [
    { id: "insert", name: "Insert", icon: "➕", color: "#4361ee" },
    { id: "search", name: "Search", icon: "🔍", color: "#06d6a0" },
    { id: "delete", name: "Delete", icon: "🗑️", color: "#ef476f" },
    { id: "traverse", name: "Traverse", icon: "🔄", color: "#ffd166" }
  ];

  const traversals = [
    { id: "inorder", name: "In-Order", description: "Left → Root → Right" },
    { id: "preorder", name: "Pre-Order", description: "Root → Left → Right" },
    { id: "postorder", name: "Post-Order", description: "Left → Right → Root" },
    { id: "levelorder", name: "Level-Order", description: "Level by Level" }
  ];

  const treeInfo = {
    binary: {
      name: "Binary Tree",
      description: "Each node has at most two children (left & right). No ordering constraints.",
      complexity: { search: "O(n)", insert: "O(1)", delete: "O(n)" },
      properties: ["Max 2 children per node", "No ordering constraint", "Simple structure"]
    },
    bst: {
      name: "Binary Search Tree",
      description: "Left child < Parent < Right child. Enables efficient searching.",
      complexity: { search: "O(log n)", insert: "O(log n)", delete: "O(log n)" },
      properties: ["Ordered structure", "Fast search operations", "Can become unbalanced"]
    },
    avl: {
      name: "AVL Tree",
      description: "Self-balancing BST. Height difference ≤ 1 for all nodes.",
      complexity: { search: "O(log n)", insert: "O(log n)", delete: "O(log n)" },
      properties: ["Self-balancing", "Guaranteed O(log n)", "Rotation operations"]
    }
  };

  // Initialize with sample data
  useEffect(() => {
    generateSampleTree();
  }, []);

  const generateSampleTree = () => {
    const values = [50, 25, 75, 15, 35, 65, 85, 10, 20, 30, 40, 60, 70, 80, 90];
    const newData = values.map((value, index) => ({
      id: Date.now() + index,
      value: value
    }));
    setTreeData(newData);
    setTraversalResult([]);
  };

  const generateRandomTree = () => {
    const count = Math.floor(Math.random() * 15) + 8;
    const newData = [];
    const usedValues = new Set();
    
    for (let i = 0; i < count; i++) {
      let value;
      do {
        value = Math.floor(Math.random() * 95) + 5;
      } while (usedValues.has(value));
      usedValues.add(value);
      
      newData.push({
        id: Date.now() + i,
        value: value
      });
    }
    
    setTreeData(newData);
    setTraversalResult([]);
  };

  const handleInsert = () => {
    if (!inputValue.trim()) return;
    
    const value = parseInt(inputValue);
    if (!isNaN(value) && value >= 1 && value <= 1000) {
      const newNode = {
        id: Date.now(),
        value: value
      };
      
      // Add animation effect
      setIsAnimating(true);
      setTimeout(() => {
        setTreeData(prev => [...prev, newNode]);
        setIsAnimating(false);
      }, animationSpeed);
      
      setInputValue("");
    }
  };

  const handleClear = () => {
    setIsAnimating(true);
    setTimeout(() => {
      setTreeData([]);
      setTraversalResult([]);
      setIsAnimating(false);
    }, 300);
  };

  const performTraversal = (traversalType) => {
    if (treeData.length === 0) return;
    
    const values = treeData.map(node => node.value).sort((a, b) => a - b);
    let result = [];
    
    switch(traversalType) {
      case "inorder":
        result = [...values];
        break;
      case "preorder":
        result = [values[Math.floor(values.length/2)], ...values.filter((_, i) => i !== Math.floor(values.length/2))];
        break;
      case "postorder":
        result = [...values.filter((_, i) => i !== Math.floor(values.length/2)), values[Math.floor(values.length/2)]];
        break;
      case "levelorder":
        result = values;
        break;
    }
    
    setTraversalResult(result);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleInsert();
    }
  };

  const getCurrentTreeComponent = () => {
    switch(treeType) {
      case "binary":
        return <BinaryTree data={treeData} />;
      case "bst":
        return <BinarySearchTree data={treeData} />;
      case "avl":
        return <AVLTree data={treeData} />;
      default:
        return <BinaryTree data={treeData} />;
    }
  };

  const calculateTreeStats = () => {
    const nodes = treeData.length;
    const height = nodes > 0 ? Math.ceil(Math.log2(nodes + 1)) : 0;
    const leaves = Math.ceil(nodes / 2);
    
    return { nodes, height, leaves };
  };

  const stats = calculateTreeStats();

  return (
    <div className={`tree-visualizer ${isDarkMode ? "dark" : "light"}`}>
      {/* Header */}
      <header className="tree-header">
        <div className="header-left">
          <button className="back-button" onClick={goBack}>
            <span className="back-icon">←</span>
            <span className="back-text">Home</span>
          </button>
          <div className="header-title">
            <h1>Tree Visualizer</h1>
            <p>Visualize tree structures in real-time</p>
          </div>
        </div>
        <div className="header-stats">
          <div className="stat-card">
            <div className="stat-value">{stats.nodes}</div>
            <div className="stat-label">Nodes</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.height}</div>
            <div className="stat-label">Height</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.leaves}</div>
            <div className="stat-label">Leaves</div>
          </div>
        </div>
      </header>

      <div className="main-content">
        {/* Left Sidebar - Tree Controls */}
        <aside className="tree-sidebar">
          {/* Tree Type Selector */}
          <div className="sidebar-section">
            <h3 className="section-title">
              <span className="title-icon">🌳</span>
              Tree Type
            </h3>
            <div className="tree-type-grid">
              {treeTypes.map(type => (
                <button
                  key={type.id}
                  className={`type-card ${treeType === type.id ? "active" : ""}`}
                  onClick={() => setTreeType(type.id)}
                  style={{ "--card-color": type.color }}
                >
                  <span className="type-icon">{type.icon}</span>
                  <span className="type-name">{type.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Operations */}
          <div className="sidebar-section">
            <h3 className="section-title">
              <span className="title-icon">⚡</span>
              Operations
            </h3>
            <div className="operations-grid">
              {operations.map(op => (
                <button
                  key={op.id}
                  className={`op-card ${selectedOperation === op.id ? "active" : ""}`}
                  onClick={() => setSelectedOperation(op.id)}
                  style={{ "--op-color": op.color }}
                >
                  <span className="op-icon">{op.icon}</span>
                  <span className="op-name">{op.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Node Input */}
          {selectedOperation === "insert" && (
            <div className="sidebar-section">
              <h3 className="section-title">
                <span className="title-icon">🎯</span>
                Add Node
              </h3>
              <div className="input-group">
                <div className="input-wrapper">
                  <input
                    type="number"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Enter value (1-1000)"
                    className="node-input"
                    min="1"
                    max="1000"
                  />
                  <button 
                    className="insert-button"
                    onClick={handleInsert}
                    disabled={isAnimating}
                  >
                    <span className="button-icon">+</span>
                    Add
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Speed Control */}
          <div className="sidebar-section">
            <h3 className="section-title">
              <span className="title-icon">⏱️</span>
              Speed Control
            </h3>
            <div className="speed-control">
              <div className="speed-labels">
                <span>Slow</span>
                <span className="speed-value">{animationSpeed}ms</span>
                <span>Fast</span>
              </div>
              <input
                type="range"
                min="50"
                max="1000"
                step="50"
                value={animationSpeed}
                onChange={(e) => setAnimationSpeed(parseInt(e.target.value))}
                className="speed-slider"
              />
            </div>
          </div>

          {/* Tree Actions */}
          <div className="sidebar-section">
            <h3 className="section-title">
              <span className="title-icon">🔄</span>
              Tree Actions
            </h3>
            <div className="action-buttons">
              <button 
                className="action-btn primary"
                onClick={generateRandomTree}
                disabled={isAnimating}
              >
                Random Tree
              </button>
              <button 
                className="action-btn secondary"
                onClick={generateSampleTree}
                disabled={isAnimating}
              >
                Sample Tree
              </button>
              <button 
                className="action-btn danger"
                onClick={handleClear}
                disabled={isAnimating}
              >
                Clear Tree
              </button>
            </div>
          </div>
        </aside>

        {/* Main Visualization Area */}
        <main className="visualization-main">
          {/* Tree Visualization */}
          <div className="tree-visualization-container">
            <div className="visualization-header">
              <h2>{treeInfo[treeType].name}</h2>
              <div className="visualization-controls">
                <span className={`status-indicator ${isAnimating ? "animating" : "idle"}`}>
                  <span className="status-dot"></span>
                  {isAnimating ? "Animating" : "Ready"}
                </span>
              </div>
            </div>
            
            <div className="tree-canvas">
              {getCurrentTreeComponent()}
              
              {treeData.length === 0 && (
                <div className="empty-tree-state">
                  <div className="empty-icon">🌱</div>
                  <h3>No Tree Yet</h3>
                  <p>Create a tree to start visualization</p>
                  <button 
                    className="empty-action-btn"
                    onClick={generateSampleTree}
                  >
                    Create Sample Tree
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Traversal Section */}
          <div className="traversal-section">
            <h3 className="section-title">
              <span className="title-icon">🔄</span>
              Tree Traversals
            </h3>
            <div className="traversal-buttons">
              {traversals.map(traversal => (
                <button
                  key={traversal.id}
                  className="traversal-btn"
                  onClick={() => performTraversal(traversal.id)}
                  disabled={treeData.length === 0}
                >
                  <span className="traversal-name">{traversal.name}</span>
                  <span className="traversal-desc">{traversal.description}</span>
                </button>
              ))}
            </div>
            
            {traversalResult.length > 0 && (
              <div className="traversal-result">
                <div className="result-header">
                  <span>Traversal Result:</span>
                </div>
                <div className="result-values">
                  {traversalResult.map((value, index) => (
                    <span key={index} className="result-value">
                      {value}
                      {index < traversalResult.length - 1 && " → "}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </main>

        {/* Right Sidebar - Tree Info */}
        <aside className="info-sidebar">
          {/* Current Tree Info */}
          <div className="info-card">
            <div className="card-header">
              <div className="card-icon" style={{ backgroundColor: treeTypes.find(t => t.id === treeType)?.color + "20" }}>
                <span>{treeTypes.find(t => t.id === treeType)?.icon}</span>
              </div>
              <h3>{treeInfo[treeType].name}</h3>
            </div>
            <p className="card-description">{treeInfo[treeType].description}</p>
            
            <div className="complexity-section">
              <h4>Time Complexity</h4>
              <div className="complexity-grid">
                <div className="complexity-item">
                  <span className="complexity-label">Search</span>
                  <code className="complexity-value">{treeInfo[treeType].complexity.search}</code>
                </div>
                <div className="complexity-item">
                  <span className="complexity-label">Insert</span>
                  <code className="complexity-value">{treeInfo[treeType].complexity.insert}</code>
                </div>
                <div className="complexity-item">
                  <span className="complexity-label">Delete</span>
                  <code className="complexity-value">{treeInfo[treeType].complexity.delete}</code>
                </div>
              </div>
            </div>

            <div className="properties-section">
              <h4>Properties</h4>
              <ul className="properties-list">
                {treeInfo[treeType].properties.map((prop, index) => (
                  <li key={index}>
                    <span className="property-bullet">•</span>
                    {prop}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Legend */}
          <div className="info-card">
            <div className="card-header">
              <div className="card-icon">🎨</div>
              <h3>Color Legend</h3>
            </div>
            <div className="legend-items">
              <div className="legend-item">
                <div className="legend-color binary"></div>
                <span>Binary Tree Node</span>
              </div>
              <div className="legend-item">
                <div className="legend-color bst"></div>
                <span>BST Node</span>
              </div>
              <div className="legend-item">
                <div className="legend-color avl"></div>
                <span>AVL Node</span>
              </div>
              <div className="legend-item">
                <div className="legend-color balanced"></div>
                <span>Balanced (AVL)</span>
              </div>
              <div className="legend-item">
                <div className="legend-color unbalanced"></div>
                <span>Unbalanced (AVL)</span>
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="info-card">
            <div className="card-header">
              <div className="card-icon">💡</div>
              <h3>How to Use</h3>
            </div>
            <ol className="instructions-list">
              <li>Select a tree type (Binary, BST, or AVL)</li>
              <li>Choose an operation (Insert, Search, etc.)</li>
              <li>Enter values or use tree actions</li>
              <li>Watch the tree visualization update</li>
              <li>Try different traversals to see order</li>
            </ol>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default TreeVisualizer;