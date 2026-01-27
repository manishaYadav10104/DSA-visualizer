import React from 'react';

const BinaryTree = ({ data }) => {
  const buildBinaryTree = () => {
    if (!data || data.length === 0) return [];
    
    const positions = [];
    
    // Simple binary tree layout
    data.forEach((node, index) => {
      const level = Math.floor(Math.log2(index + 1));
      const positionInLevel = index + 1 - Math.pow(2, level);
      const totalInLevel = Math.pow(2, level);
      const spacing = 800 / (totalInLevel + 1);
      
      positions.push({
        id: node.id,
        value: node.value,
        x: (positionInLevel + 1) * spacing,
        y: level * 80 + 50,
        level: level,
        leftChildIndex: 2 * index + 1,
        rightChildIndex: 2 * index + 2
      });
    });
    
    return positions;
  };

  const nodes = buildBinaryTree();

  return (
    <div className="tree-container">
      <svg width="800" height="500" className="binary-tree-svg">
        {/* Draw connections */}
        {nodes.map(node => {
          const leftChild = nodes.find(n => n.id === data[node.leftChildIndex]?.id);
          const rightChild = nodes.find(n => n.id === data[node.rightChildIndex]?.id);
          
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
        {nodes.map(node => (
          <g key={node.id} className="tree-node">
            <circle
              cx={node.x}
              cy={node.y}
              r={25}
              className="binary-node"
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

export default BinaryTree;