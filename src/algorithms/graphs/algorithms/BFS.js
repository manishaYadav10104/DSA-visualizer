// BFS.js - Simple implementation
import BaseGraphSearch from './BaseGraphSearch.js';

class BFS extends BaseGraphSearch {
  constructor() {
    super();
    this.name = 'Breadth-First Search';
    this.description = 'Explores graph level by level, guarantees shortest path in unweighted graphs.';
    this.timeComplexity = 'O(V + E)';
    this.spaceComplexity = 'O(V)';
    this.useCase = 'Unweighted graphs, finding shortest path';
  }

  async execute(startNode, endNode, graph) {
    this.reset();
    
    console.log('BFS starting from', startNode, 'to', endNode);
    
    const queue = [{ node: startNode, cost: 0 }];
    const visited = new Set([startNode]);
    const parent = new Map();
    parent.set(startNode, null);
    
    while (queue.length > 0) {
      // Check for stop
      if (this.shouldStop) {
        throw new Error("Search stopped by user");
      }
      
      // Handle pause
      while (this.isPaused) {
        await this.sleep(100);
      }
      
      const { node: current, cost } = queue.shift();
      
      // Mark current node
      if (this.visualization) {
        await this.visualization.markCurrent(current);
      }
      
      // Check if we found the target
      if (current === endNode) {
        // Reconstruct path
        const path = [];
        let node = endNode;
        while (node !== null) {
          path.unshift(node);
          node = parent.get(node);
        }
        
        this.path = path;
        this.totalCost = cost;
        this.visitedNodes = visited;
        
        // Mark the path
        for (const nodeId of path) {
          if (nodeId !== startNode && nodeId !== endNode && this.visualization) {
            await this.visualization.markFound(nodeId);
          }
        }
        
        return { 
          path, 
          totalCost: cost,
          visitedNodes: Array.from(visited)
        };
      }
      
      // Get neighbors
      const neighbors = graph.getNeighbors(current) || [];
      
      // Explore neighbors
      for (const neighbor of neighbors) {
        const neighborId = neighbor.node;
        const weight = neighbor.weight || 1;
        
        // Skip walls and visited nodes
        if (graph.isWall && graph.isWall(neighborId)) continue;
        if (visited.has(neighborId)) continue;
        
        visited.add(neighborId);
        parent.set(neighborId, current);
        queue.push({ node: neighborId, cost: cost + weight });
        
        // Mark as checking
        if (this.visualization) {
          await this.visualization.markChecking(neighborId, `Enqueuing ${neighborId}`);
        }
      }
      
      // Mark as visited
      if (this.visualization) {
        await this.visualization.markVisited(current);
      }
      
      // Small delay for visualization
      await this.sleep(50);
    }
    
    // No path found
    return null;
  }
}

export default BFS;