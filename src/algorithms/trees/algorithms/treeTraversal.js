export const inorderTraversal = (root, callback) => {
  if (!root) return;
  inorderTraversal(root.left, callback);
  callback(root);
  inorderTraversal(root.right, callback);
};

export const preorderTraversal = (root, callback) => {
  if (!root) return;
  callback(root);
  preorderTraversal(root.left, callback);
  preorderTraversal(root.right, callback);
};

export const postorderTraversal = (root, callback) => {
  if (!root) return;
  postorderTraversal(root.left, callback);
  postorderTraversal(root.right, callback);
  callback(root);
};

export const levelOrderTraversal = (root, callback) => {
  if (!root) return;
  
  const queue = [root];
  while (queue.length > 0) {
    const node = queue.shift();
    callback(node);
    
    if (node.left) queue.push(node.left);
    if (node.right) queue.push(node.right);
  }
};