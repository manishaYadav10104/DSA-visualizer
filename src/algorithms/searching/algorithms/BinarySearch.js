import { delay, highlightBars, markTargetBar, markComparingBars, resetBarColors } from "./BaseSearch";

export const binarySearch = async (array, target, speed, setComparisonCount, setFoundIndex) => {
  // Binary search requires sorted array
  const arr = [...array].sort((a, b) => a - b);
  let left = 0;
  let right = arr.length - 1;
  let comparisons = 0;
  setFoundIndex(-1);
  
  // Reset all bars to default
  resetBarColors(arr.length);
  
  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    comparisons++;
    setComparisonCount(comparisons);
    
    // Highlight current range
    for (let i = left; i <= right; i++) {
      const bar = document.getElementById(`bar-${i}`);
      if (bar) bar.style.backgroundColor = "#ff9ff3";
    }
    
    // Highlight middle element
    highlightBars([mid], "#4ecdc4");
    await delay(250 - speed);
    
    if (arr[mid] === target) {
      // Found the target
      markTargetBar(mid, true);
      setFoundIndex(mid);
      return { index: mid, comparisons };
    }
    
    // Reset middle bar
    highlightBars([mid], "#3498db");
    
    if (arr[mid] < target) {
      // Search in right half
      // Mark left half as visited
      for (let i = left; i < mid; i++) {
        const bar = document.getElementById(`bar-${i}`);
        if (bar) bar.style.backgroundColor = "#feca57";
      }
      left = mid + 1;
    } else {
      // Search in left half
      // Mark right half as visited
      for (let i = mid + 1; i <= right; i++) {
        const bar = document.getElementById(`bar-${i}`);
        if (bar) bar.style.backgroundColor = "#feca57";
      }
      right = mid - 1;
    }
    
    await delay(150 - speed);
  }
  
  // Target not found
  setFoundIndex(-1);
  return { index: -1, comparisons };
};