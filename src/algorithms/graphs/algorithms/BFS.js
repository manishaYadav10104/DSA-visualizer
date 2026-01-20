import BaseGraph from './BaseGraph.js';

export default class BFS extends BaseGraph {
  constructor() {
    super();
    this.name = 'Breadth-First Search';
    this.description = 'Explores graph level by level. Guarantees shortest path in unweighted graphs.';
    this.complexity = 'O(V + E)';
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

    const visited = new Set();
    const queue = [{ node: startNode, path: [startNode], cost: 0 }];
    const parent = new Map();
    
    visited.add(startNode);
    parent.set(startNode, null);

    this.addStep({
      type: 'start',
      currentNode: startNode,
      visited: Array.from(visited),
      queue: queue.map(item => item.node),
      path: [startNode]
    });

    while (queue.length > 0) {
      const current = queue.shift();
      const currentNode = current.node;

      if (currentNode === endNode) {
        // Reconstruct path
        const path = [];
        let node = endNode;
        while (node !== null) {
          path.unshift(node);
          node = parent.get(node);
        }

        this.pathLength = path.length;
        this.visitedNodes = visited.size;
        this.totalCost = current.cost;
        this.executionTime = performance.now() - startTime;

        this.addStep({
          type: 'found',
          path: [...path],
          visited: Array.from(visited),
          totalCost: current.cost,
          stats: this.getStats()
        });

        return path;
      }

      const neighbors = graph.getNeighbors(currentNode);
      
      this.addStep({
        type: 'visit',
        currentNode,
        visited: Array.from(visited),
        neighbors: neighbors.map(n => n.node),
        queue: queue.map(item => item.node)
      });

      for (const neighbor of neighbors) {
        if (!visited.has(neighbor.node)) {
          visited.add(neighbor.node);
          parent.set(neighbor.node, currentNode);
          
          queue.push({
            node: neighbor.node,
            path: [...current.path, neighbor.node],
            cost: current.cost + neighbor.weight
          });

          this.addStep({
            type: 'enqueue',
            neighbor: neighbor.node,
            visited: Array.from(visited),
            queue: queue.map(item => item.node),
            parent: neighbor.node
          });
        }
      }
    }

    this.executionTime = performance.now() - startTime;
    this.visitedNodes = visited.size;
    
    this.addStep({
      type: 'notFound',
      visited: Array.from(visited),
      stats: this.getStats()
    });

    return null;
  }
}