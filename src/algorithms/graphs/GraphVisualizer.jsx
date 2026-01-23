import React, { useState, useEffect, useRef } from "react";
import { useTheme } from "../../context/ThemeContext";
import "./graph.css";

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
    if (!this.edges.has(from)) this.edges.set(from, []);
    this.edges.get(from).push({ to, weight });
    
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

// Simple algorithm implementations
class BFS {
  constructor() {
    this.name = 'Breadth-First Search';
    this.description = 'Explores graph level by level, guarantees shortest path in unweighted graphs.';
    this.timeComplexity = 'O(V + E)';
    this.spaceComplexity = 'O(V)';
    this.useCase = 'Unweighted graphs, finding shortest path';
  }
}

class DFS {
  constructor() {
    this.name = 'Depth-First Search';
    this.description = 'Explores as far as possible along each branch before backtracking.';
    this.timeComplexity = 'O(V + E)';
    this.spaceComplexity = 'O(V)';
    this.useCase = 'Maze solving, cycle detection, topological sort';
  }
}

class Dijkstra {
  constructor() {
    this.name = "Dijkstra's Algorithm";
    this.description = 'Finds shortest paths from source to all nodes in weighted graphs with non-negative weights.';
    this.timeComplexity = 'O((V + E) log V)';
    this.spaceComplexity = 'O(V)';
    this.useCase = 'Weighted graphs with non-negative edges';
  }
}

class AStar {
  constructor() {
    this.name = 'A* Search Algorithm';
    this.description = 'Optimized pathfinding using heuristics to guide search toward goal.';
    this.timeComplexity = 'O(b^d)';
    this.spaceComplexity = 'O(b^d)';
    this.useCase = 'Pathfinding in games, maps, robotics';
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
  const [speed, setSpeed] = useState(300);
  const [speedPreset, setSpeedPreset] = useState("medium");
  
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
  const visualizationActive = useRef(false);
  
  // Algorithm instances
  const algorithms = {
    bfs: new BFS(),
    dfs: new DFS(),
    dijkstra: new Dijkstra(),
    astar: new AStar()
  };

  // Speed presets
  const speedPresets = {
    "very-slow": { value: 800, label: "Very Slow" },
    "slow": { value: 500, label: "Slow" },
    "medium": { value: 300, label: "Medium" },
    "fast": { value: 150, label: "Fast" },
    "very-fast": { value: 50, label: "Very Fast" }
  };

  // Initialize graph
  useEffect(() => {
    generateGraph();
    return () => {
      if (resultTimeoutRef.current) {
        clearTimeout(resultTimeoutRef.current);
      }
      visualizationActive.current = false;
    };
  }, [graphType, rows, cols, numNodes, obstacleRatio, edgeProbability]);

  // Update speed when preset changes
  useEffect(() => {
    setSpeed(speedPresets[speedPreset].value);
  }, [speedPreset]);

  // Handle canvas resize
  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current) {
        drawGraph();
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Generate graph
  const generateGraph = () => {
    setIsGenerating(true);
    const newGraph = new Graph();
    const newNodeStates = new Map();
    
    if (graphType === 'grid') {
      // Calculate node size based on rows and columns
      const maxWidth = 700;
      const maxHeight = 400;
      const nodeSize = Math.min(
        maxWidth / (cols + 1),
        maxHeight / (rows + 1)
      );
      
      const startX = (maxWidth - (cols * nodeSize)) / 2;
      const startY = (maxHeight - (rows * nodeSize)) / 2;
      
      // Create nodes
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const id = `N${r}-${c}`;
          const x = startX + c * nodeSize;
          const y = startY + r * nodeSize;
          newGraph.addNode(id, x, y);
          newNodeStates.set(id, 'unchecked');
          
          // Add walls randomly (but not start and end nodes)
          if (Math.random() < obstacleRatio && 
              !(r === 0 && c === 0) && 
              !(r === rows-1 && c === cols-1)) {
            newGraph.addWall(id);
          }
        }
      }
      
      // Create edges (4-directional grid)
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
      // Random graph
      const centerX = 350;
      const centerY = 250;
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
    
    // Set initial node states
    const finalNodeStates = new Map();
    newGraph.getAllNodes().forEach(node => {
      if (newGraph.isWall(node.id)) {
        finalNodeStates.set(node.id, 'wall');
      } else if (node.id === startNode) {
        finalNodeStates.set(node.id, 'start');
      } else if (node.id === endNode) {
        finalNodeStates.set(node.id, 'end');
      } else {
        finalNodeStates.set(node.id, 'unchecked');
      }
    });
    
    setNodeStates(finalNodeStates);
    setCurrentPath([]);
    setComparisonCount(0);
    setPathFound(false);
    setSearchHistory([]);
    setGraphResult(null);
    setInputError("");
    setIsGenerating(false);
    
    // Draw graph after a short delay
    setTimeout(() => {
      drawGraph();
    }, 100);
  };

