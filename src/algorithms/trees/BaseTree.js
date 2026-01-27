import React from 'react';
import './tree.css';

const BaseTree = ({ 
  title = "Tree Visualization", 
  description = "",
  children, 
  complexity = {
    search: "O(log n)",
    insert: "O(log n)", 
    delete: "O(log n)"
  }
}) => {
  return (
    <div className="base-tree">
      <div className="tree-header">
        <h2>{title}</h2>
        {description && <p className="tree-description">{description}</p>}
      </div>
      
      <div className="tree-content">
        {children}
      </div>
      
      <div className="tree-footer">
        {complexity && (
          <div className="complexity-info">
            <h4>Time Complexity:</h4>
            <div className="complexity-grid">
              <div className="complexity-item">
                <span className="complexity-label">Search:</span>
                <code className="complexity-value">{complexity.search}</code>
              </div>
              <div className="complexity-item">
                <span className="complexity-label">Insert:</span>
                <code className="complexity-value">{complexity.insert}</code>
              </div>
              <div className="complexity-item">
                <span className="complexity-label">Delete:</span>
                <code className="complexity-value">{complexity.delete}</code>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BaseTree;