import React, { useState, useEffect, useRef } from "react";
import { useTheme } from "../../context/ThemeContext";
import "./graph.css";

// Import algorithms from separate files
import BFS from "./algorithms/BFS";
import DFS from "./algorithms/DFS";
import Dijkstra from "./algorithms/Dijkstra";
import AStar from "./algorithms/AStar";

// Graph class for managing nodes and edges
class Graph {
  constructor() {
    this.nodes = new Map();
    this.edges = new Map();
    this.adjacency = new Map();
    this.walls = new Set();
    this.nodePositions = new Map();
  }

  addNode(id, x, y) {
    const node = { id, x, y };
    this.nodes.set(id, node);
    this.adjacency.set(id, []);
    this.nodePositions.set(id, { x, y });
    return node;
  }

  addEdge(from, to, weight) {
    // Add to edges list
    if (!this.edges.has(from)) this.edges.set(from, []);
    this.edges.get(from).push({ to, weight });
    
    // Add to adjacency list (both directions for undirected graph)
    this.adjacency.get(from).push({ node: to, weight });
    this.adjacency.get(to).push({ node: from, weight });
  }

  addWall(nodeId) {
    this.walls.add(nodeId);
  }

  removeWall(nodeId) {
    this.walls.delete(nodeId);
  }

  isWall(nodeId) {
    return this.walls.has(nodeId);
  }

  getNeighbors(nodeId) {
    return this.adjacency.get(nodeId) || [];
  }

  getAllNodes() {
    return Array.from(this.nodes.values());
  }

  getAllEdges() {
    const allEdges = [];
    for (const [from, edges] of this.edges) {
      for (const edge of edges) {
        allEdges.push({ from, to: edge.to, weight: edge.weight });
      }
    }
    return allEdges;
  }

  hasNode(nodeId) {
    return this.nodes.has(nodeId);
  }

  clear() {
    this.nodes.clear();
    this.edges.clear();
    this.adjacency.clear();
    this.walls.clear();
    this.nodePositions.clear();
  }
}

// Base search algorithm for visualization
class BaseGraphSearch {
  constructor() {
    this.isPaused = false;
    this.shouldStop = false;
  }

  setPauseState(paused) {
    this.isPaused = paused;
  }

  setStopState(stop) {
    this.shouldStop = stop;
  }

  reset() {
    this.isPaused = false;
    this.shouldStop = false;
  }

  async sleep(ms) {
    return new Promise(resolve => {
      setTimeout(resolve, ms);
    });
  }
}

