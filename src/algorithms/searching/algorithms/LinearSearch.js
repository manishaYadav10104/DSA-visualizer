import { delay, highlightBars, markTargetBar, markComparingBars, resetBarColors } from "./BaseSearch";

export const linearSearch = async (array, target, speed, setComparisonCount, setFoundIndex) => {
  const arr = [...array];
  let comparisons = 0;
  setFoundIndex(-1);
  
  // Reset all bars to default
  resetBarColors(arr.length);
  
  for (let i = 0; i < arr.length; i++) {
    comparisons++;
    setComparisonCount(comparisons);
    
    // Mark current bar as comparing
    highlightBars([i], "#ff6b6b");
    await delay(200 - speed);
    
    if (arr[i] === target) {
      // Found the target
      markTargetBar(i, true);
      setFoundIndex(i);
      return { index: i, comparisons };
    }
    
    // Mark as visited but not found
    highlightBars([i], "#feca57");
  }
  
  // Target not found
  setFoundIndex(-1);
  return { index: -1, comparisons };
};