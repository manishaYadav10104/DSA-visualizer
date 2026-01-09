import React, { useEffect, useState } from "react";
import "./sorting.css";

import BubbleSort from "./Algorithms/BubbleSort";
import SelectionSort from "./Algorithms/SelectionSort";
import InsertionSort from "./Algorithms/InsertionSort";
import MergeSort from "./Algorithms/MergeSort";
import QuickSort from "./Algorithms/QuickSort";

const ALGORITHMS = {
  "Bubble Sort": {
    func: BubbleSort,
    code: `function bubbleSort(arr) {
  for (let i = 0; i < arr.length; i++) {
    for (let j = 0; j < arr.length - i - 1; j++) {
      if (arr[j] > arr[j + 1]) {
        let temp = arr[j];
        arr[j] = arr[j+1];
        arr[j+1] = temp;
      }
    }
  }
}`,
  },
  "Selection Sort": {
    func: SelectionSort,
    code: `function selectionSort(arr) {
  for (let i = 0; i < arr.length; i++) {
    let minIdx = i;
    for (let j = i + 1; j < arr.length; j++) {
      if (arr[j] < arr[minIdx]) minIdx = j;
    }
    [arr[i], arr[minIdx]] = [arr[minIdx], arr[i]];
  }
}`,
  },
  "Insertion Sort": {
    func: InsertionSort,
    code: `function insertionSort(arr) {
  for (let i = 1; i < arr.length; i++) {
    let key = arr[i];
    let j = i - 1;
    while (j >= 0 && arr[j] > key) {
      arr[j+1] = arr[j];
      j--;
    }
    arr[j+1] = key;
  }
}`,
  },
  "Merge Sort": {
    func: MergeSort,
    code: `function mergeSort(arr) {
  if (arr.length <= 1) return arr;
  const mid = Math.floor(arr.length/2);
  const left = mergeSort(arr.slice(0, mid));
  const right = mergeSort(arr.slice(mid));
  return merge(left, right);
}`,
  },
  "Quick Sort": {
    func: QuickSort,
    code: `function quickSort(arr, low=0, high=arr.length-1) {
  if (low < high) {
    const pi = partition(arr, low, high);
    quickSort(arr, low, pi-1);
    quickSort(arr, pi+1, high);
  }
}`,
  },
};

export default function SortingVisualizer({ goBack }) {
  const [array, setArray] = useState([]);
  const [arraySize, setArraySize] = useState(30);
  const [selectedAlgo, setSelectedAlgo] = useState("Bubble Sort");
  const [speed, setSpeed] = useState(60);
  const [isSorting, setIsSorting] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [activeBars, setActiveBars] = useState([]);
  const [sortedIndices, setSortedIndices] = useState([]);
  const [comparisons, setComparisons] = useState(0);
  const [swaps, setSwaps] = useState(0);
  const [isStepMode, setIsStepMode] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [animations, setAnimations] = useState([]);

  useEffect(() => {
    generateArray();
  }, [arraySize]);

  const generateArray = () => {
    if (isSorting) return;
    setComparisons(0);
    setSwaps(0);
    setSortedIndices([]);
    const arr = Array.from({ length: arraySize }, () =>
      Math.floor(Math.random() * 300) + 20
    );
    setArray(arr);
    setAnimations([]);
    setCurrentStepIndex(0);
  };

  const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

  const waitUntilResume = async () => {
    while (isPaused) await sleep(50);
  };

  const startSorting = async (stepMode = false) => {
    if (isSorting) return;
    setIsSorting(true);
    setIsStepMode(stepMode);

    let arr = [...array];
    let anims = animations;

    if (anims.length === 0) {
      anims = ALGORITHMS[selectedAlgo].func.getAnimations(array);
      setAnimations(anims);
    }

    for (let i = currentStepIndex; i < anims.length; i++) {
      setCurrentStepIndex(i);

      const step = anims[i];

      await waitUntilResume();

      if (step.type === "compare") {
        setActiveBars(step.indices);
        setComparisons((prev) => prev + 1);
      }

      if (step.type === "swap") {
        const [x, y] = step.indices;
        arr[x] = step.values[0];
        arr[y] = step.values[1];
        setArray([...arr]);
        setSwaps((prev) => prev + 1);
      }

      if (step.type === "overwrite") {
        arr[step.index] = step.value;
        setArray([...arr]);
        setSwaps((prev) => prev + 1);
      }

      if (step.type === "sorted") {
        setSortedIndices((prev) => [...prev, step.index]);
      }

      await sleep(speed);

      if (stepMode) {
        setIsSorting(false);
        return;
      }
    }

    setSortedIndices(array.map((_, i) => i));
    setActiveBars([]);
    setIsSorting(false);
    setIsStepMode(false);
    setCurrentStepIndex(0);
    setAnimations([]);
  };

  const nextStep = () => {
    startSorting(true);
  };

  return (
    <div className="sorting-page">
      <div className="sorting-toolbar">
        <button onClick={goBack}>← Back</button>

        <select
          value={selectedAlgo}
          onChange={(e) => setSelectedAlgo(e.target.value)}
          disabled={isSorting}
        >
          {Object.keys(ALGORITHMS).map((algo) => (
            <option key={algo}>{algo}</option>
          ))}
        </select>

        <button onClick={generateArray} disabled={isSorting}>
          Generate Array
        </button>

        <button
          className="sort-btn"
          onClick={() => startSorting()}
          disabled={isSorting}
        >
          Sort
        </button>

        <button onClick={() => setIsPaused(!isPaused)} disabled={!isSorting}>
          {isPaused ? "Resume" : "Pause"}
        </button>

        <button onClick={nextStep} disabled={isSorting && !isPaused}>
          Next Step
        </button>

        <div className="speed-control">
          <span>Speed</span>
          <input
            type="range"
            min="10"
            max="200"
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
            disabled={isSorting}
          />
        </div>

        <div className="speed-control">
          <span>Size</span>
          <input
            type="range"
            min="10"
            max="80"
            value={arraySize}
            onChange={(e) => setArraySize(Number(e.target.value))}
            disabled={isSorting}
          />
        </div>

        <div className="counters">
          <span>Comparisons: {comparisons}</span>
          <span>Swaps: {swaps}</span>
        </div>
      </div>

      <div className="visualization-panel" style={{display: 'flex', gap: '12px'}}>
        <div className="array-container" style={{flex: 3}}>
          {array.map((value, idx) => (
            <div
              key={idx}
              className={`array-bar ${
                activeBars.includes(idx)
                  ? "active"
                  : sortedIndices.includes(idx)
                  ? "sorted"
                  : ""
              }`}
              style={{ height: `${value}px` }}
            />
          ))}
        </div>

        <div className="code-panel" style={{flex: 2, backgroundColor: "#0f172a", color: "#cbd5e1", padding: "12px", borderRadius: "6px", fontFamily: "monospace", whiteSpace: "pre-wrap", overflowY: "auto", maxHeight: "500px"}}>
          <pre>{ALGORITHMS[selectedAlgo].code}</pre>
        </div>
      </div>
    </div>
  );
}
