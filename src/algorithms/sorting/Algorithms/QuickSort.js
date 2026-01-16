
import { delay, highlightBars } from "./BaseSort";

const partition = async (arr, setArray, low, high, speed) => {
  const pivot = arr[high];
  let i = low - 1;
  
  // Highlight pivot
  highlightBars([high], "#feca57");
  
  for (let j = low; j < high; j++) {
    // Highlight current element
    highlightBars([j], "#ff6b6b");
    await delay(100 - speed);
    
    if (arr[j] < pivot) {
      i++;
      
      if (i !== j) {
        // Highlight swap
        highlightBars([i, j], "#4ecdc4");
        await delay(150 - speed);
        
        // Swap
        [arr[i], arr[j]] = [arr[j], arr[i]];
        setArray([...arr]);
        
        await delay(150 - speed);
      }
    }
    
    // Reset colors
    highlightBars([j], "#3498db");
    if (i >= 0 && i !== j) {
      highlightBars([i], "#3498db");
    }
  }
  
  // Place pivot at correct position
  if (i + 1 !== high) {
    highlightBars([i + 1, high], "#ff9ff3");
    await delay(150 - speed);
    
    [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
    setArray([...arr]);
  }
  
  // Reset pivot color and mark as sorted
  highlightBars([high], "#3498db");
  highlightBars([i + 1], "#2ecc71");
  
  await delay(100 - speed);
  
  return i + 1;
};

const quickSortHelper = async (arr, setArray, low, high, speed) => {
  if (low < high) {
    const pi = await partition(arr, setArray, low, high, speed);
    
    await quickSortHelper(arr, setArray, low, pi - 1, speed);
    await quickSortHelper(arr, setArray, pi + 1, high, speed);
  } else if (low === high) {
    // Single element is sorted
    highlightBars([low], "#2ecc71");
  }
};

export const quickSort = async (array, setArray, speed) => {
  const arr = [...array];
  await quickSortHelper(arr, setArray, 0, arr.length - 1, speed);
  return arr;
};