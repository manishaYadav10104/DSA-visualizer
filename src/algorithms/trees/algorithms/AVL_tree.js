import React, { useState, useEffect } from 'react';

class AVLNode {
  constructor(value, id) {
    this.value = value;
    this.id = id;
    this.height = 1;
    this.left = null;
    this.right = null;
  }
}

const AVLTree = ({ data }) => {
  const [positions, setPositions] = useState([]);

  const getHeight = (node) => node ? node.height : 0;
  
  const getBalance = (node) => node ? getHeight(node.left) - getHeight(node.right) : 0;

  const buildAVLTree = () => {
    if (!data || data.length === 0) return null;
    
    let root = null;
    
    data.forEach(nodeData => {
      root = insertAVLNode(root, nodeData.value, nodeData.id);
    });
    
    return root;
  };

  const insertAVLNode = (node, value, id) => {
    if (!node) return new AVLNode(value, id);

    if (value < node.value) {
      node.left = insertAVLNode(node.left, value, id);
    } else if (value > node.value) {
      node.right = insertAVLNode(node.right, value, id);
    } else {
      return node; // No duplicates
    }

    node.height = 1 + Math.max(getHeight(node.left), getHeight(node.right));
    const balance = getBalance(node);

    // Left Left
    if (balance > 1 && value < node.left.value) {
      return rotateRight(node);
    }
    
    // Right Right
    if (balance < -1 && value > node.right.value) {
      return rotateLeft(node);
    }
    
    // Left Right
    if (balance > 1 && value > node.left.value) {
      node.left = rotateLeft(node.left);
      return rotateRight(node);
    }
    
    // Right Left
    if (balance < -1 && value < node.right.value) {
      node.right = rotateRight(node.right);
      return rotateLeft(node);
    }

    return node;
  };

  const rotateRight = (y) => {
    const x = y.left;
    const T2 = x ? x.right : null;

    if (x) x.right = y;
    y.left = T2;

    y.height = Math.max(getHeight(y.left), getHeight(y.right)) + 1;
    if (x) x.height = Math.max(getHeight(x.left), getHeight(x.right)) + 1;

    return x || y;
  };

  const rotateLeft = (x) => {
    const y = x.right;
    const T2 = y ? y.left : null;

    if (y) y.left = x;
    x.right = T2;

    x.height = Math.max(getHeight(x.left), getHeight(x.right)) + 1;
    if (y) y.height = Math.max(getHeight(y.left), getHeight(y.right)) + 1;

    return y || x;
  };

  const calculatePositions = (node, x, y, level = 0, width = 200) => {
    if (!node) return [];
    
    const nodePos = {
      id: node.id,
      value: node.value,
      x,
      y,
      level,
      height: node.height,
      balance: getBalance(node),
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
    const root = buildAVLTree();
    if (root) {
      const pos = calculatePositions(root, 400, 50);
      setPositions(pos);
    } else {
      setPositions([]);
    }
  }, [data]);

  const getBalanceClass = (balance) => {
    if (balance > 1) return 'left-heavy';
    if (balance < -1) return 'right-heavy';
    if (balance > 0) return 'slightly-left';
    if (balance < 0) return 'slightly-right';
    return 'balanced';
  };

  return (
    <div className="tree-container">
      <svg width="800" height="500" className="avl-svg">
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
              className={`avl-node ${getBalanceClass(node.balance)}`}
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
              y={node.y + 30}
              textAnchor="middle"
              className="balance-text"
              fontSize="10"
            >
              h:{node.height}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
};

export default AVLTree;