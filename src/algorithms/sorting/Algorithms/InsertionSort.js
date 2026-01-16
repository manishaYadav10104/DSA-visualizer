import { delay, highlightBars } from "./BaseSort";

export const insertionSort = async (array, setArray, speed) => {
  const arr = [...array];
  const n = arr.length;
  
  // Mark first element as sorted
  highlightBars([0], "#2ecc71");
  
  for (let i = 1; i < n; i++) {
    let key = arr[i];
    let j = i - 1;
    
    // Highlight element being inserted
    highlightBars([i], "#ff9ff3");
    await delay(100 - speed);
    
    while (j >= 0 && arr[j] > key) {
      // Highlight comparison and shift
      highlightBars([j, j + 1], "#ff6b6b");
      await delay(100 - speed);
      
      // Shift element
      arr[j + 1] = arr[j];
      setArray([...arr]);
      
      // Highlight shift
      highlightBars([j, j + 1], "#4ecdc4");
      await delay(100 - speed);
      
      // Reset colors
      highlightBars([j, j + 1], "#3498db");
      
      j--;
    }
    
    // Insert key at correct position
    arr[j + 1] = key;
    setArray([...arr]);
    
    // Mark as sorted
    highlightBars([j + 1], "#2ecc71");
    
    // Reset color of previous highlighted bar
    if (i !== j + 1) {
      highlightBars([i], "#3498db");
    }
  }
  
  return arr;
};