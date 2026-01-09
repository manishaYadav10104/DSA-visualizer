export default class MergeSort {
    static getAnimations(array) {
      const animations = [];
      const arr = [...array];
      this.mergeSort(arr, 0, arr.length - 1, animations);
      return animations;
    }
  
    static mergeSort(arr, l, r, animations) {
      if (l >= r) return;
      const m = Math.floor((l + r) / 2);
      this.mergeSort(arr, l, m, animations);
      this.mergeSort(arr, m + 1, r, animations);
      this.merge(arr, l, m, r, animations);
    }
  
    static merge(arr, l, m, r, animations) {
      const left = arr.slice(l, m + 1);
      const right = arr.slice(m + 1, r + 1);
  
      let i = 0,
        j = 0,
        k = l;
  
      while (i < left.length && j < right.length) {
        animations.push({ type: "compare", indices: [l + i, m + 1 + j] });
  
        if (left[i] <= right[j]) {
          animations.push({ type: "overwrite", index: k, value: left[i] });
          arr[k++] = left[i++];
        } else {
          animations.push({ type: "overwrite", index: k, value: right[j] });
          arr[k++] = right[j++];
        }
      }
  
      while (i < left.length) {
        animations.push({ type: "overwrite", index: k, value: left[i] });
        arr[k++] = left[i++];
      }
  
      while (j < right.length) {
        animations.push({ type: "overwrite", index: k, value: right[j] });
        arr[k++] = right[j++];
      }
    }
  }
  