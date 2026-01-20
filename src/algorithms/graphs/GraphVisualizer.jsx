import React, { useState, useEffect, useRef } from 'react';
import BFS from './algorithms/BFS.js';
import Dijkstra from './algorithms/Dijkstra.js';
import DFS from './algorithms/DFS.js';
import AStar from './algorithms/AStar.js';
import './graph.css';


// Graph class implementation
class Graph {
  constructor() {
    this.nodes = new Set();
    this.edges = new Map();
    this.nodePositions = new Map();
    this.walls = new Set();
  }

  hasNode(node) {
    return this.nodes.has(node);
  }

  addNode(node, x, y) {
    this.nodes.add(node);
    if (!this.edges.has(node)) {
      this.edges.set(node, []);
    }
    if (x !== undefined && y !== undefined) {
      this.nodePositions.set(node, { x, y });
    }
    return { node, x, y };
  }

  addEdge(node1, node2, weight = 1, bidirectional = true) {
    if (!this.edges.has(node1)) this.edges.set(node1, []);
    if (!this.edges.has(node2)) this.edges.set(node2, []);
    
    this.edges.get(node1).push({ node: node2, weight });
    if (bidirectional) {
      this.edges.get(node2).push({ node: node1, weight });
    }
  }

  addWall(node) {
    this.walls.add(node);
  }

  removeWall(node) {
    this.walls.delete(node);
  }

  isWall(node) {
    return this.walls.has(node);
  }

  getNeighbors(node) {
    if (this.walls.has(node)) return [];
    const neighbors = this.edges.get(node) || [];
    return neighbors.filter(neighbor => !this.walls.has(neighbor.node));
  }

  getAllNodes() {
    return Array.from(this.nodes);
  }

  getAllEdges() {
    const edges = [];
    for (const [from, neighbors] of this.edges) {
      for (const neighbor of neighbors) {
        // Avoid duplicate edges in undirected graph
        if (!edges.some(e => e.from === neighbor.node && e.to === from)) {
          edges.push({ from, to: neighbor.node, weight: neighbor.weight });
        }
      }
    }
    return edges;
  }

  generateGrid(rows, cols, obstacleRatio = 0.2) {
    this.nodes.clear();
    this.edges.clear();
    this.nodePositions.clear();
    this.walls.clear();

    const nodes = [];
    const nodeSize = 40;
    const startX = 50;
    const startY = 50;

    // Create grid nodes
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const node = `${r}-${c}`;
        const x = startX + c * nodeSize;
        const y = startY + r * nodeSize;
        this.addNode(node, x, y);
        nodes.push({ node, x, y });

        // Randomly add walls based on obstacle ratio
        if (Math.random() < obstacleRatio && !(r === 0 && c === 0) && !(r === rows-1 && c === cols-1)) {
          this.addWall(node);
        }
      }
    }

    // Create edges (4-directional)
    const directions = [
      [0, 1, 'right'],   // right
      [1, 0, 'down'],    // down
      [0, -1, 'left'],   // left
      [-1, 0, 'up']      // up
    ];

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const node = `${r}-${c}`;
        
        for (const [dr, dc] of directions) {
          const newRow = r + dr;
          const newCol = c + dc;
          
          if (newRow >= 0 && newRow < rows && newCol >= 0 && newCol < cols) {
            const neighbor = `${newRow}-${newCol}`;
            // Don't create edges to/from walls
            if (!this.isWall(node) && !this.isWall(neighbor)) {
              const weight = Math.floor(Math.random() * 9) + 1; // 1-9
              this.addEdge(node, neighbor, weight);
            }
          }
        }
      }
    }

    return nodes;
  }

  generateRandom(numNodes, edgeProbability = 0.3) {
    this.nodes.clear();
    this.edges.clear();
    this.nodePositions.clear();
    this.walls.clear();

    const nodes = [];
    const centerX = 400;
    const centerY = 300;
    const radius = 250;

    // Create nodes in circular layout
    for (let i = 0; i < numNodes; i++) {
      const node = `N${i}`;
      const angle = (i / numNodes) * 2 * Math.PI;
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);
      this.addNode(node, x, y);
      nodes.push({ node, x, y });
    }

    // Create random edges
    for (let i = 0; i < numNodes; i++) {
      for (let j = i + 1; j < numNodes; j++) {
        if (Math.random() < edgeProbability) {
          const weight = Math.floor(Math.random() * 9) + 1; // 1-9
          this.addEdge(`N${i}`, `N${j}`, weight);
        }
      }
    }

    return nodes;
  }

  getNodePosition(node) {
    return this.nodePositions.get(node) || { x: 0, y: 0 };
  }
}

