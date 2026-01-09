export default class SelectionSort {
    static getAnimations(array) {
      const animations = [];
      const arr = [...array];
  
      for (let i = 0; i < arr.length; i++) {
        let min = i;
  
        for (let j = i + 1; j < arr.length; j++) {
          animations.push({ type: "compare", indices: [min, j] });
          if (arr[j] < arr[min]) min = j;
        }
  
        if (min !== i) {
          animations.push({
            type: "swap",
            indices: [i, min],
            values: [arr[min], arr[i]],
          });
          [arr[i], arr[min]] = [arr[min], arr[i]];
        }
      }
      return animations;
    }
  }
  