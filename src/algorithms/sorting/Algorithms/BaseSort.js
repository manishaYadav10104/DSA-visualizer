// Utility functions for all sorting algorithms
export const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const highlightBars = (indices, color) => {
  indices.forEach(idx => {
    const bar = document.getElementById(`bar-${idx}`);
    if (bar) bar.style.backgroundColor = color;
  });
};

export const swap = async (array, setArray, i, j, speed) => {
  const newArray = [...array];
  [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  setArray([...newArray]);
  await delay(100 - speed);
  return newArray;
};