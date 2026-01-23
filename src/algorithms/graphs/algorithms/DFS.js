// DFS.js - Simple implementation
import BaseGraphSearch from './BaseGraphSearch.js';

class DFS extends BaseGraphSearch {
  constructor() {
    super();
    this.name = 'Depth-First Search';
    this.description = 'Explores as far as possible along each branch before backtracking.';
    this.timeComplexity = 'O(V + E)';
    this.spaceComplexity = 'O(V)';
    this.useCase = 'Maze solving, cycle detection, topological sort';
  }

  async execute(startNode, endNode, graph) {
    this.reset();
    
    console.log('DFS starting from', startNode, 'to', endNode);
    
    const stack = [{ node: startNode, cost: 0 }];
    const visited = new Set();
    const parent = new Map();
    parent.set(startNode, null);
    
    while (stack.length > 0) {
      if (this.shouldStop) throw new Error("Search stopped by user");
      while (this.isPaused) await this.sleep(100);
      
      const { node: current, cost } = stack.pop();
      
      if (visited.has(current)) continue;
      
      visited.add(current);
      
      if (this.visualization) {
        await this.visualization.markCurrent(current);
      }
      
      if (current === endNode) {
        const path = [];
        let node = endNode;
        while (node !== null) {
          path.unshift(node);
          node = parent.get(node);
        }
        
        this.path = path;
        this.totalCost = cost;
        
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
      
      const neighbors = graph.getNeighbors(current) || [];
      for (const neighbor of neighbors) {
        const neighborId = neighbor.node;
        const weight = neighbor.weight || 1;
        
        if (graph.isWall && graph.isWall(neighborId)) continue;
        if (visited.has(neighborId)) continue;
        
        parent.set(neighborId, current);
        stack.push({ node: neighborId, cost: cost + weight });
        
        if (this.visualization) {
          await this.visualization.markChecking(neighborId, `Pushing ${neighborId}`);
        }
      }
      
      if (this.visualization) {
        await this.visualization.markVisited(current);
      }
      
      await this.sleep(50);
    }
    
    return null;
  }
}

export default DFS;