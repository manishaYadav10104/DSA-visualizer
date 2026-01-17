// Global pause and stop state
let isPaused = false;
let isStopped = false;
let resumeResolve = null;

// Set pause state
export const setPauseState = (paused) => {
  isPaused = paused;
  if (!paused && resumeResolve) {
    resumeResolve();
    resumeResolve = null;
  }
};

// Set stop state
export const setStopState = (stopped) => {
  isStopped = stopped;
  if (stopped) {
    isPaused = false;
    if (resumeResolve) {
      resumeResolve();
      resumeResolve = null;
    }
  }
};

// Reset all states
export const resetSearchingState = () => {
  isPaused = false;
  isStopped = false;
  resumeResolve = null;
};

// Check if stopped
export const checkStop = () => {
  if (isStopped) {
    throw new Error("Searching stopped by user");
  }
};

// Check if paused and wait if needed
export const checkPause = async () => {
  checkStop(); // Check if stopped first
  if (isPaused) {
    await new Promise(resolve => {
      resumeResolve = resolve;
    });
    checkStop(); // Check again after resume
  }
};

// Delay with pause and stop support
export const delay = async (ms) => {
  const start = Date.now();
  while (Date.now() - start < ms) {
    await checkPause();
    await new Promise(resolve => setTimeout(resolve, 10));
  }
};

// Highlight bars
export const highlightBars = (indices, color) => {
  checkStop();
  indices.forEach(idx => {
    const bar = document.getElementById(`bar-${idx}`);
    if (bar) bar.style.backgroundColor = color;
  });
};

// Reset all bars to default color
export const resetBarColors = (size, color = "#3498db") => {
  for (let i = 0; i < size; i++) {
    const bar = document.getElementById(`bar-${i}`);
    if (bar) bar.style.backgroundColor = color;
  }
};

// Mark target bar
export const markTargetBar = (index, found) => {
  const bar = document.getElementById(`bar-${index}`);
  if (bar) {
    bar.style.backgroundColor = found ? "#2ecc71" : "#e74c3c";
    bar.classList.add("target-bar");
  }
};

// Mark comparing bars
export const markComparingBars = (indices) => {
  indices.forEach(idx => {
    const bar = document.getElementById(`bar-${idx}`);
    if (bar) bar.style.backgroundColor = "#ff6b6b";
  });
};

// Get current stop state
export const getStopState = () => isStopped;