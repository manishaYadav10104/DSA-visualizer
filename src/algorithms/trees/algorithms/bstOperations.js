export class BSTOperations {
  static search(root, value) {
    let steps = [];
    let current = root;
    
    while (current) {
      steps.push({
        node: current.value,
        comparison: value === current.value ? 'equal' : 
                   value < current.value ? 'go left' : 'go right'
      });
      
      if (value === current.value) {
        return { found: true, steps };
      } else if (value < current.value) {
        current = current.left;
      } else {
        current = current.right;
      }
    }
    
    return { found: false, steps };
  }

  static findMin(root) {
    if (!root) return null;
    let current = root;
    while (current.left) {
      current = current.left;
    }
    return current.value;
  }

  static findMax(root) {
    if (!root) return null;
    let current = root;
    while (current.right) {
      current = current.right;
    }
    return current.value;
  }

  static isBST(root, min = -Infinity, max = Infinity) {
    if (!root) return true;
    
    if (root.value <= min || root.value >= max) {
      return false;
    }
    
    return this.isBST(root.left, min, root.value) && 
           this.isBST(root.right, root.value, max);
  }
}