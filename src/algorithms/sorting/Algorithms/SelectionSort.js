import { delay, highlightBars } from "./BaseSort";

export const selectionSort = async (array, setArray, speed) => {
  const arr = [...array];
  const n = arr.length;
  
  for (let i = 0; i < n - 1; i++) {
    let minIdx = i;
    
    // Highlight current minimum
    highlightBars([minIdx], "#feca57");
    
    for (let j = i + 1; j < n; j++) {
      // Highlight current comparison
      highlightBars([j], "#ff6b6b");
      await delay(100 - speed);
      
      if (arr[j] < arr[minIdx]) {
        // Remove highlight from old min
        highlightBars([minIdx], "#3498db");
        minIdx = j;
        // Highlight new min
        highlightBars([minIdx], "#feca57");
      } else {
        // Reset comparison highlight
        highlightBars([j], "#3498db");
      }
    }
    
    if (minIdx !== i) {
      // Highlight swap
      highlightBars([i, minIdx], "#4ecdc4");
      await delay(150 - speed);
      
      // Swap
      [arr[i], arr[minIdx]] = [arr[minIdx], arr[i]];
      setArray([...arr]);
      
      await delay(150 - speed);
    }
    
    // Mark sorted element
    highlightBars([i], "#2ecc71");
  }
  
  // Mark last element as sorted
  highlightBars([n - 1], "#2ecc71");
  
  return arr;
};