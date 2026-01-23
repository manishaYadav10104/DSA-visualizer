import BaseGraph from './BaseGraphSearch.js';

export default class AStar extends BaseGraph {
  constructor() {
    super();
    this.name = 'A* Search Algorithm';
    this.description = 'Informed search algorithm using heuristics to find optimal path. Best for pathfinding in games and maps.';
    this.complexity = 'O(b^d)';
    this.timeComplexity = 'O(b^d)';
    this.spaceComplexity = 'O(b^d)';
    this.useCase = 'Pathfinding in games, robotics, route planning';
  }

  // Manhattan distance heuristic for grid graphs
  heuristic(nodeA, nodeB) {
    try {
      const [aRow, aCol] = nodeA.split('-').map(Number);
      const [bRow, bCol] = nodeB.split('-').map(Number);
      
      if (isNaN(aRow) || isNaN(aCol) || isNaN(bRow) || isNaN(bCol)) {
        return 0; // Fallback for non-grid nodes
      }
      
      // Manhattan distance for grid
      return Math.abs(aRow - bRow) + Math.abs(aCol - bCol);
    } catch {
      return 0; // For random graph nodes
    }
  }

  execute(startNode, endNode, graph) {
    const startTime = performance.now();
    this.reset();
    
    if (!graph.hasNode(startNode) || !graph.hasNode(endNode)) {
      this.addStep({
        type: 'error',
        message: 'Start or end node not found in graph'
      });
      return null;
    }

    const openSet = new Set([startNode]);
    const cameFrom = new Map();
    const gScore = new Map(); // Cost from start to node
    const fScore = new Map(); // Estimated total cost (g + h)
    const nodes = graph.getAllNodes();

    // Initialize scores
    nodes.forEach(node => {
      gScore.set(node, Infinity);
      fScore.set(node, Infinity);
    });

    gScore.set(startNode, 0);
    fScore.set(startNode, this.heuristic(startNode, endNode));

    this.addStep({
      type: 'init',
      openSet: Array.from(openSet),
      currentNode: startNode,
      fScore: Object.fromEntries(fScore)
    });

    while (openSet.size > 0) {
      // Get node with lowest fScore
      let current = null;
      let lowestFScore = Infinity;
      
      openSet.forEach(node => {
        const score = fScore.get(node);
        if (score < lowestFScore) {
          lowestFScore = score;
          current = node;
        }
      });

      if (current === endNode) {
        // Reconstruct path
        const path = [];
        let node = endNode;
        while (node !== null) {
          path.unshift(node);
          node = cameFrom.get(node);
        }

        this.pathLength = path.length;
        this.visitedNodes = cameFrom.size;
        this.totalCost = gScore.get(endNode);
        this.executionTime = performance.now() - startTime;

        this.addStep({
          type: 'found',
          path: [...path],
          visited: Array.from(cameFrom.keys()),
          totalCost: gScore.get(endNode),
          stats: this.getStats()
        });

        return path;
      }

      openSet.delete(current);

      this.addStep({
        type: 'visit',
        currentNode: current,
        visited: Array.from(cameFrom.keys()),
        openSet: Array.from(openSet),
        fScore: Object.fromEntries(fScore)
      });

      const neighbors = graph.getNeighbors(current);
      for (const neighbor of neighbors) {
        const tentativeGScore = gScore.get(current) + neighbor.weight;
        
        if (tentativeGScore < gScore.get(neighbor.node)) {
          cameFrom.set(neighbor.node, current);
          gScore.set(neighbor.node, tentativeGScore);
          fScore.set(neighbor.node, tentativeGScore + this.heuristic(neighbor.node, endNode));
          
          if (!openSet.has(neighbor.node)) {
            openSet.add(neighbor.node);
          }

          this.addStep({
            type: 'update',
            neighbor: neighbor.node,
            gScore: tentativeGScore,
            fScore: fScore.get(neighbor.node),
            openSet: Array.from(openSet)
          });
        }
      }
    }

    this.executionTime = performance.now() - startTime;
    this.visitedNodes = cameFrom.size;
    
    this.addStep({
      type: 'notFound',
      visited: Array.from(cameFrom.keys()),
      stats: this.getStats()
    });

    return null;
  }
}