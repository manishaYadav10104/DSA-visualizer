import React, { useState, useEffect } from 'react';

class BSTNode {
  constructor(value, id) {
    this.value = value;
    this.id = id;
    this.left = null;
    this.right = null;
  }
}

const BinarySearchTree = ({ data }) => {
  const [positions, setPositions] = useState([]);

  const buildBST = () => {
    if (!data || data.length === 0) return null;
    
    let root = null;
    
    data.forEach(nodeData => {
      root = insertBSTNode(root, nodeData.value, nodeData.id);
    });
    
    return root;
  };

  const insertBSTNode = (root, value, id) => {
    const newNode = new BSTNode(value, id);
    
    if (!root) return newNode;
    
    let current = root;
    let parent = null;
    
    while (current) {
      parent = current;
      if (value < current.value) {
        if (!current.left) {
          current.left = newNode;
          break;
        }
        current = current.left;
      } else {
        if (!current.right) {
          current.right = newNode;
          break;
        }
        current = current.right;
      }
    }
    
    return root;
  };

  const calculatePositions = (node, x, y, level = 0, width = 200) => {
    if (!node) return [];
    
    const nodePos = {
      id: node.id,
      value: node.value,
      x,
      y,
      level,
      left: node.left,
      right: node.right
    };
    
    const leftPositions = calculatePositions(
      node.left,
      x - width / (level + 2),
      y + 80,
      level + 1,
      width / 1.5
    );
    
    const rightPositions = calculatePositions(
      node.right,
      x + width / (level + 2),
      y + 80,
      level + 1,
      width / 1.5
    );
    
    return [nodePos, ...leftPositions, ...rightPositions];
  };

  useEffect(() => {
    const root = buildBST();
    if (root) {
      const pos = calculatePositions(root, 400, 50);
      setPositions(pos);
    } else {
      setPositions([]);
    }
  }, [data]);

  return (
    <div className="tree-container">
      <svg width="800" height="500" className="bst-svg">
        {/* Draw connections */}
        {positions.map(node => {
          const leftChild = positions.find(n => n.id === node.left?.id);
          const rightChild = positions.find(n => n.id === node.right?.id);
          
          return (
            <g key={`connections-${node.id}`}>
              {leftChild && (
                <line
                  x1={node.x}
                  y1={node.y}
                  x2={leftChild.x}
                  y2={leftChild.y}
                  className="tree-edge"
                  strokeWidth="2"
                />
              )}
              {rightChild && (
                <line
                  x1={node.x}
                  y1={node.y}
                  x2={rightChild.x}
                  y2={rightChild.y}
                  className="tree-edge"
                  strokeWidth="2"
                />
              )}
            </g>
          );
        })}
        
        {/* Draw nodes */}
        {positions.map(node => (
          <g key={node.id} className="tree-node">
            <circle
              cx={node.x}
              cy={node.y}
              r={25}
              className="bst-node"
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
  );
};

export default BinarySearchTree;