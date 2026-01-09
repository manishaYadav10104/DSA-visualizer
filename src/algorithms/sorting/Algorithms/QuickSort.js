export default class QuickSort {
    static getAnimations(array) {
      const animations = [];
      const arr = [...array];
      this.quickSort(arr, 0, arr.length - 1, animations);
      return animations;
    }
  
    static quickSort(arr, low, high, animations) {
      if (low < high) {
        const pi = this.partition(arr, low, high, animations);
        this.quickSort(arr, low, pi - 1, animations);
        this.quickSort(arr, pi + 1, high, animations);
      }
    }
  
    static partition(arr, low, high, animations) {
      const pivot = arr[high];
      let i = low - 1;
  
      for (let j = low; j < high; j++) {
        animations.push({ type: "compare", indices: [j, high] });
  
        if (arr[j] < pivot) {
          i++;
          animations.push({
            type: "swap",
            indices: [i, j],
            values: [arr[j], arr[i]],
          });
          [arr[i], arr[j]] = [arr[j], arr[i]];
        }
      }
  
      animations.push({
        type: "swap",
        indices: [i + 1, high],
        values: [arr[high], arr[i + 1]],
      });
      [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
  
      return i + 1;
    }
  }
  