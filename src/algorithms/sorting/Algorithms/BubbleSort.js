const BubbleSort = {
    getAnimations(arr) {
      const animations = [];
      const aux = arr.slice();
      const n = aux.length;
  
      for (let i = 0; i < n; i++) {
        // After each pass, last i elements are sorted
        for (let j = 0; j < n - i - 1; j++) {
          animations.push({ type: "compare", indices: [j, j + 1] });
          if (aux[j] > aux[j + 1]) {
            // Swap animation with new values
            animations.push({ type: "swap", indices: [j, j + 1], values: [aux[j + 1], aux[j]] });
            [aux[j], aux[j + 1]] = [aux[j + 1], aux[j]];
          }
        }
        // Mark the last element in this pass as sorted
        animations.push({ type: "sorted", index: n - i - 1 });
      }
  
      return animations;
    }
  };
  
  export default BubbleSort;
  