import { delay, highlightBars } from "./BaseSort";

export const bubbleSort = async (array, setArray, speed) => {
  const arr = [...array];
  const n = arr.length;
  
  for (let i = 0; i < n - 1; i++) {
    for (let j = 0; j < n - i - 1; j++) {
      // Highlight comparing bars
      highlightBars([j, j + 1], "#ff6b6b");
      await delay(150 - speed);
      
      if (arr[j] > arr[j + 1]) {
        // Highlight swapping
        highlightBars([j, j + 1], "#4ecdc4");
        
        // Swap
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
        setArray([...arr]);
        
        await delay(150 - speed);
      }
      
      // Reset colors
      highlightBars([j, j + 1], "#3498db");
    }
    // Mark sorted element
    highlightBars([n - i - 1], "#2ecc71");
  }
  
  // Mark all as sorted
  for (let i = 0; i < n; i++) {
    highlightBars([i], "#2ecc71");
  }
  
  return arr;
};