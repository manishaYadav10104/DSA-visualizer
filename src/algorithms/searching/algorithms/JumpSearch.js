// JumpSearch.js
import { waitIfPaused } from "./BaseSearch";

export const jumpSearch = async (array, target, speed, highlightBar, history) => {
  const n = array.length;
  const step = Math.floor(Math.sqrt(n));
  let prev = 0;

  // Jump forward
  while (array[Math.min(step, n) - 1] < target) {
    // Check if paused or stopped
    const shouldContinue = await waitIfPaused();
    if (!shouldContinue) {
      throw new Error("Searching stopped by user");
    }

    prev = step;
    highlightBar(prev, 'current');
    await new Promise(resolve => setTimeout(resolve, speed));
    
    if (prev >= n) {
      return -1;
    }
  }

  // Linear search in the block
  while (array[prev] < target) {
    // Check if paused or stopped
    const shouldContinue = await waitIfPaused();
    if (!shouldContinue) {
      throw new Error("Searching stopped by user");
    }

    highlightBar(prev, 'searching');
    history.push({ index: prev, value: array[prev], found: false });
    
    await new Promise(resolve => setTimeout(resolve, speed));
    
    prev++;
    if (prev === Math.min(step, n)) {
      return -1;
    }
  }

  // Check if element is found
  const shouldContinue = await waitIfPaused();
  if (!shouldContinue) {
    throw new Error("Searching stopped by user");
  }

  highlightBar(prev, 'searching');
  history.push({ index: prev, value: array[prev], found: false });
  
  await new Promise(resolve => setTimeout(resolve, speed));

  if (array[prev] === target) {
    highlightBar(prev, 'found');
    history[history.length - 1].found = true;
    return prev;
  }

  return -1;
};