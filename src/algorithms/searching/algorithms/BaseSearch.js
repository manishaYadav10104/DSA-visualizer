// BaseSearch.js - Base functions for searching algorithms
let isPaused = false;
let isStopped = false;

export const setPauseState = (state) => {
  isPaused = state;
};

export const setStopState = (state) => {
  isStopped = state;
};

export const resetSearchingState = () => {
  isPaused = false;
  isStopped = false;
};

export const waitIfPaused = async () => {
  while (isPaused && !isStopped) {
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  return !isStopped;
};