  // Draw graph on canvas
  const drawGraph = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    // Get container dimensions
    const container = canvas.parentElement;
    if (!container) return;
    
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;
    
    // Set canvas dimensions
    canvas.width = containerWidth;
    canvas.height = containerHeight;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    const allNodes = graph.getAllNodes();
    const allEdges = graph.getAllEdges();
    
    if (allNodes.length === 0) return;
    
    // Calculate bounds
    let minX = Infinity, maxX = -Infinity;
    let minY = Infinity, maxY = -Infinity;
    
    allNodes.forEach(node => {
      minX = Math.min(minX, node.x);
      maxX = Math.max(maxX, node.x);
      minY = Math.min(minY, node.y);
      maxY = Math.max(maxY, node.y);
    });
    
    // Add padding
    const padding = 60;
    const graphWidth = maxX - minX + padding * 2;
    const graphHeight = maxY - minY + padding * 2;
    
    // Calculate scaling to fit canvas
    const scaleX = canvas.width / graphWidth;
    const scaleY = canvas.height / graphHeight;
    const scale = Math.min(scaleX, scaleY);
    
    // Calculate offset to center the graph
    const offsetX = (canvas.width - (graphWidth * scale)) / 2;
    const offsetY = (canvas.height - (graphHeight * scale)) / 2;
    
    // Helper function to transform coordinates
    const transformX = (x) => offsetX + (x - minX + padding) * scale;
    const transformY = (y) => offsetY + (y - minY + padding) * scale;
    
    // Draw edges
    allEdges.forEach(edge => {
      const fromNode = graph.nodes.get(edge.from);
      const toNode = graph.nodes.get(edge.to);
      
      if (fromNode && toNode) {
        const x1 = transformX(fromNode.x);
        const y1 = transformY(fromNode.y);
        const x2 = transformX(toNode.x);
        const y2 = transformY(toNode.y);
        
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.strokeStyle = isDarkMode ? '#666' : '#999';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Draw weight
        const midX = (x1 + x2) / 2;
        const midY = (y1 + y2) / 2;
        
        ctx.fillStyle = isDarkMode ? '#1a1a2e' : '#fff';
        ctx.fillRect(midX - 15, midY - 10, 30, 20);
        
        ctx.fillStyle = isDarkMode ? '#fff' : '#333';
        ctx.font = 'bold 12px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(edge.weight.toString(), midX, midY);
      }
    });
    
    // Draw nodes
    allNodes.forEach(node => {
      const state = nodeStates.get(node.id) || 'unchecked';
      const x = transformX(node.x);
      const y = transformY(node.y);
      
      let color = '#3498db';
      let radius = 20 * scale;
      
      // Special handling for start and end nodes
      if (node.id === startNode) {
        color = '#27ae60';
        radius = 25 * scale;
      } else if (node.id === endNode) {
        color = '#e74c3c';
        radius = 25 * scale;
      } else {
        switch(state) {
          case 'current':
            color = '#feca57';
            radius = 25 * scale;
            break;
          case 'checking':
            color = '#ff6b6b';
            radius = 22 * scale;
            break;
          case 'visited':
            color = '#4ecdc4';
            break;
          case 'found':
            color = '#2ecc71';
            radius = 22 * scale;
            break;
          case 'wall':
            color = '#2c3e50';
            break;
          default:
            color = '#3498db';
        }
      }
      
      // Ensure minimum radius
      radius = Math.max(radius, 10);
      
      // Draw node
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
      
      // Draw border
      ctx.strokeStyle = isDarkMode ? '#fff' : '#333';
      ctx.lineWidth = 2;
      ctx.stroke();
      
      // Draw node label
      ctx.fillStyle = 'white';
      ctx.font = `bold ${Math.max(10, 12 * scale)}px Arial`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const label = node.id.replace('N', '');
      ctx.fillText(label, x, y);
    });
    
