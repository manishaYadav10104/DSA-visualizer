export default class InsertionSort {
    static getAnimations(array) {
      const animations = [];
      const arr = [...array];
  
      for (let i = 1; i < arr.length; i++) {
        let key = arr[i];
        let j = i - 1;
  
        while (j >= 0 && arr[j] > key) {
          animations.push({
            type: "overwrite",
            index: j + 1,
            value: arr[j],
          });
          arr[j + 1] = arr[j];
          j--;
        }
  
        animations.push({
          type: "overwrite",
          index: j + 1,
          value: key,
        });
        arr[j + 1] = key;
      }
      return animations;
    }
  }
  