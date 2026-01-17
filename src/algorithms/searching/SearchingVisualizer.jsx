import React, { useState, useEffect } from "react";
import { useTheme } from "../../context/ThemeContext";
import { linearSearch } from "./algorithms/LinearSearch";
import { binarySearch } from "./algorithms/BinarySearch";
import { jumpSearch } from "./algorithms/JumpSearch";
import { setPauseState, setStopState, resetSearchingState, resetBarColors } from "./algorithms/BaseSearch";
import "./searching.css";

// ... rest of the component code remains the same
const SearchingVisualizer = ({ goBack }) => {
  const { isDarkMode } = useTheme();
  const [array, setArray] = useState([]);
  const [size, setSize] = useState(20);
  const [speed, setSpeed] = useState(50);
  const [algorithm, setAlgorithm] = useState("linear");
  const [isSearching, setIsSearching] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [customInput, setCustomInput] = useState("");
  const [inputError, setInputError] = useState("");
  const [targetValue, setTargetValue] = useState("");
  const [foundIndex, setFoundIndex] = useState(-1);
  const [comparisonCount, setComparisonCount] = useState(0);
  const [searchStatus, setSearchStatus] = useState("");

  useEffect(() => {
    generateArray();
    return () => {
      resetSearchingState();
    };
  }, [size]);

  const generateArray = () => {
    const newArray = [];
    for (let i = 0; i < size; i++) {
      newArray.push(Math.floor(Math.random() * 100) + 1);
    }
    // Sort array for binary and jump search
    setArray([...newArray.sort((a, b) => a - b)]);
    resetSearchState();
    setInputError("");
  };

  const resetSearchState = () => {
    resetBarColors(size);
    setFoundIndex(-1);
    setComparisonCount(0);
    setSearchStatus("");
    setTargetValue("");
  };

  const handleCustomInput = () => {
    if (isSearching) {
      setInputError("Cannot change array while searching");
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
        .filter(num => !isNaN(num) && num >= 1 && num <= 1000);

      if (numbers.length === 0) {
        setInputError("Please enter valid numbers (1-1000)");
        return;
      }

      if (numbers.length > 50) {
        setInputError("Maximum 50 numbers allowed for better visualization");
        return;
      }

      // Sort for binary and jump search
      const sortedNumbers = [...numbers].sort((a, b) => a - b);
      setArray([...sortedNumbers]);
      setSize(numbers.length);
      resetSearchState();
      setInputError("");
    } catch (error) {
      setInputError("Invalid input format. Use: 10, 25, 50, 100");
    }
  };

  const generateRandomInput = () => {
    const randomNumbers = [];
    const count = Math.min(15, size);
    for (let i = 0; i < count; i++) {
      randomNumbers.push(Math.floor(Math.random() * 100) + 1);
    }
    setCustomInput(randomNumbers.join(", "));
  };

  const generateRandomTarget = () => {
    if (array.length > 0) {
      // 70% chance to pick existing element, 30% chance to pick random
      if (Math.random() < 0.7) {
        const randomIndex = Math.floor(Math.random() * array.length);
        setTargetValue(array[randomIndex].toString());
      } else {
        setTargetValue(Math.floor(Math.random() * 100) + 1);
      }
    }
  };

  const startSearching = async () => {
    if (isSearching || !targetValue) {
      if (!targetValue) {
        setInputError("Please enter a target value to search");
      }
      return;
    }

    const target = parseInt(targetValue);
    if (isNaN(target)) {
      setInputError("Please enter a valid number as target");
      return;
    }

    setIsSearching(true);
    setIsPaused(false);
    resetSearchingState();
    resetBarColors(size);
    setSearchStatus("");
    setComparisonCount(0);
    setFoundIndex(-1);

    try {
      let result;
      switch (algorithm) {
        case "linear":
          result = await linearSearch(array, target, speed, setComparisonCount, setFoundIndex);
          break;
        case "binary":
          result = await binarySearch(array, target, speed, setComparisonCount, setFoundIndex);
          break;
        case "jump":
          result = await jumpSearch(array, target, speed, setComparisonCount, setFoundIndex);
          break;
        default:
          result = await linearSearch(array, target, speed, setComparisonCount, setFoundIndex);
      }

      if (result.index !== -1) {
        setSearchStatus(`Found at index ${result.index}`);
      } else {
        setSearchStatus("Not found in array");
      }
    } catch (error) {
      if (error.message === "Searching stopped by user") {
        setSearchStatus("Search stopped");
      } else {
        console.error("Searching error:", error);
        setSearchStatus("Error occurred during search");
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

  const algorithmInfo = {
    linear: {
      name: "Linear Search",
      description: "Sequentially checks each element of the list until a match is found or the whole list has been searched. Simple but inefficient for large lists.",
      timeComplexity: {
        best: "O(1)",
        average: "O(n)",
        worst: "O(n)"
      },
      spaceComplexity: "O(1)",
      requirements: "Works on both sorted and unsorted arrays"
    },
    binary: {
      name: "Binary Search",
      description: "Efficient algorithm that finds the position of a target value within a sorted array by repeatedly dividing the search interval in half.",
      timeComplexity: {
        best: "O(1)",
        average: "O(log n)",
        worst: "O(log n)"
      },
      spaceComplexity: "O(1)",
      requirements: "Requires sorted array"
    },
    jump: {
      name: "Jump Search",
      description: "Algorithm for searching sorted arrays by jumping ahead by fixed steps and then performing linear search in the block where the target might be.",
      timeComplexity: {
        best: "O(1)",
        average: "O(√n)",
        worst: "O(√n)"
      },
      spaceComplexity: "O(1)",
      requirements: "Requires sorted array"
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

      {/* Custom Input Section */}
      <div className="input-section">
        <div className="input-group">
          <label>Array Input (Numbers will be sorted):</label>
          <div className="input-with-buttons">
            <input
              type="text"
              placeholder="Enter comma-separated numbers (e.g., 10, 25, 50, 75, 100)"
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              disabled={isSearching}
              className="custom-input"
            />
            <button
              className="generate-random-btn"
              onClick={generateRandomInput}
              disabled={isSearching}
            >
              Random
            </button>
            <button
              className="apply-btn"
              onClick={handleCustomInput}
              disabled={isSearching}
            >
              Apply
            </button>
          </div>
          {inputError && <div className="input-error">{inputError}</div>}
          <div className="input-hint">
            Enter numbers separated by commas (1-1000), max 50 numbers
          </div>
        </div>
      </div>

      <div className="controls-panel">
        <div className="control-group">
          <label>Search Algorithm</label>
          <select
            value={algorithm}
            onChange={(e) => setAlgorithm(e.target.value)}
            disabled={isSearching}
          >
            <option value="linear">Linear Search</option>
            <option value="binary">Binary Search</option>
            <option value="jump">Jump Search</option>
          </select>
        </div>

        <div className="control-group">
          <label>Array Size: {size}</label>
          <input
            type="range"
            min="5"
            max="50"
            value={size}
            onChange={(e) => setSize(parseInt(e.target.value))}
            disabled={isSearching}
          />
        </div>

        <div className="control-group">
          <label>Target Value:</label>
          <div className="target-input-group">
            <input
              type="number"
              placeholder="Enter target to search"
              value={targetValue}
              onChange={(e) => setTargetValue(e.target.value)}
              disabled={isSearching}
              min="1"
              max="1000"
            />
            <button
              className="generate-random-btn"
              onClick={generateRandomTarget}
              disabled={isSearching}
              style={{ padding: "12px 15px" }}
            >
              Random
            </button>
          </div>
        </div>

        <div className="control-group">
          <label>Speed: {speed}ms</label>
          <input
            type="range"
            min="1"
            max="100"
            value={speed}
            onChange={(e) => setSpeed(parseInt(e.target.value))}
            disabled={isSearching}
          />
        </div>

        <div className="control-buttons">
          <button
            className="generate-btn"
            onClick={generateArray}
            disabled={isSearching}
          >
            Random Array
          </button>
          <button
            className="search-btn"
            onClick={startSearching}
            disabled={isSearching || !targetValue}
          >
            {isSearching ? "Searching..." : "Start Search"}
          </button>
          <button
            className="pause-btn"
            onClick={togglePause}
            disabled={!isSearching}
          >
            {isPaused ? "▶ Resume" : "⏸ Pause"}
          </button>
          <button
            className="stop-btn"
            onClick={stopSearching}
            disabled={!isSearching}
          >
            ⏹ Stop
          </button>
        </div>
      </div>

      {/* Search Status */}
      {searchStatus && (
        <div className={`target-status ${foundIndex !== -1 ? 'target-found' : 'target-not-found'}`}>
          {searchStatus} | Comparisons: {comparisonCount}
        </div>
      )}

      {/* Comparison Count */}
      <div className="comparison-count">
        Comparisons: <span>{comparisonCount}</span>
      </div>

      {/* Visualization Area */}
      <div className="visualization-area">
        <div className="array-container">
          {array.map((value, idx) => (
            <div
              key={idx}
              id={`bar-${idx}`}
              className={`array-bar ${idx === foundIndex ? 'target-bar' : ''}`}
              style={{
                height: `${value * 3}px`,
                width: `${Math.max(10, 1000 / size)}px`,
                backgroundColor: idx === foundIndex 
                  ? "#2ecc71" 
                  : "#3498db"
              }}
            >
              <span className="bar-value">{value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="legend">
        <div className="legend-item">
          <div className="legend-color" style={{ backgroundColor: "#3498db" }}></div>
          <span>Array Elements</span>
        </div>
        <div className="legend-item">
          <div className="legend-color" style={{ backgroundColor: "#ff6b6b" }}></div>
          <span>Checking</span>
        </div>
        <div className="legend-item">
          <div className="legend-color" style={{ backgroundColor: "#4ecdc4" }}></div>
          <span>Current Position</span>
        </div>
        <div className="legend-item">
          <div className="legend-color" style={{ backgroundColor: "#feca57" }}></div>
          <span>Visited</span>
        </div>
        <div className="legend-item">
          <div className="legend-color" style={{ backgroundColor: "#ff9ff3" }}></div>
          <span>Search Range</span>
        </div>
        <div className="legend-item">
          <div className="legend-color" style={{ backgroundColor: "#2ecc71" }}></div>
          <span>Found</span>
        </div>
      </div>

      {/* Algorithm Info */}
      <div className="algorithm-info">
        <h3>About {algorithmInfo[algorithm].name}</h3>
        <p>{algorithmInfo[algorithm].description}</p>
        <p><strong>Requirements:</strong> {algorithmInfo[algorithm].requirements}</p>

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
        </div>
      </div>
    </div>
  );
};

export default SearchingVisualizer;