    // Draw path if found
    if (currentPath.length > 1) {
      ctx.strokeStyle = '#2ecc71';
      ctx.lineWidth = 4;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      
      currentPath.forEach((nodeId, index) => {
        const node = graph.nodes.get(nodeId);
        if (node) {
          const x = transformX(node.x);
          const y = transformY(node.y);
          
          if (index === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
      });
      
      ctx.stroke();
      ctx.setLineDash([]);
    }
  };

  // Highlight node during visualization
  const highlightNode = async (nodeId, state, message = "") => {
    if (!nodeId || nodeId === startNode || nodeId === endNode) {
      return;
    }
    
    if (!visualizationActive.current) return;
    
    setComparisonCount(prev => prev + 1);
    
    const newNodeStates = new Map(nodeStates);
    newNodeStates.set(nodeId, state);
    setNodeStates(newNodeStates);
    
    if (message) {
      setSearchHistory(prev => [...prev.slice(-19), { 
        node: nodeId, 
        action: state, 
        value: message 
      }]);
    }
    
    drawGraph();
    
    // Wait for the specified speed, but check for pause/stop
    const startTime = Date.now();
    while (Date.now() - startTime < speed) {
      if (!visualizationActive.current || isPaused) {
        await new Promise(resolve => setTimeout(resolve, 100));
        continue;
      }
      await new Promise(resolve => setTimeout(resolve, 10));
    }
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
      resultTimeoutRef.current = null;
    }
  };

