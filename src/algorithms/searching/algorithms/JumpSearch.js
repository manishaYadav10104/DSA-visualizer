import { delay, highlightBars, markTargetBar, markComparingBars, resetBarColors } from "./BaseSearch";

export const jumpSearch = async (array, target, speed, setComparisonCount, setFoundIndex) => {
  // Jump search requires sorted array
  const arr = [...array].sort((a, b) => a - b);
  const n = arr.length;
  const step = Math.floor(Math.sqrt(n));
  let comparisons = 0;
  let prev = 0;
  setFoundIndex(-1);
  
  // Reset all bars to default
  resetBarColors(arr.length);
  
  // Find the block where target may be present
  while (arr[Math.min(step, n) - 1] < target) {
    comparisons++;
    setComparisonCount(comparisons);
    
    // Highlight current block
    const start = prev;
    const end = Math.min(prev + step, n) - 1;
    for (let i = start; i <= end; i++) {
      highlightBars([i], "#ff9ff3");
    }
    await delay(200 - speed);
    
    // Reset previous block
    for (let i = start; i <= end; i++) {
      highlightBars([i], "#feca57");
    }
    
    prev = step;
    step += Math.floor(Math.sqrt(n));
    if (prev >= n) {
      setFoundIndex(-1);
      return { index: -1, comparisons };
    }
  }
  
  // Linear search in the block
  while (arr[prev] < target) {
    comparisons++;
    setComparisonCount(comparisons);
    
    highlightBars([prev], "#ff6b6b");
    await delay(150 - speed);
    highlightBars([prev], "#feca57");
    
    prev++;
    if (prev === Math.min(step, n)) {
      setFoundIndex(-1);
      return { index: -1, comparisons };
    }
  }
  
  comparisons++;
  setComparisonCount(comparisons);
  
  // Check if current element is target
  highlightBars([prev], "#4ecdc4");
  await delay(200 - speed);
  
  if (arr[prev] === target) {
    markTargetBar(prev, true);
    setFoundIndex(prev);
    return { index: prev, comparisons };
  }
  
  setFoundIndex(-1);
  return { index: -1, comparisons };
};