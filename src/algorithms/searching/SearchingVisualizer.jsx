import React, { useState, useEffect, useRef } from "react";
import { useTheme } from "../../context/ThemeContext";
import { linearSearch } from "./algorithms/LinearSearch";
import { binarySearch } from "./algorithms/BinarySearch";
import { jumpSearch } from "./algorithms/JumpSearch";
import { exponentialSearch } from "./algorithms/ExponentialSearch";
import { setPauseState, setStopState, resetSearchingState } from "./algorithms/BaseSearch";
import "./searching.css";

const SearchingVisualizer = ({ goBack }) => {
  const { isDarkMode } = useTheme();
  const [array, setArray] = useState([]);
  const [size, setSize] = useState(15); // Reduced for better visualization
  const [speed, setSpeed] = useState(500); // Much slower default: 500ms
  const [speedPreset, setSpeedPreset] = useState("slow"); // Start with slow
  const [algorithm, setAlgorithm] = useState("linear");
  const [isSearching, setIsSearching] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [inputError, setInputError] = useState("");
  const [foundIndex, setFoundIndex] = useState(-1);
  const [searchHistory, setSearchHistory] = useState([]);
  const [isSorted, setIsSorted] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [searchResult, setSearchResult] = useState(null);
  const [comparisonCount, setComparisonCount] = useState(0);
  
  const resultTimeoutRef = useRef(null);

  // Speed presets (in milliseconds) - Much slower for better visualization
  const speedPresets = {
    "very-slow": { value: 1000, label: "Very Slow" },
    "slow": { value: 700, label: "Slow" },
    "medium": { value: 400, label: "Medium" },
    "fast": { value: 200, label: "Fast" },
    "very-fast": { value: 50, label: "Very Fast" }
  };

  useEffect(() => {
    generateSortedArray();
    return () => {
      resetSearchingState();
      if (resultTimeoutRef.current) {
        clearTimeout(resultTimeoutRef.current);
      }
    };
  }, [size]);

  // Update speed when preset changes
  useEffect(() => {
    setSpeed(speedPresets[speedPreset].value);
  }, [speedPreset]);

  const generateSortedArray = () => {
    setIsGenerating(true);
    const newArray = [];
    // Generate distinct sorted numbers for better visualization
    for (let i = 0; i < size; i++) {
      // Create increasing values with small variations
      const baseValue = 50 + (i * 30); // Start from 50, increase by 30 each step
      const randomVariation = Math.floor(Math.random() * 15);
      newArray.push(baseValue + randomVariation);
    }
    
    // Ensure array is sorted
    newArray.sort((a, b) => a - b);
    
    // Make sure values are distinct
    const distinctArray = [...new Set(newArray)];
    while (distinctArray.length < size) {
      distinctArray.push(distinctArray[distinctArray.length - 1] + 20);
    }
    
    setArray([...distinctArray.slice(0, size)]);
    resetBarColors();
    setInputError("");
    setFoundIndex(-1);
    setSearchHistory([]);
    setSearchResult(null);
    setComparisonCount(0);
    setIsSorted(true);
    setIsGenerating(false);
    
    // Auto-generate a search value that exists in the array
    if (distinctArray.length > 0) {
      const randomIndex = Math.floor(Math.random() * Math.min(5, distinctArray.length));
      setSearchValue(distinctArray[randomIndex].toString());
    }
  };

  const generateRandomArray = () => {
    setIsGenerating(true);
    const newArray = [];
    // Generate random numbers with larger range for taller bars
    for (let i = 0; i < size; i++) {
      // Generate values between 40 and 400 for good bar height
      newArray.push(Math.floor(Math.random() * 360) + 40);
    }
    setArray([...newArray]);
    resetBarColors();
    setInputError("");
    setFoundIndex(-1);
    setSearchHistory([]);
    setSearchResult(null);
    setComparisonCount(0);
    setIsSorted(false);
    
    // Auto-switch to linear search for unsorted arrays
    if (algorithm !== "linear") {
      setAlgorithm("linear");
      setInputError("Switched to Linear Search for unsorted array");
    }
    
    // Auto-generate a search value
    if (newArray.length > 0) {
      const randomIndex = Math.floor(Math.random() * Math.min(5, newArray.length));
      setSearchValue(newArray[randomIndex].toString());
    }
    
    setIsGenerating(false);
  };

  const resetBarColors = () => {
    for (let i = 0; i < size; i++) {
      const bar = document.getElementById(`bar-${i}`);
      if (bar) {
        bar.style.backgroundColor = "#3498db";
        bar.classList.remove("searching", "found", "checked", "current");
        bar.style.transform = "scale(1)";
        bar.style.boxShadow = "none";
      }
    }
  };

  const handleSearchValueChange = (e) => {
    const value = e.target.value;
    setSearchValue(value);
    
    // Reset if input is cleared
    if (!value.trim()) {
      resetBarColors();
      setFoundIndex(-1);
      setSearchHistory([]);
      setSearchResult(null);
      setComparisonCount(0);
    }
  };

  const generateRandomSearchValue = () => {
    // Generate a random value that might be in the array
    if (array.length > 0) {
      const randomIndex = Math.floor(Math.random() * array.length);
      setSearchValue(array[randomIndex].toString());
    } else {
      setSearchValue(Math.floor(Math.random() * 400 + 40).toString());
    }
  };

  const highlightBar = (index, className) => {
    const bar = document.getElementById(`bar-${index}`);
    if (bar) {
      // Remove previous classes except 'found'
      if (className !== 'found') {
        bar.classList.remove("searching", "checked", "current");
        bar.style.transform = "scale(1)";
        bar.style.boxShadow = "none";
      }
      
      bar.classList.add(className);
      
      // Set color and effects based on class
      switch(className) {
        case 'searching':
          bar.style.backgroundColor = "#ff6b6b";
          bar.style.transform = "scale(1.1)";
          bar.style.boxShadow = "0 0 20px rgba(255, 107, 107, 0.7)";
          break;
        case 'found':
          bar.style.backgroundColor = "#2ecc71";
          bar.style.transform = "scale(1.15)";
          bar.style.boxShadow = "0 0 30px rgba(46, 204, 113, 0.8)";
          break;
        case 'checked':
          bar.style.backgroundColor = "#4ecdc4";
          bar.style.transform = "scale(1.05)";
          break;
        case 'current':
          bar.style.backgroundColor = "#feca57";
          bar.style.transform = "scale(1.1)";
          bar.style.boxShadow = "0 0 15px rgba(254, 202, 87, 0.6)";
          break;
        default:
          bar.style.backgroundColor = "#3498db";
          bar.style.transform = "scale(1)";
      }
    }
  };

  const clearResult = () => {
    if (resultTimeoutRef.current) {
      clearTimeout(resultTimeoutRef.current);
    }
    setSearchResult(null);
  };

  const showResult = (result, value, comparisons) => {
    clearResult();
    
    if (result !== -1) {
      setSearchResult({
        type: 'found',
        message: `✓ Found ${value} at index ${result}`,
        value: array[result],
        index: result,
        comparisons: comparisons
      });
    } else {
      setSearchResult({
        type: 'not-found',
        message: `✗ Value ${value} not found in array`,
        value: value,
        comparisons: comparisons
      });
    }

    // Clear result after 8 seconds (longer for slow visualization)
    resultTimeoutRef.current = setTimeout(() => {
      setSearchResult(null);
    }, 8000);
  };

  const handleSpeedPresetChange = (preset) => {
    setSpeedPreset(preset);
    setSpeed(speedPresets[preset].value);
  };

  const handleSpeedChange = (e) => {
    const newSpeed = parseInt(e.target.value);
    setSpeed(newSpeed);
    
    // Find closest preset
    let closestPreset = "slow";
    let minDiff = Infinity;
    
    Object.entries(speedPresets).forEach(([preset, { value }]) => {
      const diff = Math.abs(value - newSpeed);
      if (diff < minDiff) {
        minDiff = diff;
        closestPreset = preset;
      }
    });
    
    setSpeedPreset(closestPreset);
  };

  const startSearching = async () => {
    if (isSearching || !searchValue.trim()) {
      setInputError("Please enter a search value");
      return;
    }

    const searchNum = parseInt(searchValue, 10);
    if (isNaN(searchNum)) {
      setInputError("Please enter a valid number");
      return;
    }

    if (searchNum < 1 || searchNum > 1000) {
      setInputError("Please enter a number between 1 and 1000");
      return;
    }

    // Validate algorithm requirements
    if ((algorithm === "binary" || algorithm === "jump" || algorithm === "exponential") && !isSorted) {
      setInputError(`⚠️ ${algorithmInfo[algorithm].name} requires a sorted array. Click "Sorted Array" button.`);
      return;
    }

    setIsSearching(true);
    setIsPaused(false);
    resetSearchingState();
    resetBarColors();
    setFoundIndex(-1);
    setSearchHistory([]);
    setComparisonCount(0);
    clearResult();

    try {
      let result = -1;
      const history = [];
      let comparisons = 0;

      // Create a wrapper that counts comparisons
      const countingHighlightBar = (index, className) => {
        if (className === 'searching') {
          comparisons++;
          setComparisonCount(comparisons);
        }
        highlightBar(index, className);
      };

      switch(algorithm) {
        case "linear":
          result = await linearSearch(array, searchNum, speed, countingHighlightBar, history);
          break;
        case "binary":
          result = await binarySearch(array, searchNum, speed, countingHighlightBar, history);
          break;
        case "jump":
          result = await jumpSearch(array, searchNum, speed, countingHighlightBar, history);
          break;
        case "exponential":
          result = await exponentialSearch(array, searchNum, speed, countingHighlightBar, history);
          break;
        default:
          result = await linearSearch(array, searchNum, speed, countingHighlightBar, history);
      }

      setFoundIndex(result);
      setSearchHistory(history);

      // Show result in bar container
      showResult(result, searchNum, comparisons);

      // If found, highlight the bar permanently
      if (result !== -1) {
        const bar = document.getElementById(`bar-${result}`);
        if (bar) {
          bar.classList.add("found");
          bar.style.backgroundColor = "#2ecc71";
          bar.style.transform = "scale(1.15)";
          bar.style.boxShadow = "0 0 30px rgba(46, 204, 113, 0.8)";
        }
      }

    } catch (error) {
      if (error.message === "Searching stopped by user") {
        console.log("Searching stopped");
        setSearchResult({
          type: 'stopped',
          message: '⏹ Search stopped by user'
        });
      } else if (error.message.includes("Array must be sorted")) {
        setInputError(error.message);
        setSearchResult({
          type: 'error',
          message: `❌ ${error.message}`
        });
      } else {
        console.error("Searching error:", error);
        setInputError("An error occurred during search");
        setSearchResult({
          type: 'error',
          message: '❌ An error occurred during search'
        });
      }
    } finally {
      setIsSearching(false);
      setIsPaused(false);
    }
  };

  const togglePause = () => {
    const newPausedState = !isPaused;
    setIsPaused(newPausedState);
    setPauseState(newPausedState);
  };

  const stopSearching = () => {
    if (isSearching) {
      setIsSearching(false);
      setIsPaused(false);
      setStopState(true);
      
      setTimeout(() => {
        resetSearchingState();
      }, 100);
    }
  };

  const resetSearch = () => {
    resetBarColors();
    setFoundIndex(-1);
    setSearchHistory([]);
    setInputError("");
    setComparisonCount(0);
    clearResult();
  };

  const algorithmInfo = {
    linear: {
      name: "Linear Search",
      description: "Sequentially checks each element of the list until a match is found or the whole list has been searched. Works on both sorted and unsorted arrays.",
      timeComplexity: {
        best: "O(1)",
        average: "O(n)",
        worst: "O(n)"
      },
      spaceComplexity: "O(1)",
      sortedRequired: "No",
      useCase: "Small datasets or unsorted data"
    },
    binary: {
      name: "Binary Search",
      description: "Efficient algorithm for finding an item from a sorted list of items. It works by repeatedly dividing in half the portion of the list that could contain the item.",
      timeComplexity: {
        best: "O(1)",
        average: "O(log n)",
        worst: "O(log n)"
      },
      spaceComplexity: "O(1)",
      sortedRequired: "Yes",
      useCase: "Large sorted datasets"
    },
    jump: {
      name: "Jump Search",
      description: "Jump search checks fewer elements than linear search by jumping ahead by fixed steps. Once a block containing the target is found, it performs a linear search within that block.",
      timeComplexity: {
        best: "O(1)",
        average: "O(√n)",
        worst: "O(√n)"
      },
      spaceComplexity: "O(1)",
      sortedRequired: "Yes",
      useCase: "Sorted arrays where binary search is not preferred"
    },
    exponential: {
      name: "Exponential Search",
      description: "Exponential search involves two steps: find range where element is present and do binary search in that range. Particularly useful for unbounded/infinite arrays.",
      timeComplexity: {
        best: "O(1)",
        average: "O(log n)",
        worst: "O(log n)"
      },
      spaceComplexity: "O(1)",
      sortedRequired: "Yes",
      useCase: "Unbounded/infinite sorted arrays"
    }
  };

  return (
    <div className="searching-page">
      <div className="searching-header">
        <button className="back-btn" onClick={goBack}>
          ← Back to Home
        </button>
        <div className="algorithm-title">
          <h1>{algorithmInfo[algorithm].name}</h1>
          <p>Visualize the searching process step by step</p>
        </div>
      </div>

      {/* Main Visualization Container */}
      <div className="main-visualization-container">
        <div className="container-header">
          <h2>Searching Visualizer</h2>
          <div className="status-indicator">
            <div className={`status-dot ${isSearching ? (isPaused ? 'paused' : 'searching') : foundIndex !== -1 ? 'found' : 'idle'}`}></div>
            <span>
              {isSearching ? 
                (isPaused ? 'PAUSED' : 'SEARCHING') : 
                foundIndex !== -1 ? 'FOUND' : 'READY'}
            </span>
            {comparisonCount > 0 && (
              <span className="comparison-count">
                Comparisons: {comparisonCount}
              </span>
            )}
          </div>
        </div>

        <div className="container-content">
          {/* Left Panel - Controls */}
          <div className="controls-panel">
            <div className="input-section">
              <h3>Search Value:</h3>
              <p>Enter a number to search in the array</p>
              <div className="input-with-buttons">
                <input
                  type="number"
                  placeholder="Enter a number"
                  value={searchValue}
                  onChange={handleSearchValueChange}
                  disabled={isSearching}
                  className="search-input"
                  min="1"
                  max="1000"
                />
                <div className="input-buttons">
                  <button 
                    className="generate-random-btn"
                    onClick={generateRandomSearchValue}
                    disabled={isSearching}
                  >
                    Random
                  </button>
                </div>
              </div>
              {inputError && <div className="input-error">{inputError}</div>}
              
              <div className="array-controls">
                <button 
                  className="array-btn sorted-array"
                  onClick={generateSortedArray}
                  disabled={isSearching || isGenerating}
                >
                  {isGenerating ? "Generating..." : "Sorted Array"}
                </button>
                <button 
                  className="array-btn random-array"
                  onClick={generateRandomArray}
                  disabled={isSearching || isGenerating}
                >
                  {isGenerating ? "Generating..." : "Random Array"}
                </button>
              </div>
              
              <div className="array-status">
                <span className={`status-badge ${isSorted ? 'sorted' : 'unsorted'}`}>
                  {isSorted ? "✓ Sorted" : "✗ Unsorted"}
                </span>
                <span className="size-info">Size: {size} elements</span>
                <span className="value-range">
                  Values: {Math.min(...array)} - {Math.max(...array)}
                </span>
              </div>
            </div>

            <div className="algorithm-selector">
              <h3>Algorithm</h3>
              <div className="algorithm-badge">
                <strong>{algorithmInfo[algorithm].name}</strong>
              </div>
              <select 
                value={algorithm} 
                onChange={(e) => {
                  const newAlgo = e.target.value;
                  if ((newAlgo === "binary" || newAlgo === "jump" || newAlgo === "exponential") && !isSorted) {
                    setInputError("This algorithm requires a sorted array");
                    return;
                  }
                  setAlgorithm(newAlgo);
                  setInputError("");
                }}
                disabled={isSearching}
              >
                <option value="linear">Linear Search</option>
                <option value="binary">Binary Search</option>
                <option value="jump">Jump Search</option>
                <option value="exponential">Exponential Search</option>
              </select>
            </div>

            <div className="config-section">
              <div className="config-item">
                <label htmlFor="arraySize">Array Size: {size}</label>
                <input
                  id="arraySize"
                  type="range"
                  min="8"
                  max="25"
                  value={size}
                  onChange={(e) => setSize(parseInt(e.target.value))}
                  disabled={isSearching}
                />
                <div className="size-labels">
                  <span>Small</span>
                  <span>Medium</span>
                  <span>Large</span>
                </div>
              </div>
              
              <div className="config-item">
                <label htmlFor="speed">Speed: {speed}ms</label>
                <input
                  id="speed"
                  type="range"
                  min="50"
                  max="1500"  // Even slower maximum
                  value={speed}
                  onChange={handleSpeedChange}
                  disabled={isSearching}
                />
                <div className="speed-labels">
                  <span>Slow</span>
                  <span>Very Slow</span>
                </div>
                
                <div className="speed-presets">
                  <div className="preset-buttons">
                    {Object.entries(speedPresets).map(([preset, { label }]) => (
                      <button
                        key={preset}
                        className={`preset-btn ${speedPreset === preset ? 'active' : ''}`}
                        onClick={() => handleSpeedPresetChange(preset)}
                        disabled={isSearching}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="performance-info">
              <h4>Performance</h4>
              <div className="performance-stats">
                <div className="stat-item">
                  <span className="stat-label">Comparisons:</span>
                  <span className="stat-value">{comparisonCount}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Steps:</span>
                  <span className="stat-value">{searchHistory.length}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Status:</span>
                  <span className={`stat-value ${foundIndex !== -1 ? 'found' : isSearching ? 'searching' : 'ready'}`}>
                    {foundIndex !== -1 ? 'Found' : isSearching ? 'Searching' : 'Ready'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel - Visualization */}
          <div className="visualization-panel">
            <div className="visualization-header">
              <h3>Visualization</h3>
              <div className="control-buttons">
                <button 
                  className="control-btn reset-btn" 
                  onClick={resetSearch}
                  disabled={isSearching}
                >
                  ↻ Reset
                </button>
                <button 
                  className="control-btn start-search" 
                  onClick={startSearching}
                  disabled={isSearching || !searchValue.trim()}
                >
                  {isSearching ? "Searching..." : "Start Search"}
                </button>
                <button 
                  className="control-btn pause-btn"
                  onClick={togglePause}
                  disabled={!isSearching}
                >
                  {isPaused ? "▶ Resume" : "⏸ Pause"}
                </button>
                <button 
                  className="control-btn stop-btn"
                  onClick={stopSearching}
                  disabled={!isSearching}
                >
                  ⏹ Stop
                </button>
              </div>
            </div>

            <div className="visualization-area">
              <div className="array-container">
                {searchResult && (
                  <div className={`result-display ${searchResult.type}`}>
                    <div className="result-message">
                      {searchResult.message}
                    </div>
                    {searchResult.type === 'found' && (
                      <div className="result-details">
                        Value: <strong>{searchResult.value}</strong> | 
                        Index: <strong>{searchResult.index}</strong> | 
                        Comparisons: <strong>{searchResult.comparisons}</strong>
                      </div>
                    )}
                    {searchResult.type === 'not-found' && (
                      <div className="result-details">
                        Searched entire array | Comparisons: <strong>{searchResult.comparisons}</strong>
                      </div>
                    )}
                  </div>
                )}
                
                {array.map((value, idx) => (
                  <div
                    key={idx}
                    id={`bar-${idx}`}
                    className={`array-bar ${foundIndex === idx ? 'found' : ''}`}
                    style={{
                      height: `${value}px`, // Increased height: use actual value as pixels
                      width: `${Math.max(25, 900 / size)}px`, // Wider bars
                      backgroundColor: foundIndex === idx ? "#2ecc71" : "#3498db"
                    }}
                  >
                    <span className="bar-value">{value}</span>
                    <span className="bar-index">{idx}</span>
                  </div>
                ))}
              </div>

              <div className="legend">
                <div className="legend-item">
                  <div className="legend-color" style={{ backgroundColor: "#3498db" }}></div>
                  <span>Unchecked</span>
                </div>
                <div className="legend-item">
                  <div className="legend-color" style={{ backgroundColor: "#ff6b6b" }}></div>
                  <span>Checking</span>
                </div>
                <div className="legend-item">
                  <div className="legend-color" style={{ backgroundColor: "#feca57" }}></div>
                  <span>Current</span>
                </div>
                <div className="legend-item">
                  <div className="legend-color" style={{ backgroundColor: "#4ecdc4" }}></div>
                  <span>Checked</span>
                </div>
                <div className="legend-item">
                  <div className="legend-color" style={{ backgroundColor: "#2ecc71" }}></div>
                  <span>Found</span>
                </div>
              </div>

              {searchHistory.length > 0 && (
                <div className="search-history">
                  <h4>Search Steps: {searchHistory.length}</h4>
                  <div className="history-steps">
                    {searchHistory.slice(-6).map((step, idx) => (
                      <div key={idx} className="history-step">
                        <span className="step-index">Step {searchHistory.length - 5 + idx}:</span>
                        <span className="step-action">Index {step.index} → {step.value}</span>
                        <span className={`step-result ${step.found ? 'found' : 'not-found'}`}>
                          {step.found ? '✓ Found' : '→'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
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
              <h4>Sorted Required</h4>
              <span>{algorithmInfo[algorithm].sortedRequired}</span>
            </div>
            <div className="complexity-card">
              <h4>Best Use Case</h4>
              <span>{algorithmInfo[algorithm].useCase}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchingVisualizer;