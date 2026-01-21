import BaseGraph from './BaseGraph.js';

export default class DFS extends BaseGraph {
  constructor() {
    super();
    this.name = 'Depth-First Search';
    this.description = 'Explores as far as possible along each branch before backtracking. Uses stack data structure.';
    this.complexity = 'O(V + E)';
    this.timeComplexity = 'O(V + E)';
    this.spaceComplexity = 'O(V)';
    this.useCase = 'Path existence, cycle detection, topological sorting';
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
    const stack = [{ node: startNode, path: [startNode], cost: 0 }];
    
    this.addStep({
      type: 'start',
      currentNode: startNode,
      visited: Array.from(visited),
      stack: stack.map(item => item.node)
    });

    while (stack.length > 0) {
      const current = stack.pop();
      const currentNode = current.node;

      if (currentNode === endNode) {
        this.pathLength = current.path.length;
        this.visitedNodes = visited.size;
        this.totalCost = current.cost;
        this.executionTime = performance.now() - startTime;

        this.addStep({
          type: 'found',
          path: [...current.path],
          visited: Array.from(visited),
          totalCost: current.cost,
          stats: this.getStats()
        });

        return current.path;
      }

      if (!visited.has(currentNode)) {
        visited.add(currentNode);

        this.addStep({
          type: 'visit',
          currentNode,
          visited: Array.from(visited),
          stack: stack.map(item => item.node)
        });

        const neighbors = graph.getNeighbors(currentNode);
        // Reverse neighbors to maintain consistent visualization
        for (const neighbor of neighbors.reverse()) {
          if (!visited.has(neighbor.node)) {
            stack.push({
              node: neighbor.node,
              path: [...current.path, neighbor.node],
              cost: current.cost + neighbor.weight
            });

            this.addStep({
              type: 'push',
              neighbor: neighbor.node,
              visited: Array.from(visited),
              stack: stack.map(item => item.node)
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
      stats: this.getStats()
    });

    return null;
  }
}