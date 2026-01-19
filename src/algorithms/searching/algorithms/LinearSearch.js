// LinearSearch.js
import { waitIfPaused } from "./BaseSearch";

export const linearSearch = async (array, target, speed, highlightBar, history) => {
  for (let i = 0; i < array.length; i++) {
    // Check if paused or stopped
    const shouldContinue = await waitIfPaused();
    if (!shouldContinue) {
      throw new Error("Searching stopped by user");
    }

    // Highlight current bar
    highlightBar(i, 'searching');
    history.push({ index: i, value: array[i], found: false });
    
    await new Promise(resolve => setTimeout(resolve, speed));
    
    // Check if found
    if (array[i] === target) {
      highlightBar(i, 'found');
      history[history.length - 1].found = true;
      return i;
    }
    
    // Mark as checked
    highlightBar(i, 'checked');
  }
  
  return -1;
};