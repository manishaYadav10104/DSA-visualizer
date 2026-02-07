import React from 'react';
import '../tree.css';

const BinarySearchTree = ({ data = [] }) => {
  if (data.length === 0) {
    return (
      <div className="algorithm-container bst">
        <div className="algorithm-header">
          <h3>Binary Search Tree</h3>
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

  // Build BST structure from sorted array
  const sortedData = [...data].sort((a, b) => a.value - b.value);
  
  const buildBST = (arr, start, end, level = 0, xPos = { index: 0 }) => {
    if (start > end) return null;
    
    const mid = Math.floor((start + end) / 2);
    const node = {
      ...arr[mid],
      level,
      x: xPos.index++ * 60 + 100,
      y: level * 80 + 50,
      left: null,
      right: null
    };
    
    node.left = buildBST(arr, start, mid - 1, level + 1, xPos);
    node.right = buildBST(arr, mid + 1, end, level + 1, xPos);
    
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
  const root = buildBST(sortedData, 0, sortedData.length - 1, 0, xPos);
  const { nodes, edges } = collectNodesAndEdges(root);
  const height = Math.ceil(Math.log2(data.length + 1));

  return (
    <div className="algorithm-container bst">
      <div className="algorithm-header">
        <h3>Binary Search Tree</h3>
        <div className="algorithm-stats">
          <span className="stat">Nodes: {data.length}</span>
          <span className="stat">Height: {height}</span>
          <span className="stat">Ordered: Yes</span>
        </div>
      </div>
      
      <div className="tree-visualization">
        <svg width="100%" height="350" className="tree-svg">
          {/* Draw edges first */}
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
          
          {/* Draw nodes */}
          {nodes.map(node => (
            <g key={node.id}>
              <circle
                cx={node.x}
                cy={node.y}
                r="20"
                className="tree-node bst-node"
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
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
};

export default BinarySearchTree;