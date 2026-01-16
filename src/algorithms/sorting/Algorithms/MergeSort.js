import { delay, highlightBars } from "./BaseSort";

const merge = async (arr, setArray, start, mid, end, speed) => {
  let temp = [];
  let i = start, j = mid + 1;
  
  // Highlight merging sections
  for (let k = start; k <= end; k++) {
    highlightBars([k], "#ff9ff3");
  }
  await delay(100 - speed);
  
  while (i <= mid && j <= end) {
    // Highlight comparison
    highlightBars([i, j], "#ff6b6b");
    await delay(100 - speed);
    
    if (arr[i] <= arr[j]) {
      temp.push(arr[i++]);
    } else {
      temp.push(arr[j++]);
    }
    
    highlightBars([i-1, j-1], "#3498db");
  }
  
  while (i <= mid) {
    temp.push(arr[i++]);
  }
  
  while (j <= end) {
    temp.push(arr[j++]);
  }
  
  // Copy back to original array
  for (let k = start; k <= end; k++) {
    arr[k] = temp[k - start];
    setArray([...arr]);
    
    // Highlight placement
    highlightBars([k], "#4ecdc4");
    await delay(50 - speed/2);
    
    // Mark as sorted in this merge
    highlightBars([k], "#2ecc71");
  }
};

const mergeSortHelper = async (arr, setArray, start, end, speed) => {
  if (start >= end) return;
  
  const mid = Math.floor((start + end) / 2);
  
  // Visualize division
  highlightBars([mid], "#feca57");
  await delay(100 - speed);
  highlightBars([mid], "#3498db");
  
  await mergeSortHelper(arr, setArray, start, mid, speed);
  await mergeSortHelper(arr, setArray, mid + 1, end, speed);
  
  await merge(arr, setArray, start, mid, end, speed);
};

export const mergeSort = async (array, setArray, speed) => {
  const arr = [...array];
  await mergeSortHelper(arr, setArray, 0, arr.length - 1, speed);
  return arr;
};