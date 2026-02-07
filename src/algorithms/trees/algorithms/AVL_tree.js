import React from 'react';
import '../tree.css';

const AVLTree = ({ data = [] }) => {
  if (data.length === 0) {
    return (
      <div className="algorithm-container avl">
        <div className="algorithm-header">
          <h3>AVL Tree</h3>
          <div className="algorithm-stats">
            <span className="stat">Nodes: 0</span>
            <span className="stat">Height: 0</span>
            <span className="stat">Balance: 0</span>
          </div>
        </div>
        <div className="visualization-placeholder">
          <p>No nodes to display</p>
        </div>
      </div>
    );
  }

  const sortedData = [...data].sort((a, b) => a.value - b.value);
  
  const buildAVL = (arr, start, end, level = 0, xPos = { index: 0 }) => {
    if (start > end) return null;
    
    const mid = Math.floor((start + end) / 2);
    const balance = (mid % 3) - 1; // Simulated balance factor (-1, 0, 1)
    
    const node = {
      ...arr[mid],
      level,
      balance,
      x: xPos.index++ * 60 + 100,
      y: level * 80 + 50,
      left: null,
      right: null
    };
    
    node.left = buildAVL(arr, start, mid - 1, level + 1, xPos);
    node.right = buildAVL(arr, mid + 1, end, level + 1, xPos);
    
    return node;
  };

  const collectNodesAndEdges = (node, result = { nodes: [], edges: [] }) => {
    if (!node) return result;
    
    result.nodes.push(node);
    
    if (node.left) {
      result.edges.push({
        id: `${node.id}-left`,
        x1: node.x,
        y1: node.y,
        x2: node.left.x,
        y2: node.left.y
      });
      collectNodesAndEdges(node.left, result);
    }
    
    if (node.right) {
      result.edges.push({
        id: `${node.id}-right`,
        x1: node.x,
        y1: node.y,
        x2: node.right.x,
        y2: node.right.y
      });
      collectNodesAndEdges(node.right, result);
    }
    
    return result;
  };

  const xPos = { index: 0 };
  const root = buildAVL(sortedData, 0, sortedData.length - 1, 0, xPos);
  const { nodes, edges } = collectNodesAndEdges(root);
  const height = Math.ceil(Math.log2(data.length + 1));
  const balancedNodes = nodes.filter(n => Math.abs(n.balance) <= 1).length;

  return (
    <div className="algorithm-container avl">
      <div className="algorithm-header">
        <h3>AVL Tree</h3>
        <div className="algorithm-stats">
          <span className="stat">Nodes: {data.length}</span>
          <span className="stat">Height: {height}</span>
          <span className="stat">Balanced: {balancedNodes}</span>
        </div>
      </div>
      
      <div className="tree-visualization">
        <svg width="100%" height="350" className="tree-svg">
          {/* Draw edges */}
          {edges.map(edge => (
            <line
              key={edge.id}
              x1={edge.x1}
              y1={edge.y1}
              x2={edge.x2}
              y2={edge.y2}
              className="tree-edge"
            />
          ))}
          
          {/* Draw nodes with balance status */}
          {nodes.map(node => (
            <g key={node.id}>
              <circle
                cx={node.x}
                cy={node.y}
                r="20"
                className={`tree-node avl-node ${Math.abs(node.balance) <= 1 ? 'balanced' : 'unbalanced'}`}
              />
              <text
                x={node.x}
                y={node.y}
                textAnchor="middle"
                dy=".3em"
                className="node-value"
              >
                {node.value}
              </text>
              <text
                x={node.x}
                y={node.y + 15}
                textAnchor="middle"
                className="balance-text"
                fontSize="10"
              >
                BF: {node.balance}
              </text>
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
};

export default AVLTree;