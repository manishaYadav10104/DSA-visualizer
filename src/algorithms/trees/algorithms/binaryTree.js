import React from 'react';
import '../tree.css';

const BinaryTree = ({ data = [] }) => {
  if (data.length === 0) {
    return (
      <div className="algorithm-container binary-tree">
        <div className="algorithm-header">
          <h3>Binary Tree</h3>
          <div className="algorithm-stats">
            <span className="stat">Nodes: 0</span>
            <span className="stat">Height: 0</span>
          </div>
        </div>
        <div className="visualization-placeholder">
          <p>No nodes to display</p>
        </div>
      </div>
    );
  }

  const sortedData = [...data].sort((a, b) => a.value - b.value);
  const levels = Math.ceil(Math.log2(data.length + 1));
  
  const buildTreeNodes = () => {
    const nodes = [];
    const edges = [];
    
    // Simple binary tree layout
    for (let i = 0; i < sortedData.length; i++) {
      const level = Math.floor(Math.log2(i + 1));
      const posInLevel = i + 1 - Math.pow(2, level);
      const totalInLevel = Math.pow(2, level);
      
      const x = (posInLevel + 0.5) * (800 / totalInLevel);
      const y = level * 80 + 50;
      
      nodes.push(
        <g key={sortedData[i].id}>
          <circle
            cx={x}
            cy={y}
            r="20"
            className="tree-node binary-node"
          />
          <text
            x={x}
            y={y}
            textAnchor="middle"
            dy=".3em"
            className="node-value"
          >
            {sortedData[i].value}
          </text>
        </g>
      );
      
      // Draw edges to children
      if (2 * i + 1 < sortedData.length) {
        const childLevel = level + 1;
        const childPos = 2 * (posInLevel) + 0.5;
        const childTotal = Math.pow(2, childLevel);
        const childX = (childPos) * (800 / childTotal);
        const childY = childLevel * 80 + 50;
        
        edges.push(
          <line
            key={`edge-${i}-left`}
            x1={x}
            y1={y}
            x2={childX}
            y2={childY}
            className="tree-edge"
          />
        );
      }
      
      if (2 * i + 2 < sortedData.length) {
        const childLevel = level + 1;
        const childPos = 2 * (posInLevel) + 1.5;
        const childTotal = Math.pow(2, childLevel);
        const childX = (childPos) * (800 / childTotal);
        const childY = childLevel * 80 + 50;
        
        edges.push(
          <line
            key={`edge-${i}-right`}
            x1={x}
            y1={y}
            x2={childX}
            y2={childY}
            className="tree-edge"
          />
        );
      }
    }
    
    return [...edges, ...nodes];
  };

  return (
    <div className="algorithm-container binary-tree">
      <div className="algorithm-header">
        <h3>Binary Tree</h3>
        <div className="algorithm-stats">
          <span className="stat">Nodes: {data.length}</span>
          <span className="stat">Height: {levels}</span>
          <span className="stat">Max Children: 2</span>
        </div>
      </div>
      
      <div className="tree-visualization">
        <svg width="100%" height="350" className="tree-svg">
          {buildTreeNodes()}
        </svg>
      </div>
    </div>
  );
};

export default BinaryTree;