const GraphVisualizer = ({ goBack }) => {
  // State management
  const [graph, setGraph] = useState(new Graph());
  const [algorithm, setAlgorithm] = useState('bfs');
  const [graphType, setGraphType] = useState('grid');
  const [rows, setRows] = useState(10);
  const [cols, setCols] = useState(10);
  const [numNodes, setNumNodes] = useState(15);
  const [obstacleRatio, setObstacleRatio] = useState(0.2);
  const [edgeProbability, setEdgeProbability] = useState(0.3);
  const [startNode, setStartNode] = useState('0-0');
  const [endNode, setEndNode] = useState('9-9');
  const [speed, setSpeed] = useState('normal');
  const [isVisualizing, setIsVisualizing] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentStep, setCurrentStep] = useState(null);
  const [steps, setSteps] = useState([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [stats, setStats] = useState(null);
  const [hoveredNode, setHoveredNode] = useState(null);
  const [hoveredEdge, setHoveredEdge] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const [isDrawingWall, setIsDrawingWall] = useState(false);
  const [nodePositions, setNodePositions] = useState([]);

  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const graphInstance = useRef(new Graph());

  // Algorithms
  const algorithms = {
    bfs: new BFS(),
    dfs: new DFS(),
    dijkstra: new Dijkstra(),
    astar: new AStar()
  };

  // Speed settings
  const speedSettings = {
    slow: 1000,
    normal: 500,
    fast: 200,
    veryFast: 50
  };

  // Initialize
  useEffect(() => {
    generateNewGraph();
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  // Generate new graph
  const generateNewGraph = () => {
    let positions;
    
    if (graphType === 'grid') {
      positions = graphInstance.current.generateGrid(rows, cols, obstacleRatio);
      setStartNode('0-0');
      setEndNode(`${rows-1}-${cols-1}`);
    } else {
      positions = graphInstance.current.generateRandom(numNodes, edgeProbability);
      const nodes = graphInstance.current.getAllNodes();
      setStartNode('N0');
      setEndNode(`N${nodes.length - 1}`);
    }
    
    setNodePositions(positions);
    setCurrentStep(null);
    setSteps([]);
    setCurrentStepIndex(0);
    setStats(null);
    setIsVisualizing(false);
    setIsPaused(false);
    drawGraph();
  };

  // Handle algorithm visualization
  const visualizeAlgorithm = async () => {
    if (isVisualizing) return;
    
    setIsVisualizing(true);
    setIsPaused(false);
    const selectedAlgorithm = algorithms[algorithm];
    
    // Reset algorithm state
    selectedAlgorithm.reset();
    
    // Execute algorithm
    const path = selectedAlgorithm.execute(startNode, endNode, graphInstance.current);
    
    // Get steps for visualization
    const algorithmSteps = selectedAlgorithm.steps;
    setSteps(algorithmSteps);
    setCurrentStepIndex(0);
    setStats(selectedAlgorithm.getStats());
    
    if (algorithmSteps.length > 0) {
      setCurrentStep(algorithmSteps[0]);
      await visualizeSteps(algorithmSteps);
    }
  };

  // Visualize steps with animation
  const visualizeSteps = async (steps) => {
    for (let i = 1; i < steps.length; i++) {
      if (!isVisualizing || isPaused) break;
      
      setCurrentStepIndex(i);
      setCurrentStep(steps[i]);
      drawGraph();
      
      await new Promise(resolve => {
        animationRef.current = setTimeout(resolve, speedSettings[speed]);
      });
    }
    
    if (!isPaused) {
      setIsVisualizing(false);
    }
  };

  // Draw graph on canvas
  const drawGraph = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Set canvas size
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    
    const edges = graphInstance.current.getAllEdges();
    const nodes = graphInstance.current.getAllNodes();
    const walls = graphInstance.current.walls;
    
    // Draw edges first (so they appear behind nodes)
    edges.forEach(edge => {
      const fromPos = graphInstance.current.getNodePosition(edge.from);
      const toPos = graphInstance.current.getNodePosition(edge.to);
      
      if (fromPos && toPos) {
        // Draw edge line
        ctx.beginPath();
        ctx.moveTo(fromPos.x, fromPos.y);
        ctx.lineTo(toPos.x, toPos.y);
        ctx.strokeStyle = hoveredEdge === edge ? '#ff6b6b' : '#95a5a6';
        ctx.lineWidth = hoveredEdge === edge ? 3 : 2;
        ctx.lineCap = 'round';
        ctx.stroke();
        
        // Draw weight in middle of edge
        const midX = (fromPos.x + toPos.x) / 2;
        const midY = (fromPos.y + toPos.y) / 2;
        
        // Background for weight text
        ctx.fillStyle = 'white';
        ctx.fillRect(midX - 15, midY - 10, 30, 20);
        
        // Weight text
        ctx.fillStyle = '#2c3e50';
        ctx.font = 'bold 12px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(edge.weight.toString(), midX, midY);
      }
    });
    
    // Draw nodes
    nodes.forEach(node => {
      const pos = graphInstance.current.getNodePosition(node);
      if (!pos) return;
      
      let color = '#4a90e2'; // Default node color
      let radius = 15;
      let borderColor = '#2c3e50';
      let borderWidth = 2;
      
      // Check if node is a wall
      if (walls.has(node)) {
        color = '#2c3e50';
        radius = 16;
      }
      // Apply visualization colors
      else if (currentStep) {
        // Path nodes
        if (currentStep.path && currentStep.path.includes(node)) {
          color = '#2ecc71';
          radius = 18;
        }
        // Visited nodes
        else if (currentStep.visited && currentStep.visited.includes(node)) {
          color = '#e74c3c';
        }
        // Current node
        else if (currentStep.currentNode === node) {
          color = '#9b59b6';
          radius = 20;
        }
        // Nodes in queue/stack
        else if (currentStep.queue && currentStep.queue.includes(node)) {
          color = '#f39c12';
        }
        else if (currentStep.stack && currentStep.stack.includes(node)) {
          color = '#f39c12';
        }
        else if (currentStep.openSet && currentStep.openSet.includes(node)) {
          color = '#f39c12';
        }
      }
      
      // Start and end nodes
      if (node === startNode && !walls.has(node)) {
        color = '#27ae60';
        radius = 20;
        borderWidth = 3;
      } else if (node === endNode && !walls.has(node)) {
        color = '#e74c3c';
        radius = 20;
        borderWidth = 3;
      }
      
      // Hover effect
      if (node === hoveredNode) {
        radius += 3;
        borderColor = '#007bff';
        borderWidth = 3;
      }
      
      // Selected node
      if (node === selectedNode) {
        borderColor = '#007bff';
        borderWidth = 4;
      }
      
      // Draw node
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, radius, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
      
      // Draw border
      ctx.strokeStyle = borderColor;
      ctx.lineWidth = borderWidth;
      ctx.stroke();
      
      // Draw node label
      ctx.fillStyle = 'white';
      ctx.font = 'bold 12px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      let label = node;
      if (graphType === 'grid') {
        label = node.replace('-', ',');
      } else if (node.length > 4) {
        label = node.substring(0, 4);
      }
      
      ctx.fillText(label, pos.x, pos.y);
    });
    
    // Draw tooltip for hovered node
    if (hoveredNode) {
      const pos = graphInstance.current.getNodePosition(hoveredNode);
      const tooltipText = `${hoveredNode}${walls.has(hoveredNode) ? ' (Wall)' : ''}`;
      
      // Draw tooltip background
      ctx.fillStyle = 'rgba(44, 62, 80, 0.9)';
      const textWidth = ctx.measureText(tooltipText).width;
      const tooltipX = pos.x;
      const tooltipY = pos.y - 35;
      
      ctx.beginPath();
      ctx.roundRect(tooltipX - textWidth/2 - 10, tooltipY - 10, textWidth + 20, 25, 5);
      ctx.fill();
      
      // Draw tooltip text
      ctx.fillStyle = 'white';
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(tooltipText, tooltipX, tooltipY + 2);
      
      // Draw tooltip arrow
      ctx.beginPath();
      ctx.moveTo(tooltipX - 5, pos.y - 15);
      ctx.lineTo(tooltipX + 5, pos.y - 15);
      ctx.lineTo(tooltipX, pos.y - 10);
      ctx.closePath();
      ctx.fillStyle = 'rgba(44, 62, 80, 0.9)';
      ctx.fill();
    }
  };

  // Handle canvas clicks
  const handleCanvasClick = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Find clicked node
    const nodes = graphInstance.current.getAllNodes();
    for (const node of nodes) {
      const pos = graphInstance.current.getNodePosition(node);
      const distance = Math.sqrt((x - pos.x) ** 2 + (y - pos.y) ** 2);
      
      if (distance <= 20) { // Within node radius
        if (isDrawingWall) {
          // Toggle wall
          if (graphInstance.current.isWall(node)) {
            graphInstance.current.removeWall(node);
          } else if (node !== startNode && node !== endNode) {
            graphInstance.current.addWall(node);
          }
          drawGraph();
        } else {
          // Set as start or end node
          if (selectedNode === null) {
            setSelectedNode(node);
          } else if (selectedNode === node) {
            setSelectedNode(null);
          } else {
            // Set start/end based on selected node
            if (selectedNode === startNode || selectedNode === endNode) {
              if (selectedNode === startNode) {
                setStartNode(node);
              } else {
                setEndNode(node);
              }
            } else {
              // Create edge between selected nodes
              const weight = Math.floor(Math.random() * 9) + 1;
              graphInstance.current.addEdge(selectedNode, node, weight);
            }
            setSelectedNode(null);
          }
        }
        return;
      }
    }
    
    // Clicked on empty space
    setSelectedNode(null);
  };

  // Handle canvas hover
  const handleCanvasMouseMove = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Check nodes
    const nodes = graphInstance.current.getAllNodes();
    let foundNode = null;
    
    for (const node of nodes) {
      const pos = graphInstance.current.getNodePosition(node);
      const distance = Math.sqrt((x - pos.x) ** 2 + (y - pos.y) ** 2);
      
      if (distance <= 20) {
        foundNode = node;
        break;
      }
    }
    
    setHoveredNode(foundNode);
    
    // Check edges
    if (!foundNode) {
      const edges = graphInstance.current.getAllEdges();
      let foundEdge = null;
      
      for (const edge of edges) {
        const fromPos = graphInstance.current.getNodePosition(edge.from);
        const toPos = graphInstance.current.getNodePosition(edge.to);
        
        // Calculate distance from point to line segment
        const distance = pointToLineDistance(x, y, fromPos.x, fromPos.y, toPos.x, toPos.y);
        
        if (distance < 10) { // Within edge threshold
          foundEdge = edge;
          break;
        }
      }
      
      setHoveredEdge(foundEdge);
    } else {
      setHoveredEdge(null);
    }
    
    drawGraph();
  };

  // Helper function: distance from point to line segment
  const pointToLineDistance = (px, py, x1, y1, x2, y2) => {
    const A = px - x1;
    const B = py - y1;
    const C = x2 - x1;
    const D = y2 - y1;

    const dot = A * C + B * D;
    const lenSq = C * C + D * D;
    let param = -1;
    
    if (lenSq !== 0) {
      param = dot / lenSq;
    }

    let xx, yy;

    if (param < 0) {
      xx = x1;
      yy = y1;
    } else if (param > 1) {
      xx = x2;
      yy = y2;
    } else {
      xx = x1 + param * C;
      yy = y1 + param * D;
    }

    const dx = px - xx;
    const dy = py - yy;
    return Math.sqrt(dx * dx + dy * dy);
  };

  // Step controls
  const handleStepBack = () => {
    if (currentStepIndex > 0) {
      const newIndex = currentStepIndex - 1;
      setCurrentStepIndex(newIndex);
      setCurrentStep(steps[newIndex]);
      drawGraph();
    }
  };

  const handleStepForward = () => {
    if (currentStepIndex < steps.length - 1) {
      const newIndex = currentStepIndex + 1;
      setCurrentStepIndex(newIndex);
      setCurrentStep(steps[newIndex]);
      drawGraph();
    }
  };

  const handlePauseResume = () => {
    if (isVisualizing) {
      setIsPaused(!isPaused);
      if (!isPaused) {
        // Resume visualization
        visualizeSteps(steps.slice(currentStepIndex + 1));
      }
    }
  };

  const resetVisualization = () => {
    if (animationRef.current) {
      clearTimeout(animationRef.current);
    }
    setIsVisualizing(false);
    setIsPaused(false);
    setCurrentStep(null);
    setCurrentStepIndex(0);
    setSteps([]);
    setStats(null);
    drawGraph();
  };

  // Get algorithm info
  const getAlgorithmInfo = () => {
    const algo = algorithms[algorithm];
    return {
      name: algo.name,
      description: algo.description,
      complexity: algo.complexity
    };
  };

  // Update graph when settings change
  useEffect(() => {
    generateNewGraph();
  }, [graphType, rows, cols, numNodes, obstacleRatio, edgeProbability]);

  // Redraw graph when state changes
  useEffect(() => {
    drawGraph();
  }, [currentStep, hoveredNode, hoveredEdge, selectedNode, isDrawingWall]);

  const algoInfo = getAlgorithmInfo();

  return (
    <div className="graph-visualizer">
      <button className="back-btn" onClick={goBack}>
        ← Back to Home
      </button>
      
      <div className="graph-container">
        {/* Left Panel - Controls */}
        <div className="control-panel">
          <h3 className="control-title">Graph Controls</h3>
          
          <div className="controls-section">
            <div className="section-title">Graph Configuration</div>
            
            <div className="control-group">
              <label>Graph Type</label>
              <select 
                value={graphType} 
                onChange={(e) => setGraphType(e.target.value)}
                disabled={isVisualizing}
              >
                <option value="grid">Grid Graph</option>
                <option value="random">Random Graph</option>
              </select>
            </div>
            
            {graphType === 'grid' ? (
              <>
                <div className="control-group">
                  <label>Rows: <span className="range-value">{rows}</span></label>
                  <input 
                    type="range" 
                    min="5" 
                    max="20" 
                    value={rows}
                    onChange={(e) => setRows(parseInt(e.target.value))}
                    disabled={isVisualizing}
                  />
                  <div className="range-label">
                    <span>5</span>
                    <span>20</span>
                  </div>
                </div>
                
                <div className="control-group">
                  <label>Columns: <span className="range-value">{cols}</span></label>
                  <input 
                    type="range" 
                    min="5" 
                    max="20" 
                    value={cols}
                    onChange={(e) => setCols(parseInt(e.target.value))}
                    disabled={isVisualizing}
                  />
                  <div className="range-label">
                    <span>5</span>
                    <span>20</span>
                  </div>
                </div>
                
                <div className="control-group">
                  <label>Obstacles: <span className="range-value">{Math.round(obstacleRatio * 100)}%</span></label>
                  <input 
                    type="range" 
                    min="0" 
                    max="0.5" 
                    step="0.05"
                    value={obstacleRatio}
                    onChange={(e) => setObstacleRatio(parseFloat(e.target.value))}
                    disabled={isVisualizing}
                  />
                  <div className="range-label">
                    <span>0%</span>
                    <span>50%</span>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="control-group">
                  <label>Number of Nodes: <span className="range-value">{numNodes}</span></label>
                  <input 
                    type="range" 
                    min="5" 
                    max="30" 
                    value={numNodes}
                    onChange={(e) => setNumNodes(parseInt(e.target.value))}
                    disabled={isVisualizing}
                  />
                  <div className="range-label">
                    <span>5</span>
                    <span>30</span>
                  </div>
                </div>
                
                <div className="control-group">
                  <label>Edge Probability: <span className="range-value">{Math.round(edgeProbability * 100)}%</span></label>
                  <input 
                    type="range" 
                    min="0.1" 
                    max="0.8" 
                    step="0.05"
                    value={edgeProbability}
                    onChange={(e) => setEdgeProbability(parseFloat(e.target.value))}
                    disabled={isVisualizing}
                  />
                  <div className="range-label">
                    <span>10%</span>
                    <span>80%</span>
                  </div>
                </div>
              </>
            )}
          </div>
          
          <div className="controls-section">
            <div className="section-title">Algorithm Settings</div>
            
            <div className="control-group">
              <label>Algorithm</label>
              <select 
                value={algorithm} 
                onChange={(e) => setAlgorithm(e.target.value)}
                disabled={isVisualizing}
              >
                <option value="bfs">Breadth-First Search (BFS)</option>
                <option value="dfs">Depth-First Search (DFS)</option>
                <option value="dijkstra">Dijkstra's Algorithm</option>
                <option value="astar">A* Search Algorithm</option>
              </select>
            </div>
            
            <div className="control-group">
              <label>Start Node</label>
              <input 
                type="text" 
                value={startNode}
                onChange={(e) => setStartNode(e.target.value)}
                disabled={isVisualizing}
                placeholder={graphType === 'grid' ? "row-col" : "N0"}
              />
            </div>
            
            <div className="control-group">
              <label>End Node</label>
              <input 
                type="text" 
                value={endNode}
                onChange={(e) => setEndNode(e.target.value)}
                disabled={isVisualizing}
                placeholder={graphType === 'grid' ? "row-col" : "N14"}
              />
            </div>
            
            <div className="control-group">
              <label>Visualization Speed</label>
              <select 
                value={speed} 
                onChange={(e) => setSpeed(e.target.value)}
                disabled={isVisualizing}
              >
                <option value="slow">Slow</option>
                <option value="normal">Normal</option>
                <option value="fast">Fast</option>
                <option value="veryFast">Very Fast</option>
              </select>
            </div>
            
            <div className="control-group">
              <label>
                <input 
                  type="checkbox" 
                  checked={isDrawingWall}
                  onChange={(e) => setIsDrawingWall(e.target.checked)}
                  disabled={isVisualizing}
                />
                <span style={{ marginLeft: '8px' }}>Draw Walls Mode</span>
              </label>
              <small style={{ display: 'block', color: '#7f8c8d', marginTop: '5px' }}>
                Click on nodes to toggle walls (except start/end nodes)
              </small>
            </div>
          </div>
          
          <div className="control-buttons">
            <button 
              onClick={generateNewGraph}
              disabled={isVisualizing}
              className="control-btn generate-btn"
            >
              🔄 Generate Graph
            </button>
            
            <button 
              onClick={visualizeAlgorithm}
              disabled={isVisualizing}
              className="control-btn visualize-btn"
            >
              {isVisualizing ? '⏸️ Visualizing...' : '▶️ Visualize Algorithm'}
            </button>
            
            <button 
              onClick={handlePauseResume}
              disabled={!isVisualizing}
              className="control-btn reset-btn"
            >
              {isPaused ? '▶️ Resume' : '⏸️ Pause'}
            </button>
            
            <button 
              onClick={resetVisualization}
              className="control-btn step-btn"
            >
              🔄 Reset
            </button>
          </div>
        </div>
        
        {/* Right Panel - Visualization */}
        <div className="visualization-area">
          <div className="visualization-header">
            <h2 className="visualization-title">Graph Visualization</h2>
            <div className="algorithm-selector">
              {Object.keys(algorithms).map(algo => (
                <button
                  key={algo}
                  className={`algorithm-btn ${algorithm === algo ? 'active' : ''}`}
                  onClick={() => setAlgorithm(algo)}
                  disabled={isVisualizing}
                >
                  {algo.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
          
          <div 
            className="graph-canvas-container"
            onClick={handleCanvasClick}
            onMouseMove={handleCanvasMouseMove}
            onMouseLeave={() => {
              setHoveredNode(null);
              setHoveredEdge(null);
              drawGraph();
            }}
          >
            <canvas 
              className="graph-canvas" 
              ref={canvasRef}
              width={800}
              height={500}
            />
            
            {isVisualizing && (
              <div className="loading-overlay">
                <div className="loading-spinner"></div>
              </div>
            )}
          </div>
          
          {steps.length > 0 && (
            <div className="step-controls">
              <button 
                onClick={handleStepBack}
                disabled={currentStepIndex === 0 || isVisualizing}
                className="control-btn step-btn"
              >
                ⏮ Previous Step
              </button>
              <div className="step-counter">
                Step {currentStepIndex + 1} of {steps.length}
              </div>
              <button 
                onClick={handleStepForward}
                disabled={currentStepIndex === steps.length - 1 || isVisualizing}
                className="control-btn step-btn"
              >
                Next Step ⏭
              </button>
            </div>
          )}
        </div>
      </div>
      
      {/* Stats Panel */}
      <div className="stats-panel">
        <h3 className="stats-title">Algorithm Information</h3>
        
        <div className="algorithm-info">
          <h4 className="algorithm-name">{algoInfo.name}</h4>
          <p className="algorithm-description">{algoInfo.description}</p>
          <div className="algorithm-complexity">Time Complexity: {algoInfo.complexity}</div>
        </div>
        
        {stats && (
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-value">{stats.visitedNodes || 0}</div>
              <div className="stat-label">Nodes Visited</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{stats.pathLength || 0}</div>
              <div className="stat-label">Path Length</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{stats.totalCost || 0}</div>
              <div className="stat-label">Total Cost</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{stats.executionTime ? `${stats.executionTime.toFixed(2)}ms` : '0ms'}</div>
              <div className="stat-label">Execution Time</div>
            </div>
          </div>
        )}
      </div>
      
      {/* Legend */}
      <div className="legend">
        <h3 className="legend-title">Legend</h3>
        <div className="legend-items">
          <div className="legend-item">
            <div className="legend-color color-start"></div>
            <span className="legend-label">Start Node</span>
          </div>
          <div className="legend-item">
            <div className="legend-color color-end"></div>
            <span className="legend-label">End Node</span>
          </div>
          <div className="legend-item">
            <div className="legend-color color-visited"></div>
            <span className="legend-label">Visited Node</span>
          </div>
          <div className="legend-item">
            <div className="legend-color color-path"></div>
            <span className="legend-label">Path Node</span>
          </div>
          <div className="legend-item">
            <div className="legend-color color-current"></div>
            <span className="legend-label">Current Node</span>
          </div>
          <div className="legend-item">
            <div className="legend-color color-wall"></div>
            <span className="legend-label">Wall/Obstacle</span>
          </div>
        </div>
      </div>
      
      {/* Status Bar */}
      <div className="status-bar">
        <div className="status-info">
          <div className="status-item">
            <span className="status-label">Algorithm</span>
            <span className="status-value">{algoInfo.name}</span>
          </div>
          <div className="status-item">
            <span className="status-label">Status</span>
            <span className="status-value">
              {isVisualizing ? (isPaused ? 'Paused' : 'Visualizing') : 'Ready'}
            </span>
          </div>
          <div className="status-item">
            <span className="status-label">Speed</span>
            <span className="status-value">
              {speed.charAt(0).toUpperCase() + speed.slice(1)}
            </span>
          </div>
          <div className="status-item">
            <span className="status-label">Graph Type</span>
            <span className="status-value">
              {graphType === 'grid' ? `Grid (${rows}×${cols})` : `Random (${numNodes} nodes)`}
            </span>
          </div>
        </div>
        
        <div className="weather-info">
          <span className="weather-icon">☀️</span>
          <span className="weather-text">16°C Sunny</span>
        </div>
      </div>
    </div>
  );
};

export default GraphVisualizer;