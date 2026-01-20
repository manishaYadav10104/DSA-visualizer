import React, { useState, useEffect, useRef } from "react";
import { useTheme } from "../../context/ThemeContext";
import { bubbleSort } from "./algorithms/BubbleSort";
import { selectionSort } from "./algorithms/SelectionSort";
import { insertionSort } from "./algorithms/InsertionSort";
import { mergeSort } from "./algorithms/MergeSort";
import { quickSort } from "./algorithms/QuickSort";
import { setPauseState, setStopState, resetSortingState } from "./algorithms/BaseSort";
import "./sorting.css";

const SortingVisualizer = ({ goBack }) => {
  const { isDarkMode } = useTheme();
  const [array, setArray] = useState([]);
  const [size, setSize] = useState(30);
  const [speed, setSpeed] = useState(50);
  const [algorithm, setAlgorithm] = useState("bubble");
  const [isSorting, setIsSorting] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [customInput, setCustomInput] = useState("");
  const [inputError, setInputError] = useState("");
  const [currentStep, setCurrentStep] = useState(0);
  const [totalSteps, setTotalSteps] = useState(0);
  const [progressPercentage, setProgressPercentage] = useState(0);
  
  // Refs for tracking
  const stepCounterRef = useRef(0);
  const progressIntervalRef = useRef(null);

  // Helper function to scale bar heights properly
 // Helper function to scale bar heights properly for 450px container
const getScaledHeight = (value) => {
  if (array.length === 0) return 40;
  
  const minValue = Math.min(...array);
  const maxValue = Math.max(...array);
  
  // If all values are the same, use a default height
  if (minValue === maxValue) return 250;
  
  // Scale between 40px and 430px based on value range (for 450px container)
  const scaled = ((value - minValue) / (maxValue - minValue)) * 390 + 40;
  return Math.max(40, Math.min(430, scaled));
};

  useEffect(() => {
    generateArray();
    return () => {
      resetSortingState();
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, [size]);

  const generateArray = () => {
    const newArray = [];
    for (let i = 0; i < size; i++) {
      newArray.push(Math.floor(Math.random() * 400) + 50);
    }
    setArray([...newArray]);
    resetBarColors();
    setInputError("");
    setCurrentStep(0);
    setTotalSteps(0);
    setProgressPercentage(0);
    stepCounterRef.current = 0;
  };

  const resetBarColors = () => {
    for (let i = 0; i < size; i++) {
      const bar = document.getElementById(`bar-${i}`);
      if (bar) {
        bar.style.backgroundColor = "#3498db";
        bar.classList.remove("comparing", "swapping", "sorted", "pivot");
      }
    }
  };

  const handleCustomInput = () => {
    if (isSorting) {
      setInputError("Cannot change array while sorting");
      return;
    }

    if (!customInput.trim()) {
      setInputError("Please enter comma-separated numbers");
      return;
    }

    try {
      const numbers = customInput
        .split(",")
        .map(num => parseInt(num.trim()))
        .filter(num => !isNaN(num) && num >= 50 && num <= 500);

      if (numbers.length === 0) {
        setInputError("Please enter valid numbers (50-500)");
        return;
      }

      if (numbers.length > 30) {
        setInputError("Maximum 30 numbers allowed");
        return;
      }

      setArray([...numbers]);
      setSize(numbers.length);
      resetBarColors();
      setInputError("");
      setCurrentStep(0);
      setTotalSteps(0);
      setProgressPercentage(0);
      stepCounterRef.current = 0;
    } catch (error) {
      setInputError("Invalid input format. Use: 100, 250, 300, 150");
    }
  };

  const generateRandomInput = () => {
    const randomNumbers = [];
    const count = Math.min(20, size);
    for (let i = 0; i < count; i++) {
      randomNumbers.push(Math.floor(Math.random() * 400) + 50);
    }
    setCustomInput(randomNumbers.join(", "));
  };

  // Calculate total steps based on algorithm
  const calculateTotalSteps = (algo, arrSize) => {
    const n = arrSize || size;
    switch(algo) {
      case "bubble":
        return Math.max(1, Math.floor((n * (n - 1)) / 2));
      case "selection":
        return Math.max(1, Math.floor((n * (n - 1)) / 2));
      case "insertion":
        return Math.max(1, Math.floor((n * (n - 1)) / 2));
      case "merge":
        return Math.max(1, Math.floor(n * Math.log2(n)) * 3);
      case "quick":
        return Math.max(1, Math.floor(n * Math.log2(n)) * 2);
      default:
        return Math.max(1, Math.floor((n * (n - 1)) / 2));
    }
  };

  // Start progress simulation
  const startProgressSimulation = (totalSteps) => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
    }
    
    stepCounterRef.current = 0;
    setCurrentStep(0);
    
    progressIntervalRef.current = setInterval(() => {
      if (isSorting && !isPaused) {
        // Increment step based on algorithm speed
        let increment = 1;
        if (algorithm === "merge" || algorithm === "quick") {
          increment = Math.max(1, Math.floor(totalSteps / 50));
        }
        
        stepCounterRef.current = Math.min(totalSteps, stepCounterRef.current + increment);
        setCurrentStep(stepCounterRef.current);
        
        const percentage = Math.min(100, (stepCounterRef.current / totalSteps) * 100);
        setProgressPercentage(percentage);
        
        if (stepCounterRef.current >= totalSteps) {
          clearInterval(progressIntervalRef.current);
        }
      }
    }, speed / 2);
  };

  const startSorting = async () => {
    if (isSorting) return;
    
    setIsSorting(true);
    setIsPaused(false);
    resetSortingState();
    resetBarColors();
    
    // Calculate and set total steps
    const steps = calculateTotalSteps(algorithm, array.length);
    setTotalSteps(steps);
    setCurrentStep(0);
    setProgressPercentage(0);
    stepCounterRef.current = 0;
    
    // Start progress simulation
    startProgressSimulation(steps);
    
    try {
      switch(algorithm) {
        case "bubble":
          await bubbleSort(array, setArray, speed);
          break;
        case "selection":
          await selectionSort(array, setArray, speed);
          break;
        case "insertion":
          await insertionSort(array, setArray, speed);
          break;
        case "merge":
          await mergeSort(array, setArray, speed);
          break;
        case "quick":
          await quickSort(array, setArray, speed);
          break;
        default:
          await bubbleSort(array, setArray, speed);
      }
      
      // When sorting completes, set to 100%
      setCurrentStep(steps);
      setProgressPercentage(100);
    } catch (error) {
      if (error.message === "Sorting stopped by user") {
        console.log("Sorting stopped");
      } else {
        console.error("Sorting error:", error);
      }
    } finally {
      setIsSorting(false);
      setIsPaused(false);
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
    }
  };

  const togglePause = () => {
    const newPausedState = !isPaused;
    setIsPaused(newPausedState);
    setPauseState(newPausedState);
  };

  const stopSorting = () => {
    if (isSorting) {
      setIsSorting(false);
      setIsPaused(false);
      setStopState(true);
      
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
      
      setTimeout(() => {
        resetSortingState();
      }, 100);
    }
  };

  const algorithmInfo = {
    bubble: {
      name: "Bubble Sort",
      description: "Repeatedly steps through the list, compares adjacent elements and swaps them if they are in the wrong order.",
      timeComplexity: {
        best: "O(n)",
        average: "O(n²)",
        worst: "O(n²)"
      },
      spaceComplexity: "O(1)",
      stable: "Yes",
      inPlace: "Yes"
    },
    selection: {
      name: "Selection Sort",
      description: "Divides the input list into two parts: sorted and unsorted. Repeatedly selects the smallest element from unsorted part.",
      timeComplexity: {
        best: "O(n²)",
        average: "O(n²)",
        worst: "O(n²)"
      },
      spaceComplexity: "O(1)",
      stable: "No",
      inPlace: "Yes"
    },
    insertion: {
      name: "Insertion Sort",
      description: "Builds the final sorted array one item at a time. Much like sorting playing cards in your hands.",
      timeComplexity: {
        best: "O(n)",
        average: "O(n²)",
        worst: "O(n²)"
      },
      spaceComplexity: "O(1)",
      stable: "Yes",
      inPlace: "Yes"
    },
    merge: {
      name: "Merge Sort",
      description: "Divide and conquer algorithm that divides input array into two halves, recursively sorts them, and then merges.",
      timeComplexity: {
        best: "O(n log n)",
        average: "O(n log n)",
        worst: "O(n log n)"
      },
      spaceComplexity: "O(n)",
      stable: "Yes",
      inPlace: "No"
    },
    quick: {
      name: "Quick Sort",
      description: "Divide and conquer algorithm that picks a pivot element and partitions the array around the pivot.",
      timeComplexity: {
        best: "O(n log n)",
        average: "O(n log n)",
        worst: "O(n²)"
      },
      spaceComplexity: "O(log n)",
      stable: "No",
      inPlace: "Yes"
    }
  };

  return (
    <div className="sorting-page">
      <div className="sorting-header">
        <button className="back-btn" onClick={goBack}>
          ← Back to Home
        </button>
        <div className="algorithm-title">
          <h1>{algorithmInfo[algorithm].name}</h1>
          <p>Visualize the sorting process step by step</p>
        </div>
      </div>

      {/* Main Visualization Container */}
      <div className="main-visualization-container">
        <div className="container-header">
          <h2>Sorting Visualizer</h2>
          <div className="status-indicator">
            <div className={`status-dot ${isSorting ? (isPaused ? 'paused' : 'sorting') : 'idle'}`}></div>
            <span>
              {isSorting ? 
                (isPaused ? 'PAUSED' : 'SORTING') : 
                'READY'}
            </span>
          </div>
        </div>

        <div className="container-content">
          {/* Left Panel - Controls */}
          <div className="controls-panel">
            <div className="input-section">
              <h3>Custom Array Input:</h3>
              <p>Enter comma-separated numbers (e.g., 100, 250, 150, 300, 200)</p>
              <div className="input-with-buttons">
                <input
                  type="text"
                  placeholder="100, 250, 150, 300, 200"
                  value={customInput}
                  onChange={(e) => setCustomInput(e.target.value)}
                  disabled={isSorting}
                  className="custom-input"
                />
                <div className="input-buttons">
                  <button 
                    className="generate-random-btn"
                    onClick={generateRandomInput}
                    disabled={isSorting}
                  >
                    Random
                  </button>
                  <button 
                    className="apply-btn"
                    onClick={handleCustomInput}
                    disabled={isSorting}
                  >
                    Apply
                  </button>
                </div>
              </div>
              {inputError && <div className="input-error">{inputError}</div>}
              <div className="input-hint">
                Enter numbers separated by commas (50-500), max 30 numbers
              </div>
            </div>

            <div className="algorithm-selector">
              <h3>Algorithm</h3>
              <div className="algorithm-badge">
                <strong>{algorithmInfo[algorithm].name}</strong>
              </div>
              <select 
                value={algorithm} 
                onChange={(e) => setAlgorithm(e.target.value)}
                disabled={isSorting}
              >
                <option value="bubble">Bubble Sort</option>
                <option value="selection">Selection Sort</option>
                <option value="insertion">Insertion Sort</option>
                <option value="merge">Merge Sort</option>
                <option value="quick">Quick Sort</option>
              </select>
            </div>

            <div className="config-section">
              <div className="config-item">
                <label htmlFor="arraySize">Array Size: {size}</label>
                <input
                  id="arraySize"
                  type="range"
                  min="5"
                  max="30"
                  value={size}
                  onChange={(e) => setSize(parseInt(e.target.value))}
                  disabled={isSorting}
                />
              </div>
              
              <div className="config-item">
                <label htmlFor="speed">Speed: {speed}ms</label>
                <input
                  id="speed"
                  type="range"
                  min="5"
                  max="200"
                  value={speed}
                  onChange={(e) => setSpeed(parseInt(e.target.value))}
                  disabled={isSorting}
                />
              </div>
            </div>

            <div className="progress-section">
              <div className="progress-info">
                <span>Step: {currentStep} of {totalSteps}</span>
                <span>{progressPercentage.toFixed(1)}%</span>
              </div>
              <div className="progress-bar">
                <div 
                  className="progress-fill"
                  style={{ width: `${progressPercentage}%` }}
                ></div>
              </div>
              {isSorting && (
                <div className="progress-note">
                  {algorithm === "merge" || algorithm === "quick" 
                    ? "Estimated progress" 
                    : "Progress"}
                </div>
              )}
            </div>
          </div>

          {/* Right Panel - Visualization */}
          <div className="visualization-panel">
            <div className="visualization-header">
              <h3>Visualization</h3>
              <div className="control-buttons">
                <button 
                  className="control-btn random-array" 
                  onClick={generateArray}
                  disabled={isSorting}
                >
                  Random Array
                </button>
                <button 
                  className="control-btn start-sort" 
                  onClick={startSorting}
                  disabled={isSorting}
                >
                  {isSorting ? "Sorting..." : "Start Sorting"}
                </button>
                <button 
                  className="control-btn pause-btn"
                  onClick={togglePause}
                  disabled={!isSorting}
                >
                  {isPaused ? "▶ Resume" : "⏸ Pause"}
                </button>
                <button 
                  className="control-btn stop-btn"
                  onClick={stopSorting}
                  disabled={!isSorting}
                >
                  ⏹ Stop
                </button>
              </div>
            </div>

            <div className="visualization-area">
              <div className="array-container">
                {array.map((value, idx) => (
                  <div
                    key={idx}
                    id={`bar-${idx}`}
                    className="array-bar"
                    style={{
                      height: `${getScaledHeight(value)}px`,
                      width: `${Math.max(8, 700 / size)}px`,
                      backgroundColor: "#3498db"
                    }}
                  >
                    <span className="bar-value">{size <= 30 ? value : ""}</span>
                  </div>
                ))}
              </div>

              <div className="legend">
                <div className="legend-item">
                  <div className="legend-color" style={{ backgroundColor: "#3498db" }}></div>
                  <span>Unsorted</span>
                </div>
                <div className="legend-item">
                  <div className="legend-color" style={{ backgroundColor: "#ff6b6b" }}></div>
                  <span>Comparing</span>
                </div>
                <div className="legend-item">
                  <div className="legend-color" style={{ backgroundColor: "#4ecdc4" }}></div>
                  <span>Swapping</span>
                </div>
                <div className="legend-item">
                  <div className="legend-color" style={{ backgroundColor: "#2ecc71" }}></div>
                  <span>Sorted</span>
                </div>
                <div className="legend-item">
                  <div className="legend-color" style={{ backgroundColor: "#feca57" }}></div>
                  <span>Pivot/Min</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Algorithm Info Section */}
        <div className="algorithm-info-section">
          <h3>About {algorithmInfo[algorithm].name}</h3>
          <p>{algorithmInfo[algorithm].description}</p>
          
          <div className="complexity-grid">
            <div className="complexity-card">
              <h4>Time Complexity</h4>
              <div className="complexity-values">
                <span>Best: {algorithmInfo[algorithm].timeComplexity.best}</span>
                <span>Average: {algorithmInfo[algorithm].timeComplexity.average}</span>
                <span>Worst: {algorithmInfo[algorithm].timeComplexity.worst}</span>
              </div>
            </div>
            <div className="complexity-card">
              <h4>Space Complexity</h4>
              <span>{algorithmInfo[algorithm].spaceComplexity}</span>
            </div>
            <div className="complexity-card">
              <h4>Stable</h4>
              <span>{algorithmInfo[algorithm].stable}</span>
            </div>
            <div className="complexity-card">
              <h4>In-Place</h4>
              <span>{algorithmInfo[algorithm].inPlace}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SortingVisualizer;