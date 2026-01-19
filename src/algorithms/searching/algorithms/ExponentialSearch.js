// ExponentialSearch.js
import { waitIfPaused } from "./BaseSearch";
import { binarySearch } from "./BinarySearch";

export const exponentialSearch = async (array, target, speed, highlightBar, history) => {
  const n = array.length;
  
  // If element is at first position
  if (array[0] === target) {
    highlightBar(0, 'searching');
    await new Promise(resolve => setTimeout(resolve, speed));
    highlightBar(0, 'found');
    history.push({ index: 0, value: array[0], found: true });
    return 0;
  }

  // Find range for binary search
  let i = 1;
  while (i < n && array[i] <= target) {
    // Check if paused or stopped
    const shouldContinue = await waitIfPaused();
    if (!shouldContinue) {
      throw new Error("Searching stopped by user");
    }

    highlightBar(i, 'current');
    await new Promise(resolve => setTimeout(resolve, speed));
    i *= 2;
  }

  // Perform binary search in the found range
  const left = Math.floor(i / 2);
  const right = Math.min(i, n - 1);
  
  // Highlight the range
  for (let j = left; j <= right; j++) {
    highlightBar(j, 'checked');
  }
  
  await new Promise(resolve => setTimeout(resolve, speed));

  // Use binary search in the range
  const binaryHistory = [];
  const result = await binarySearch(array.slice(left, right + 1), target, speed, 
    (index, className) => {
      highlightBar(left + index, className);
    },
    binaryHistory
  );

  // Add binary search history to main history
  binaryHistory.forEach(step => {
    history.push({ 
      index: left + step.index, 
      value: step.value, 
      found: step.found 
    });
  });

  return result === -1 ? -1 : left + result;
};