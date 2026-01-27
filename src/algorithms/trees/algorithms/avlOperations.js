export class AVLOperations {
  static getHeight(node) {
    return node ? node.height : 0;
  }

  static getBalanceFactor(node) {
    return node ? this.getHeight(node.left) - this.getHeight(node.right) : 0;
  }

  static updateHeight(node) {
    if (node) {
      node.height = 1 + Math.max(
        this.getHeight(node.left),
        this.getHeight(node.right)
      );
    }
  }

  static rotateRight(y) {
    const x = y.left;
    const T2 = x.right;

    x.right = y;
    y.left = T2;

    this.updateHeight(y);
    this.updateHeight(x);

    return x;
  }

  static rotateLeft(x) {
    const y = x.right;
    const T2 = y.left;

    y.left = x;
    x.right = T2;

    this.updateHeight(x);
    this.updateHeight(y);

    return y;
  }

  static balanceNode(node) {
    this.updateHeight(node);
    const balance = this.getBalanceFactor(node);

    // Left Left Case
    if (balance > 1 && this.getBalanceFactor(node.left) >= 0) {
      return this.rotateRight(node);
    }

    // Left Right Case
    if (balance > 1 && this.getBalanceFactor(node.left) < 0) {
      node.left = this.rotateLeft(node.left);
      return this.rotateRight(node);
    }

    // Right Right Case
    if (balance < -1 && this.getBalanceFactor(node.right) <= 0) {
      return this.rotateLeft(node);
    }

    // Right Left Case
    if (balance < -1 && this.getBalanceFactor(node.right) > 0) {
      node.right = this.rotateRight(node.right);
      return this.rotateLeft(node);
    }

    return node;
  }
}