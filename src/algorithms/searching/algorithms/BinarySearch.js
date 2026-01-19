// BinarySearch.js
import { waitIfPaused } from "./BaseSearch";

export const binarySearch = async (array, target, speed, highlightBar, history) => {
  let left = 0;
  let right = array.length - 1;

  while (left <= right) {
    // Check if paused or stopped
    const shouldContinue = await waitIfPaused();
    if (!shouldContinue) {
      throw new Error("Searching stopped by user");
    }

    const mid = Math.floor((left + right) / 2);
    
    // Highlight middle bar
    highlightBar(mid, 'searching');
    history.push({ index: mid, value: array[mid], found: false });
    
    await new Promise(resolve => setTimeout(resolve, speed));

    if (array[mid] === target) {
      highlightBar(mid, 'found');
      history[history.length - 1].found = true;
      return mid;
    }

    if (array[mid] < target) {
      // Highlight left part as checked
      for (let i = left; i <= mid; i++) {
        if (i !== mid) highlightBar(i, 'checked');
      }
      left = mid + 1;
    } else {
      // Highlight right part as checked
      for (let i = mid; i <= right; i++) {
        if (i !== mid) highlightBar(i, 'checked');
      }
      right = mid - 1;
    }
  }

  return -1;
};