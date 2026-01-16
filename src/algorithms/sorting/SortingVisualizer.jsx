import React, { useState, useEffect } from "react";
import { useTheme } from "../../context/ThemeContext";
import { bubbleSort } from "./algorithms/BubbleSort";
import { selectionSort } from "./algorithms/SelectionSort";
import { insertionSort } from "./algorithms/InsertionSort";
import { mergeSort } from "./algorithms/MergeSort";
import { quickSort } from "./algorithms/QuickSort";
import "./sorting.css";

const SortingVisualizer = ({ goBack }) => {
  const { isDarkMode } = useTheme();
  const [array, setArray] = useState([]);
  const [size, setSize] = useState(30);
  const [speed, setSpeed] = useState(50);
  const [algorithm, setAlgorithm] = useState("bubble");
  const [isSorting, setIsSorting] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    generateArray();
  }, [size]);

  const generateArray = () => {
    const newArray = [];
    for (let i = 0; i < size; i++) {
      newArray.push(Math.floor(Math.random() * 500) + 10);
    }
    setArray([...newArray]);
    resetBarColors();
  };

  const resetBarColors = () => {
    for (let i = 0; i < size; i++) {
      const bar = document.getElementById(`bar-${i}`);
      if (bar) bar.style.backgroundColor = "#3498db";
    }
  };

  const startSorting = async () => {
    if (isSorting) return;
    
    setIsSorting(true);
    setIsPaused(false);
    resetBarColors();
    
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
    } catch (error) {
      console.error("Sorting error:", error);
    } finally {
      setIsSorting(false);
      setIsPaused(false);
    }
  };

  const pauseSorting = () => {
    setIsPaused(!isPaused);
  };

  const algorithmInfo = {
    bubble: {
      name: "Bubble Sort",
      description: "Repeatedly steps through the list, compares adjacent elements and swaps them if they are in the wrong order. The algorithm gets its name because smaller elements 'bubble' to the top of the list.",
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
      description: "Divides the input list into two parts: sorted and unsorted. Repeatedly selects the smallest element from unsorted part and moves it to the sorted part. Simple but inefficient on large lists.",
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
      description: "Builds the final sorted array one item at a time. Much like sorting playing cards in your hands. Efficient for small data sets or nearly sorted data.",
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
      description: "Divide and conquer algorithm that divides input array into two halves, recursively sorts them, and then merges the sorted halves. Guaranteed O(n log n) performance.",
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
      description: "Divide and conquer algorithm that picks a pivot element and partitions the array around the pivot. Very efficient for large data sets and widely used in practice.",
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

      <div className="controls-panel">
        <div className="control-group">
          <label>Algorithm</label>
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

        <div className="control-group">
          <label>Array Size: {size}</label>
          <input
            type="range"
            min="10"
            max="100"
            value={size}
            onChange={(e) => setSize(parseInt(e.target.value))}
            disabled={isSorting}
          />
        </div>

        <div className="control-group">
          <label>Speed: {speed}ms</label>
          <input
            type="range"
            min="1"
            max="100"
            value={speed}
            onChange={(e) => setSpeed(parseInt(e.target.value))}
            disabled={isSorting}
          />
        </div>

        <div className="control-buttons">
          <button 
            className="generate-btn" 
            onClick={generateArray}
            disabled={isSorting}
          >
            Generate New Array
          </button>
          <button 
            className="sort-btn" 
            onClick={startSorting}
            disabled={isSorting}
          >
            {isSorting ? "Sorting..." : "Start Sorting"}
          </button>
          <button 
            className="pause-btn"
            onClick={pauseSorting}
            disabled={!isSorting}
            style={{
              background: "linear-gradient(45deg, #4facfe, #00f2fe)",
              padding: "14px 28px",
              border: "none",
              borderRadius: "15px",
              color: "white",
              fontWeight: "bold",
              cursor: "pointer",
              minWidth: "150px"
            }}
          >
            {isPaused ? "Resume" : "Pause"}
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
                height: `${value}px`,
                width: `${Math.max(5, 800 / size)}px`,
                backgroundColor: "#3498db"
              }}
            >
              <span className="bar-value">{size <= 40 ? value : ""}</span>
            </div>
          ))}
        </div>
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
        <div className="legend-item">
          <div className="legend-color" style={{ backgroundColor: "#ff9ff3" }}></div>
          <span>Insert/Merge</span>
        </div>
      </div>

      <div className="algorithm-info">
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
  );
};

export default SortingVisualizer;