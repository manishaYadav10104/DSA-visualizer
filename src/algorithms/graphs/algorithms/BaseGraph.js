export default class BaseGraph {
  constructor() {
    this.name = 'Base Graph Algorithm';
    this.description = 'Base class for graph algorithms';
    this.complexity = 'O()';
    this.steps = [];
    this.currentStep = 0;
    this.visitedNodes = 0;
    this.pathLength = 0;
    this.totalCost = 0;
    this.executionTime = 0;
  }

  reset() {
    this.steps = [];
    this.currentStep = 0;
    this.visitedNodes = 0;
    this.pathLength = 0;
    this.totalCost = 0;
    this.executionTime = 0;
  }

  addStep(state) {
    this.steps.push({
      ...state,
      stepNumber: this.steps.length,
      timestamp: Date.now()
    });
  }

  getNextStep() {
    if (this.currentStep < this.steps.length) {
      return this.steps[this.currentStep++];
    }
    return null;
  }

  hasNextStep() {
    return this.currentStep < this.steps.length;
  }

  getStats() {
    return {
      visitedNodes: this.visitedNodes,
      pathLength: this.pathLength,
      totalCost: this.totalCost,
      steps: this.steps.length,
      executionTime: this.executionTime
    };
  }

  execute(startNode, endNode, graph) {
    throw new Error('Execute method must be implemented by subclass');
  }
}