const GraphVisualizer = ({ goBack }) => {
  const { isDarkMode } = useTheme();
  
  // Graph settings
  const [graphType, setGraphType] = useState('grid');
  const [rows, setRows] = useState(8);
  const [cols, setCols] = useState(8);
  const [numNodes, setNumNodes] = useState(12);
  const [obstacleRatio, setObstacleRatio] = useState(0.15);
  const [edgeProbability, setEdgeProbability] = useState(0.3);
  
  // Algorithm settings
  const [algorithm, setAlgorithm] = useState("bfs");
  const [startNode, setStartNode] = useState("");
  const [endNode, setEndNode] = useState("");
  const [speed, setSpeed] = useState(500);
  const [speedPreset, setSpeedPreset] = useState("slow");
  
  // Visualization state
  const [isVisualizing, setIsVisualizing] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [comparisonCount, setComparisonCount] = useState(0);
  const [pathFound, setPathFound] = useState(false);
  const [searchHistory, setSearchHistory] = useState([]);
  const [graphResult, setGraphResult] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [inputError, setInputError] = useState("");
  
  // Graph data
  const [graph, setGraph] = useState(new Graph());
  const [nodeStates, setNodeStates] = useState(new Map());
  const [currentPath, setCurrentPath] = useState([]);
  
  const canvasRef = useRef(null);
  const resultTimeoutRef = useRef(null);
  
  // Algorithm instances
  const [algorithms, setAlgorithms] = useState({
    bfs: null,
    dfs: null,
    dijkstra: null,
    astar: null
  });

  // Speed presets
  const speedPresets = {
    "very-slow": { value: 800, label: "Very Slow" },
    "slow": { value: 500, label: "Slow" },
    "medium": { value: 300, label: "Medium" },
    "fast": { value: 150, label: "Fast" },
    "very-fast": { value: 50, label: "Very Fast" }
  };

  // Initialize algorithms on mount
  useEffect(() => {
    setAlgorithms({
      bfs: new BFS(),
      dfs: new DFS(),
      dijkstra: new Dijkstra(),
      astar: new AStar()
    });
  }, []);

  // Initialize graph
  useEffect(() => {
    generateGraph();
    return () => {
      if (resultTimeoutRef.current) {
        clearTimeout(resultTimeoutRef.current);
      }
    };
  }, [graphType, rows, cols, numNodes, obstacleRatio, edgeProbability]);

  // Update speed when preset changes
  useEffect(() => {
    setSpeed(speedPresets[speedPreset].value);
  }, [speedPreset]);

  // Generate graph
  const generateGraph = () => {
    setIsGenerating(true);
    const newGraph = new Graph();
    const newNodeStates = new Map();
    
    if (graphType === 'grid') {
      // Generate grid graph
      const nodeSize = 60;
      const startX = 60;
      const startY = 60;
      
      // Create nodes
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const id = `N${r}-${c}`;
          const x = startX + c * nodeSize;
          const y = startY + r * nodeSize;
          newGraph.addNode(id, x, y);
          newNodeStates.set(id, 'unchecked');
          
          // Add walls randomly
          if (Math.random() < obstacleRatio && !(r === 0 && c === 0) && !(r === rows-1 && c === cols-1)) {
            newGraph.addWall(id);
          }
        }
      }
      
      // Create edges
      const directions = [[0, 1], [1, 0], [0, -1], [-1, 0]];
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const from = `N${r}-${c}`;
          if (newGraph.isWall(from)) continue;
          
          for (const [dr, dc] of directions) {
            const nr = r + dr;
            const nc = c + dc;
            if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
              const to = `N${nr}-${nc}`;
              if (newGraph.isWall(to)) continue;
              
              const weight = Math.floor(Math.random() * 9) + 1;
              newGraph.addEdge(from, to, weight);
            }
          }
        }
      }
      
      setStartNode('N0-0');
      setEndNode(`N${rows-1}-${cols-1}`);
    } else {
      // Generate random graph
      const centerX = 400;
      const centerY = 300;
      const radius = 200;
      
      // Create nodes in circular layout
      for (let i = 0; i < numNodes; i++) {
        const angle = (i / numNodes) * 2 * Math.PI;
        const x = centerX + radius * Math.cos(angle);
        const y = centerY + radius * Math.sin(angle);
        const id = `N${i}`;
        newGraph.addNode(id, x, y);
        newNodeStates.set(id, 'unchecked');
      }
      
      // Create random edges
      for (let i = 0; i < numNodes; i++) {
        for (let j = i + 1; j < numNodes; j++) {
          if (Math.random() < edgeProbability) {
            const from = `N${i}`;
            const to = `N${j}`;
            const weight = Math.floor(Math.random() * 9) + 1;
            newGraph.addEdge(from, to, weight);
          }
        }
      }
      
      setStartNode('N0');
      setEndNode(`N${numNodes - 1}`);
    }
    
    setGraph(newGraph);
    setNodeStates(newNodeStates);
    setCurrentPath([]);
    setComparisonCount(0);
    setPathFound(false);
    setSearchHistory([]);
    setGraphResult(null);
    setInputError("");
    setIsGenerating(false);
    
    setTimeout(() => {
      drawGraph();
    }, 100);
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
    
    const allNodes = graph.getAllNodes();
    const allEdges = graph.getAllEdges();
    
    // Draw edges first
    allEdges.forEach(edge => {
      const fromNode = graph.nodes.get(edge.from);
      const toNode = graph.nodes.get(edge.to);
      
      if (fromNode && toNode) {
        ctx.beginPath();
        ctx.moveTo(fromNode.x, fromNode.y);
        ctx.lineTo(toNode.x, toNode.y);
        ctx.strokeStyle = isDarkMode ? '#444' : '#ddd';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Draw weight
        const midX = (fromNode.x + toNode.x) / 2;
        const midY = (fromNode.y + toNode.y) / 2;
        
        ctx.fillStyle = isDarkMode ? '#1a1a2e' : '#fff';
        ctx.fillRect(midX - 12, midY - 8, 24, 16);
        
        ctx.fillStyle = isDarkMode ? '#fff' : '#333';
        ctx.font = 'bold 11px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(edge.weight.toString(), midX, midY);
      }
    });
    
    // Draw nodes
    allNodes.forEach(node => {
      const state = nodeStates.get(node.id) || 'unchecked';
      let color = '#3498db'; // Default blue
      let radius = 20;
      
      // Determine color based on state
      switch(state) {
        case 'current':
          color = '#feca57'; // Yellow
          radius = 24;
          break;
        case 'checking':
          color = '#ff6b6b'; // Red
          radius = 22;
          break;
        case 'visited':
          color = '#4ecdc4'; // Teal
          break;
        case 'found':
          color = '#2ecc71'; // Green
          radius = 22;
          break;
        case 'wall':
          color = '#2c3e50'; // Dark blue
          break;
        case 'start':
          color = '#27ae60'; // Green
          radius = 24;
          break;
        case 'end':
          color = '#e74c3c'; // Red
          radius = 24;
          break;
        default:
          color = '#3498db'; // Blue
      }
      
      // Special handling for start/end nodes
      if (node.id === startNode && state !== 'wall') {
        color = '#27ae60';
        radius = 24;
      } else if (node.id === endNode && state !== 'wall') {
        color = '#e74c3c';
        radius = 24;
      }
      
      // Draw node
      ctx.beginPath();
      ctx.arc(node.x, node.y, radius, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
      
      // Draw border
      ctx.strokeStyle = isDarkMode ? '#fff' : '#333';
      ctx.lineWidth = 2;
      ctx.stroke();
      
      // Draw node label
      ctx.fillStyle = 'white';
      ctx.font = 'bold 12px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(node.id.replace('N', ''), node.x, node.y);
    });
    
    // Draw path lines if found
    if (currentPath.length > 1) {
      ctx.strokeStyle = '#2ecc71';
      ctx.lineWidth = 3;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      
      currentPath.forEach((nodeId, index) => {
        const node = graph.nodes.get(nodeId);
        if (node) {
          if (index === 0) {
            ctx.moveTo(node.x, node.y);
          } else {
            ctx.lineTo(node.x, node.y);
          }
        }
      });
      
      ctx.stroke();
      ctx.setLineDash([]);
    }
  };

  // Highlight node during visualization
  const highlightNode = async (nodeId, state, message = "") => {
    if (!nodeId) return;
    
    setComparisonCount(prev => prev + 1);
    
    const newNodeStates = new Map(nodeStates);
    newNodeStates.set(nodeId, state);
    setNodeStates(newNodeStates);
    
    if (message && !isPaused) {
      setSearchHistory(prev => [...prev, { node: nodeId, action: state, value: message }]);
    }
    
    drawGraph();
    await new Promise(resolve => setTimeout(resolve, speed));
  };

  // Show result
  const showResult = (result, totalCost, visitedCount) => {
    clearResult();
    
    if (result && result.path) {
      setGraphResult({
        type: 'found',
        message: `✓ Found path from ${startNode} to ${endNode}`,
        pathLength: result.path.length,
        totalCost: totalCost,
        visitedCount: visitedCount
      });
      setPathFound(true);
      setCurrentPath(result.path);
    } else {
      setGraphResult({
        type: 'not-found',
        message: `✗ No path found from ${startNode} to ${endNode}`,
        visitedCount: visitedCount
      });
      setPathFound(false);
      setCurrentPath([]);
    }

    resultTimeoutRef.current = setTimeout(() => {
      setGraphResult(null);
    }, 8000);
    
    drawGraph();
  };

  const clearResult = () => {
    if (resultTimeoutRef.current) {
      clearTimeout(resultTimeoutRef.current);
    }
    setGraphResult(null);
  };

  // Handle speed change
  const handleSpeedChange = (e) => {
    const newSpeed = parseInt(e.target.value);
    setSpeed(newSpeed);
    
    // Find closest preset
    let closestPreset = "slow";
    let minDiff = Infinity;
    
    Object.entries(speedPresets).forEach(([preset, { value }]) => {
      const diff = Math.abs(value - newSpeed);
      if (diff < minDiff) {
        minDiff = diff;
        closestPreset = preset;
      }
    });
    
    setSpeedPreset(closestPreset);
  };

  // Start visualization
  const startVisualization = async () => {
    if (isVisualizing) return;
    
    if (!startNode || !endNode) {
      setInputError("Please set both start and end nodes");
      return;
    }
    
    if (!graph.nodes.has(startNode) || !graph.nodes.has(endNode)) {
      setInputError("Start or end node not found in graph");
      return;
    }
    
    if (graph.isWall(startNode) || graph.isWall(endNode)) {
      setInputError("Start or end node cannot be a wall");
      return;
    }
    
    setIsVisualizing(true);
    setIsPaused(false);
    setComparisonCount(0);
    setPathFound(false);
    setSearchHistory([]);
    setCurrentPath([]);
    clearResult();
    
    // Reset node states
    const newNodeStates = new Map();
    graph.getAllNodes().forEach(node => {
      if (graph.isWall(node.id)) {
        newNodeStates.set(node.id, 'wall');
      } else if (node.id === startNode) {
        newNodeStates.set(node.id, 'start');
      } else if (node.id === endNode) {
        newNodeStates.set(node.id, 'end');
      } else {
        newNodeStates.set(node.id, 'unchecked');
      }
    });
    setNodeStates(newNodeStates);
    
    // Get algorithm instance
    const algoInstance = algorithms[algorithm];
    if (!algoInstance) {
      setGraphResult({
        type: 'error',
        message: 'Algorithm not initialized'
      });
      setIsVisualizing(false);
      return;
    }
    
    // Create visualization wrapper for the algorithm
    const visualizer = new BaseGraphSearch();
    
    try {
      const history = [];
      const result = await executeAlgorithm(
        algoInstance,
        graph,
        startNode,
        endNode,
        visualizer,
        history
      );
      
      setSearchHistory(history);
      
      if (result) {
        showResult(result, result.cost, result.visitedCount);
      } else {
        showResult(null, 0, history.filter(h => h.action === 'visited').length);
      }
    } catch (error) {
      if (error.message === "Search stopped by user") {
        setGraphResult({
          type: 'stopped',
          message: '⏹ Visualization stopped by user'
        });
      } else {
        console.error("Visualization error:", error);
        setGraphResult({
          type: 'error',
          message: '❌ An error occurred during visualization'
        });
      }
    } finally {
      setIsVisualizing(false);
      setIsPaused(false);
    }
  };

  // Execute algorithm with visualization
  const executeAlgorithm = async (algorithm, graph, startNode, endNode, visualizer, history) => {
    // Map algorithm result to visualization format
    const result = algorithm.execute(startNode, endNode, {
      getAllNodes: () => graph.getAllNodes().map(n => n.id),
      getNeighbors: (nodeId) => graph.getNeighbors(nodeId),
      hasNode: (nodeId) => graph.hasNode(nodeId)
    });
    
    // Simulate visualization steps
    if (result) {
      return {
        path: result,
        cost: algorithm.totalCost || result.length,
        visitedCount: algorithm.visitedNodes || result.length
      };
    }
    
    return null;
  };

  // Toggle pause
  const togglePause = () => {
    if (!isVisualizing) return;
    
    const newPausedState = !isPaused;
    setIsPaused(newPausedState);
  };

  // Stop visualization
  const stopVisualization = () => {
    if (!isVisualizing) return;
    
    setIsVisualizing(false);
    setIsPaused(false);
  };

  // Reset visualization
  const resetVisualization = () => {
    stopVisualization();
    
    const newNodeStates = new Map();
    graph.getAllNodes().forEach(node => {
      if (graph.isWall(node.id)) {
        newNodeStates.set(node.id, 'wall');
      } else if (node.id === startNode) {
        newNodeStates.set(node.id, 'start');
      } else if (node.id === endNode) {
        newNodeStates.set(node.id, 'end');
      } else {
        newNodeStates.set(node.id, 'unchecked');
      }
    });
    
    setNodeStates(newNodeStates);
    setComparisonCount(0);
    setPathFound(false);
    setSearchHistory([]);
    setCurrentPath([]);
    clearResult();
    drawGraph();
  };

  // Handle canvas click for wall toggling
  const handleCanvasClick = (e) => {
    if (isVisualizing) return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const nodes = graph.getAllNodes();
    for (const node of nodes) {
      const distance = Math.sqrt(Math.pow(x - node.x, 2) + Math.pow(y - node.y, 2));
      
      if (distance <= 25 && node.id !== startNode && node.id !== endNode) {
        const newGraph = new Graph();
        
        // Copy all data from current graph
        graph.getAllNodes().forEach(n => {
          newGraph.addNode(n.id, n.x, n.y);
          if (graph.isWall(n.id)) newGraph.addWall(n.id);
        });
        
        graph.getAllEdges().forEach(edge => {
          newGraph.addEdge(edge.from, edge.to, edge.weight);
        });
        
        // Toggle wall
        if (newGraph.isWall(node.id)) {
          newGraph.removeWall(node.id);
        } else {
          newGraph.addWall(node.id);
        }
        
        setGraph(newGraph);
        
        // Update node states
        const newNodeStates = new Map();
        newGraph.getAllNodes().forEach(n => {
          if (newGraph.isWall(n.id)) {
            newNodeStates.set(n.id, 'wall');
          } else if (n.id === startNode) {
            newNodeStates.set(n.id, 'start');
          } else if (n.id === endNode) {
            newNodeStates.set(n.id, 'end');
          } else {
            newNodeStates.set(n.id, 'unchecked');
          }
        });
        
        setNodeStates(newNodeStates);
        drawGraph();
        break;
      }
    }
  };

  // Handle speed preset change
  const handleSpeedPresetChange = (preset) => {
    setSpeedPreset(preset);
    setSpeed(speedPresets[preset].value);
  };

  // Generate random start/end nodes
  const generateRandomNodes = () => {
    const nodes = graph.getAllNodes();
    const validNodes = nodes.filter(n => !graph.isWall(n.id));
    
    if (validNodes.length < 2) return;
    
    const randomStart = validNodes[Math.floor(Math.random() * validNodes.length)];
    let randomEnd;
    
    do {
      randomEnd = validNodes[Math.floor(Math.random() * validNodes.length)];
    } while (randomEnd.id === randomStart.id && validNodes.length > 1);
    
    setStartNode(randomStart.id);
    setEndNode(randomEnd.id);
    
    // Update node states
    const newNodeStates = new Map();
    graph.getAllNodes().forEach(node => {
      if (graph.isWall(node.id)) {
        newNodeStates.set(node.id, 'wall');
      } else if (node.id === randomStart.id) {
        newNodeStates.set(node.id, 'start');
      } else if (node.id === randomEnd.id) {
        newNodeStates.set(node.id, 'end');
      } else {
        newNodeStates.set(node.id, 'unchecked');
      }
    });
    
    setNodeStates(newNodeStates);
    drawGraph();
  };

  // Algorithm information
  const algorithmInfo = algorithms[algorithm] || { 
    name: 'Breadth-First Search',
    description: 'Explores graph level by level, guarantees shortest path in unweighted graphs.',
    timeComplexity: 'O(V + E)',
    spaceComplexity: 'O(V)',
    useCase: 'Unweighted graphs, finding shortest path'
  };

  // Redraw when state changes
  useEffect(() => {
    drawGraph();
  }, [nodeStates, currentPath, isDarkMode]);

  return (
    <div className="graph-page">
      <div className="graph-header">
        <button className="back-btn" onClick={goBack}>
          ← Back to Home
        </button>
        <div className="algorithm-title">
          <h1>{algorithmInfo.name}</h1>
          <p>Visualize graph traversal algorithms step by step</p>
        </div>
      </div>

      {/* Main Visualization Container */}
      <div className="main-visualization-container">
        <div className="container-header">
          <h2>Graph Algorithm Visualizer</h2>
          <div className="status-indicator">
            <div className={`status-dot ${isVisualizing ? (isPaused ? 'paused' : 'searching') : pathFound ? 'found' : 'idle'}`}></div>
            <span>
              {isVisualizing ? 
                (isPaused ? 'PAUSED' : 'VISUALIZING') : 
                pathFound ? 'PATH FOUND' : 'READY'}
            </span>
            {comparisonCount > 0 && (
              <span className="comparison-count">
                Comparisons: {comparisonCount}
              </span>
            )}
          </div>
        </div>

        <div className="container-content">
          {/* Left Panel - Controls */}
          <div className="controls-panel">
            <div className="input-section">
              <h3>Graph Configuration:</h3>
              <p>Select graph type and adjust parameters</p>
              
              <div className="graph-type-selector">
                <select 
                  value={graphType} 
                  onChange={(e) => setGraphType(e.target.value)}
                  disabled={isVisualizing || isGenerating}
                  className="graph-select"
                >
                  <option value="grid">Grid Graph</option>
                  <option value="random">Random Graph</option>
                </select>
              </div>
              
              {graphType === 'grid' ? (
                <>
                  <div className="config-item">
                    <label>Rows: {rows}</label>
                    <input
                      type="range"
                      min="4"
                      max="12"
                      value={rows}
                      onChange={(e) => setRows(parseInt(e.target.value))}
                      disabled={isVisualizing || isGenerating}
                    />
                    <div className="size-labels">
                      <span>Small</span>
                      <span>Medium</span>
                      <span>Large</span>
                    </div>
                  </div>
                  
                  <div className="config-item">
                    <label>Columns: {cols}</label>
                    <input
                      type="range"
                      min="4"
                      max="12"
                      value={cols}
                      onChange={(e) => setCols(parseInt(e.target.value))}
                      disabled={isVisualizing || isGenerating}
                    />
                  </div>
                  
                  <div className="config-item">
                    <label>Walls: {Math.round(obstacleRatio * 100)}%</label>
                    <input
                      type="range"
                      min="0"
                      max="0.3"
                      step="0.05"
                      value={obstacleRatio}
                      onChange={(e) => setObstacleRatio(parseFloat(e.target.value))}
                      disabled={isVisualizing || isGenerating}
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className="config-item">
                    <label>Nodes: {numNodes}</label>
                    <input
                      type="range"
                      min="8"
                      max="20"
                      value={numNodes}
                      onChange={(e) => setNumNodes(parseInt(e.target.value))}
                      disabled={isVisualizing || isGenerating}
                    />
                  </div>
                  
                  <div className="config-item">
                    <label>Edge Chance: {Math.round(edgeProbability * 100)}%</label>
                    <input
                      type="range"
                      min="0.1"
                      max="0.5"
                      step="0.05"
                      value={edgeProbability}
                      onChange={(e) => setEdgeProbability(parseFloat(e.target.value))}
                      disabled={isVisualizing || isGenerating}
                    />
                  </div>
                </>
              )}
              
              <div className="array-controls">
                <button 
                  className="array-btn generate-graph"
                  onClick={generateGraph}
                  disabled={isVisualizing || isGenerating}
                >
                  {isGenerating ? "Generating..." : "Generate Graph"}
                </button>
                <button 
                  className="array-btn random-nodes"
                  onClick={generateRandomNodes}
                  disabled={isVisualizing || graph.getAllNodes().length < 2}
                >
                  Random Nodes
                </button>
              </div>
              
              <div className="node-inputs">
                <div className="node-input-group">
                  <label>Start Node:</label>
                  <input
                    type="text"
                    value={startNode}
                    onChange={(e) => setStartNode(e.target.value)}
                    disabled={isVisualizing}
                    placeholder="e.g., N0-0 or N0"
                  />
                </div>
                
                <div className="node-input-group">
                  <label>End Node:</label>
                  <input
                    type="text"
                    value={endNode}
                    onChange={(e) => setEndNode(e.target.value)}
                    disabled={isVisualizing}
                    placeholder="e.g., N7-7 or N11"
                  />
                </div>
              </div>
              
              {inputError && <div className="input-error">{inputError}</div>}
              
              <div className="graph-info">
                <span className="info-badge">
                  {graph.getAllNodes().length} nodes
                </span>
                <span className="info-badge">
                  {graph.getAllEdges().length} edges
                </span>
                <span className="info-badge">
                  {Array.from(graph.walls).length} walls
                </span>
              </div>
            </div>

            <div className="algorithm-selector">
              <h3>Algorithm</h3>
              <div className="algorithm-badge">
                <strong>{algorithmInfo.name}</strong>
              </div>
              <select 
                value={algorithm} 
                onChange={(e) => setAlgorithm(e.target.value)}
                disabled={isVisualizing}
                className="algo-select"
              >
                <option value="bfs">Breadth-First Search (BFS)</option>
                <option value="dfs">Depth-First Search (DFS)</option>
                <option value="dijkstra">Dijkstra's Algorithm</option>
                <option value="astar">A* Search Algorithm</option>
              </select>
            </div>

            <div className="config-section">
              <div className="config-item">
                <label>Speed: {speed}ms</label>
                <input
                  type="range"
                  min="50"
                  max="1000"
                  value={speed}
                  onChange={handleSpeedChange}
                  disabled={isVisualizing}
                />
                <div className="speed-labels">
                  <span>Slow</span>
                  <span>Fast</span>
                </div>
                
                <div className="speed-presets">
                  <div className="preset-buttons">
                    {Object.entries(speedPresets).map(([preset, { label }]) => (
                      <button
                        key={preset}
                        className={`preset-btn ${speedPreset === preset ? 'active' : ''}`}
                        onClick={() => handleSpeedPresetChange(preset)}
                        disabled={isVisualizing}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="interaction-hint">
                <span className="hint-icon">💡</span>
                <span>Click on nodes to add/remove walls</span>
              </div>
            </div>

            <div className="performance-info">
              <h4>Performance</h4>
              <div className="performance-stats">
                <div className="stat-item">
                  <span className="stat-label">Comparisons:</span>
                  <span className="stat-value">{comparisonCount}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Steps:</span>
                  <span className="stat-value">{searchHistory.length}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Status:</span>
                  <span className={`stat-value ${pathFound ? 'found' : isVisualizing ? 'searching' : 'ready'}`}>
                    {pathFound ? 'Path Found' : isVisualizing ? 'Visualizing' : 'Ready'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel - Visualization */}
          <div className="visualization-panel">
            <div className="visualization-header">
              <h3>Graph Visualization</h3>
              <div className="control-buttons">
                <button 
                  className="control-btn reset-btn" 
                  onClick={resetVisualization}
                  disabled={isVisualizing}
                >
                  ↻ Reset
                </button>
                <button 
                  className="control-btn start-search" 
                  onClick={startVisualization}
                  disabled={isVisualizing || !startNode || !endNode}
                >
                  {isVisualizing ? "Visualizing..." : "Start Visualization"}
                </button>
                <button 
                  className="control-btn pause-btn"
                  onClick={togglePause}
                  disabled={!isVisualizing}
                >
                  {isPaused ? "▶ Resume" : "⏸ Pause"}
                </button>
                <button 
                  className="control-btn stop-btn"
                  onClick={stopVisualization}
                  disabled={!isVisualizing}
                >
                  ⏹ Stop
                </button>
              </div>
            </div>

            <div className="visualization-area">
              <div className="graph-container">
                {graphResult && (
                  <div className={`result-display ${graphResult.type}`}>
                    <div className="result-message">
                      {graphResult.message}
                    </div>
                    {graphResult.type === 'found' && (
                      <div className="result-details">
                        Path Length: <strong>{graphResult.pathLength}</strong> | 
                        Total Cost: <strong>{graphResult.totalCost}</strong> | 
                        Nodes Visited: <strong>{graphResult.visitedCount}</strong>
                      </div>
                    )}
                    {graphResult.type === 'not-found' && (
                      <div className="result-details">
                        Nodes Visited: <strong>{graphResult.visitedCount}</strong> | 
                        Click nodes to remove walls
                      </div>
                    )}
                  </div>
                )}
                
                <canvas 
                  className="graph-canvas" 
                  ref={canvasRef}
                  width={800}
                  height={500}
                  onClick={handleCanvasClick}
                  style={{ cursor: isVisualizing ? 'default' : 'pointer' }}
                />
              </div>

              <div className="legend">
                <div className="legend-item">
                  <div className="legend-color" style={{ backgroundColor: "#3498db" }}></div>
                  <span>Unchecked Node</span>
                </div>
                <div className="legend-item">
                  <div className="legend-color" style={{ backgroundColor: "#27ae60" }}></div>
                  <span>Start Node</span>
                </div>
                <div className="legend-item">
                  <div className="legend-color" style={{ backgroundColor: "#e74c3c" }}></div>
                  <span>End Node</span>
                </div>
                <div className="legend-item">
                  <div className="legend-color" style={{ backgroundColor: "#ff6b6b" }}></div>
                  <span>Checking (Current)</span>
                </div>
                <div className="legend-item">
                  <div className="legend-color" style={{ backgroundColor: "#4ecdc4" }}></div>
                  <span>Visited</span>
                </div>
                <div className="legend-item">
                  <div className="legend-color" style={{ backgroundColor: "#2ecc71" }}></div>
                  <span>Found (Path)</span>
                </div>
                <div className="legend-item">
                  <div className="legend-color" style={{ backgroundColor: "#2c3e50" }}></div>
                  <span>Wall/Obstacle</span>
                </div>
                <div className="legend-item">
                  <div className="legend-color" style={{ backgroundColor: "#feca57" }}></div>
                  <span>Edge Weight</span>
                </div>
              </div>

              {searchHistory.length > 0 && (
                <div className="search-history">
                  <div className="history-header">
                    <h4>Algorithm Steps</h4>
                    <span className="history-count">{searchHistory.length} steps</span>
                  </div>
                  <div className="history-steps">
                    {searchHistory.slice(-10).map((step, idx) => (
                      <div key={idx} className="history-step">
                        <span className="step-index">Step {searchHistory.length - 10 + idx + 1}:</span>
                        <span className="step-action">
                          {step.node} 
                          {step.action === 'start' ? ' (Start)' : 
                           step.action === 'explore' ? ' → Exploring' :
                           step.action === 'visited' ? ' ✓ Visited' :
                           step.action === 'found' ? ' 🎯 Target!' :
                           step.action === 'update' ? ' 📊 Updated' :
                           step.action === 'evaluate' ? ' ⚖ Evaluating' : ''}
                        </span>
                        {step.value && (
                          <span className="step-result">
                            {step.value}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Algorithm Info Section */}
        <div className="algorithm-info-section">
          <h3>About {algorithmInfo.name}</h3>
          <p>{algorithmInfo.description}</p>
          
          <div className="complexity-grid">
            <div className="complexity-card">
              <h4>Time Complexity</h4>
              <span className="complexity-value">{algorithmInfo.timeComplexity}</span>
            </div>
            <div className="complexity-card">
              <h4>Space Complexity</h4>
              <span className="complexity-value">{algorithmInfo.spaceComplexity}</span>
            </div>
            <div className="complexity-card">
              <h4>Sorted Required</h4>
              <span className="complexity-value">No</span>
            </div>
            <div className="complexity-card">
              <h4>Best Use Case</h4>
              <span className="complexity-value">{algorithmInfo.useCase}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GraphVisualizer;