  // Handle speed change
  const handleSpeedChange = (e) => {
    const newSpeed = parseInt(e.target.value);
    setSpeed(newSpeed);
    
    // Find closest preset
    let closestPreset = "medium";
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

  // Algorithm implementations
  const runBFS = async () => {
    const queue = [{ node: startNode, cost: 0, path: [startNode] }];
    const visited = new Set([startNode]);
    let visitedCount = 1;
    
    while (queue.length > 0 && visualizationActive.current) {
      // Handle pause
      while (isPaused && visualizationActive.current) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      if (!visualizationActive.current) break;
      
      const { node: current, cost, path } = queue.shift();
      
      // Mark current node
      await highlightNode(current, 'current', `Exploring ${current}`);
      
      // Check if we found the target
      if (current === endNode) {
        return { path, totalCost: cost, visitedCount };
      }
      
      // Explore neighbors
      const neighbors = graph.getNeighbors(current);
      for (const neighbor of neighbors) {
        if (!visualizationActive.current) break;
        
        const neighborId = neighbor.node;
        const weight = neighbor.weight || 1;
        
        // Skip walls and visited nodes
        if (graph.isWall(neighborId) || visited.has(neighborId)) continue;
        
        visited.add(neighborId);
        visitedCount++;
        
        // Mark as checking
        await highlightNode(neighborId, 'checking', `Found ${neighborId}`);
        
        // Add to queue
        queue.push({
          node: neighborId,
          cost: cost + weight,
          path: [...path, neighborId]
        });
      }
      
      // Mark as visited
      await highlightNode(current, 'visited', `Visited ${current}`);
    }
    
    return null;
  };

  const runDFS = async () => {
    const stack = [{ node: startNode, cost: 0, path: [startNode] }];
    const visited = new Set([startNode]);
    let visitedCount = 1;
    
    while (stack.length > 0 && visualizationActive.current) {
      // Handle pause
      while (isPaused && visualizationActive.current) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      if (!visualizationActive.current) break;
      
      const { node: current, cost, path } = stack.pop();
      
      // Mark current node
      await highlightNode(current, 'current', `Exploring ${current}`);
      
      // Check if we found the target
      if (current === endNode) {
        return { path, totalCost: cost, visitedCount };
      }
      
      // Explore neighbors
      const neighbors = graph.getNeighbors(current);
      for (const neighbor of neighbors) {
        if (!visualizationActive.current) break;
        
        const neighborId = neighbor.node;
        const weight = neighbor.weight || 1;
        
        // Skip walls and visited nodes
        if (graph.isWall(neighborId) || visited.has(neighborId)) continue;
        
        visited.add(neighborId);
        visitedCount++;
        
        // Mark as checking
        await highlightNode(neighborId, 'checking', `Found ${neighborId}`);
        
        // Add to stack
        stack.push({
          node: neighborId,
          cost: cost + weight,
          path: [...path, neighborId]
        });
      }
      
      // Mark as visited
      await highlightNode(current, 'visited', `Visited ${current}`);
    }
    
    return null;
  };

  const runDijkstra = async () => {
    const distances = new Map();
    const visited = new Set();
    const previous = new Map();
    const unvisited = new Set();
    
    // Initialize distances
    graph.getAllNodes().forEach(node => {
      if (!graph.isWall(node.id)) {
        distances.set(node.id, Infinity);
        unvisited.add(node.id);
      }
    });
    
    distances.set(startNode, 0);
    previous.set(startNode, null);
    let visitedCount = 0;
    
    while (unvisited.size > 0 && visualizationActive.current) {
      // Handle pause
      while (isPaused && visualizationActive.current) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      if (!visualizationActive.current) break;
      
      // Find node with smallest distance
      let current = null;
      let minDistance = Infinity;
      
      for (const nodeId of unvisited) {
        const dist = distances.get(nodeId);
        if (dist < minDistance) {
          minDistance = dist;
          current = nodeId;
        }
      }
      
      if (!current || minDistance === Infinity) break;
      
      // Mark current node
      await highlightNode(current, 'current', `Dist: ${minDistance}`);
      
      // Check if we found the target
      if (current === endNode) {
        // Reconstruct path
        const path = [];
        let node = endNode;
        while (node !== null) {
          path.unshift(node);
          node = previous.get(node);
        }
        return { path, totalCost: minDistance, visitedCount };
      }
      
      unvisited.delete(current);
      visited.add(current);
      visitedCount++;
      
      // Update neighbors
      const neighbors = graph.getNeighbors(current);
      for (const neighbor of neighbors) {
        if (!visualizationActive.current) break;
        
        const neighborId = neighbor.node;
        const weight = neighbor.weight || 1;
        
        if (graph.isWall(neighborId) || visited.has(neighborId)) continue;
        
        const alt = minDistance + weight;
        if (alt < distances.get(neighborId)) {
          distances.set(neighborId, alt);
          previous.set(neighborId, current);
          await highlightNode(neighborId, 'checking', `New dist: ${alt}`);
        }
      }
      
      // Mark as visited
      await highlightNode(current, 'visited', `Processed ${current}`);
    }
    
    return null;
  };

  const runAStar = async () => {
    const openSet = new Set([startNode]);
    const cameFrom = new Map();
    const gScore = new Map();
    const fScore = new Map();
    
    // Initialize scores
    graph.getAllNodes().forEach(node => {
      if (!graph.isWall(node.id)) {
        gScore.set(node.id, Infinity);
        fScore.set(node.id, Infinity);
      }
    });
    
    gScore.set(startNode, 0);
    
    // Heuristic function (Euclidean distance)
    const heuristic = (nodeId) => {
      const nodeA = graph.nodes.get(nodeId);
      const nodeB = graph.nodes.get(endNode);
      if (!nodeA || !nodeB) return 0;
      
      const dx = nodeA.x - nodeB.x;
      const dy = nodeA.y - nodeB.y;
      return Math.sqrt(dx * dx + dy * dy) / 100;
    };
    
    fScore.set(startNode, heuristic(startNode));
    let visitedCount = 0;
    
    while (openSet.size > 0 && visualizationActive.current) {
      // Handle pause
      while (isPaused && visualizationActive.current) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      if (!visualizationActive.current) break;
      
      // Find node with lowest fScore
      let current = null;
      let lowestFScore = Infinity;
      
      for (const nodeId of openSet) {
        const score = fScore.get(nodeId);
        if (score < lowestFScore) {
          lowestFScore = score;
          current = nodeId;
        }
      }
      
      if (!current) break;
      
      // Mark current node
      await highlightNode(current, 'current', `fScore: ${lowestFScore.toFixed(1)}`);
      
      // Check if we found the target
      if (current === endNode) {
        // Reconstruct path
        const path = [endNode];
        let node = endNode;
        while (cameFrom.has(node)) {
          node = cameFrom.get(node);
          path.unshift(node);
        }
        return { path, totalCost: gScore.get(endNode), visitedCount };
      }
      
      openSet.delete(current);
      visitedCount++;
      
      // Explore neighbors
      const neighbors = graph.getNeighbors(current);
      for (const neighbor of neighbors) {
        if (!visualizationActive.current) break;
        
        const neighborId = neighbor.node;
        const weight = neighbor.weight || 1;
        
        if (graph.isWall(neighborId)) continue;
        
        const tentativeGScore = gScore.get(current) + weight;
        
        if (tentativeGScore < gScore.get(neighborId)) {
          cameFrom.set(neighborId, current);
          gScore.set(neighborId, tentativeGScore);
          fScore.set(neighborId, tentativeGScore + heuristic(neighborId));
          
          if (!openSet.has(neighborId)) {
            openSet.add(neighborId);
            await highlightNode(neighborId, 'checking', `fScore: ${fScore.get(neighborId).toFixed(1)}`);
          }
        }
      }
      
      // Mark as visited
      await highlightNode(current, 'visited', `Processed ${current}`);
    }
    
    return null;
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
    
    // Reset visualization state
    setIsVisualizing(true);
    setIsPaused(false);
    setComparisonCount(0);
    setPathFound(false);
    setSearchHistory([]);
    setCurrentPath([]);
    clearResult();
    visualizationActive.current = true;
    
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
    
    // Redraw graph
    drawGraph();
    
    // Wait a bit before starting
    await new Promise(resolve => setTimeout(resolve, 500));
    
    try {
      let result;
      
      // Run selected algorithm
      switch (algorithm) {
        case 'bfs':
          result = await runBFS();
          break;
        case 'dfs':
          result = await runDFS();
          break;
        case 'dijkstra':
          result = await runDijkstra();
          break;
        case 'astar':
          result = await runAStar();
          break;
        default:
          result = await runBFS();
      }
      
      if (result && visualizationActive.current) {
        // Animate the found path
        for (const nodeId of result.path) {
          if (!visualizationActive.current) break;
          if (nodeId !== startNode && nodeId !== endNode) {
            await highlightNode(nodeId, 'found', `Path node`);
          }
        }
        
        showResult(result, result.totalCost, result.visitedCount || searchHistory.length);
      } else if (visualizationActive.current) {
        showResult(null, 0, searchHistory.length);
      }
    } catch (error) {
      console.error("Visualization error:", error);
      if (visualizationActive.current) {
        setGraphResult({
          type: 'error',
          message: '❌ An error occurred during visualization'
        });
      }
    } finally {
      setIsVisualizing(false);
      setIsPaused(false);
      visualizationActive.current = false;
    }
  };

  // Toggle pause
  const togglePause = () => {
    if (!isVisualizing) return;
    setIsPaused(!isPaused);
  };

  // Stop visualization
  const stopVisualization = () => {
    visualizationActive.current = false;
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
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;
    
    const allNodes = graph.getAllNodes();
    
    // Calculate bounds (same as in drawGraph)
    let minX = Infinity, maxX = -Infinity;
    let minY = Infinity, maxY = -Infinity;
    
    allNodes.forEach(node => {
      minX = Math.min(minX, node.x);
      maxX = Math.max(maxX, node.x);
      minY = Math.min(minY, node.y);
      maxY = Math.max(maxY, node.y);
    });
    
    const padding = 60;
    const graphWidth = maxX - minX + padding * 2;
    const graphHeight = maxY - minY + padding * 2;
    
    const scaleX = canvas.width / graphWidth;
    const scaleY = canvas.height / graphHeight;
    const scale = Math.min(scaleX, scaleY);
    
    const offsetX = (canvas.width - (graphWidth * scale)) / 2;
    const offsetY = (canvas.height - (graphHeight * scale)) / 2;
    
    // Transform click coordinates back to graph coordinates
    const graphX = ((clickX - offsetX) / scale) + minX - padding;
    const graphY = ((clickY - offsetY) / scale) + minY - padding;
    
    // Find clicked node
    for (const node of allNodes) {
      const distance = Math.sqrt(
        Math.pow(graphX - node.x, 2) + 
        Math.pow(graphY - node.y, 2)
      );
      
      if (distance <= 30 && node.id !== startNode && node.id !== endNode) {
        const newGraph = new Graph();
        
        // Copy all nodes
        graph.getAllNodes().forEach(n => {
          newGraph.addNode(n.id, n.x, n.y);
          if (graph.isWall(n.id)) newGraph.addWall(n.id);
        });
        
        // Copy all edges
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

  // Get algorithm info
  const algorithmInfo = algorithms[algorithm] || algorithms.bfs;

  // Redraw when state changes
  useEffect(() => {
    const timer = setTimeout(() => {
      drawGraph();
    }, 100);
    
    return () => clearTimeout(timer);
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
                  onClick={handleCanvasClick}
                  style={{ 
                    cursor: isVisualizing ? 'default' : 'pointer'
                  }}
                />
              </div>

              {/* ALGORITHM STEPS - MOVED HERE (between graph and legend) */}
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
                          {step.action === 'current' ? ' → Current' : 
                           step.action === 'checking' ? ' → Checking' :
                           step.action === 'visited' ? ' ✓ Visited' :
                           step.action === 'found' ? ' 🎯 Path' : ''}
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
              </div>
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