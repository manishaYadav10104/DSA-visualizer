import BaseGraph from './BaseGraph.js';

export default class Dijkstra extends BaseGraph {
  constructor() {
    super();
    this.name = "Dijkstra's Algorithm";
    this.description = 'Finds shortest path in weighted graphs with non-negative weights.';
    this.complexity = 'O((V + E) log V)';
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

    const distances = new Map();
    const visited = new Set();
    const previous = new Map();
    const nodes = graph.getAllNodes();
    const unvisited = new Set(nodes);

    // Initialize distances
    nodes.forEach(node => {
      distances.set(node, Infinity);
      previous.set(node, null);
    });
    distances.set(startNode, 0);

    this.addStep({
      type: 'init',
      distances: Object.fromEntries(distances),
      currentNode: startNode
    });

    while (unvisited.size > 0) {
      // Get node with smallest distance
      let currentNode = null;
      let minDistance = Infinity;
      
      unvisited.forEach(node => {
        const dist = distances.get(node);
        if (dist < minDistance) {
          minDistance = dist;
          currentNode = node;
        }
      });

      if (currentNode === null || distances.get(currentNode) === Infinity) {
        break;
      }

      // Found the end node
      if (currentNode === endNode) {
        const path = [];
        let node = endNode;
        while (node !== null) {
          path.unshift(node);
          node = previous.get(node);
        }

        this.pathLength = path.length;
        this.visitedNodes = visited.size;
        this.totalCost = distances.get(endNode);
        this.executionTime = performance.now() - startTime;

        this.addStep({
          type: 'found',
          path: [...path],
          visited: Array.from(visited),
          totalCost: distances.get(endNode),
          distances: Object.fromEntries(distances),
          stats: this.getStats()
        });

        return path;
      }

      unvisited.delete(currentNode);
      visited.add(currentNode);

      this.addStep({
        type: 'visit',
        currentNode,
        visited: Array.from(visited),
        distance: distances.get(currentNode),
        distances: Object.fromEntries(distances)
      });

      // Check neighbors
      const neighbors = graph.getNeighbors(currentNode);
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor.node)) {
          const alt = distances.get(currentNode) + neighbor.weight;
          if (alt < distances.get(neighbor.node)) {
            distances.set(neighbor.node, alt);
            previous.set(neighbor.node, currentNode);

            this.addStep({
              type: 'update',
              neighbor: neighbor.node,
              newDistance: alt,
              previous: currentNode,
              distances: Object.fromEntries(distances)
            });
          }
        }
      }
    }

    this.executionTime = performance.now() - startTime;
    this.visitedNodes = visited.size;
    
    this.addStep({
      type: 'notFound',
      visited: Array.from(visited),
      distances: Object.fromEntries(distances),
      stats: this.getStats()
    });

    return null;
  }
}