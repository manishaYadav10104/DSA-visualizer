// BaseGraphSearch.js - Make sure this is the exact file name and content
class BaseGraphSearch {
  constructor() {
    this.isPaused = false;
    this.shouldStop = false;
    this.visualization = null;
    this.visitedNodes = new Set();
    this.path = [];
    this.totalCost = 0;
    this.comparisonCount = 0;
    this.name = 'Base Graph Search';
    this.description = 'Base class for graph search algorithms';
    this.timeComplexity = 'O(V + E)';
    this.spaceComplexity = 'O(V)';
    this.useCase = 'Graph traversal';
  }

  setVisualization(viz) {
    this.visualization = viz;
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
    this.visitedNodes.clear();
    this.path = [];
    this.totalCost = 0;
    this.comparisonCount = 0;
  }

  async sleep(ms) {
    return new Promise(resolve => {
      setTimeout(resolve, ms);
    });
  }

  async markVisited(nodeId) {
    this.comparisonCount++;
    if (this.visualization) {
      await this.visualization.markVisited(nodeId);
    }
    this.visitedNodes.add(nodeId);
  }

  async markChecking(nodeId, message) {
    this.comparisonCount++;
    if (this.visualization) {
      await this.visualization.markChecking(nodeId, message);
    }
  }

  async markCurrent(nodeId) {
    this.comparisonCount++;
    if (this.visualization) {
      await this.visualization.markCurrent(nodeId);
    }
  }

  async updateDistance(nodeId, distance) {
    this.comparisonCount++;
    if (this.visualization) {
      await this.visualization.updateDistance(nodeId, distance);
    }
  }

  async markFound(nodeId) {
    this.comparisonCount++;
    if (this.visualization) {
      await this.visualization.markFound(nodeId);
    }
  }

  async execute(startNode, endNode, graph) {
    throw new Error('Execute method must be implemented by subclass');
  }
}

export default BaseGraphSearch;