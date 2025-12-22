import React, { useState, useEffect } from "react";
import "../styles/visualizer.css";

const Visualizer = ({ feature, goBack }) => {
  const [array, setArray] = useState([]);
  const [animating, setAnimating] = useState(false);

  // Generate a random array
  const generateArray = () => {
    const newArr = Array.from({ length: 20 }, () =>
      Math.floor(Math.random() * 200) + 20
    );
    setArray(newArr);
  };

  useEffect(() => {
    generateArray();
  }, []);

  // Bubble Sort Animation
  const bubbleSort = async () => {
    setAnimating(true);
    const arr = [...array];

    for (let i = 0; i < arr.length - 1; i++) {
      for (let j = 0; j < arr.length - i - 1; j++) {
        if (arr[j] > arr[j + 1]) {
          // Swap
          [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
          setArray([...arr]);
          await new Promise((resolve) => setTimeout(resolve, 200));
        }
      }
    }

    setAnimating(false);
  };

  return (
    <div className="visualizer-container">
      <button className="back-btn" onClick={goBack}>
        ← Back
      </button>
      <h2>{feature}</h2>

      {/* Controls */}
      {feature === "Sorting Algorithms" && (
        <div className="controls">
          <button onClick={generateArray} disabled={animating}>
            Generate New Array
          </button>
          <button onClick={bubbleSort} disabled={animating}>
            Start Bubble Sort
          </button>
        </div>
      )}

      {/* Array Bars */}
      <div className="array-container">
        {array.map((value, idx) => (
          <div
            className="array-bar"
            key={idx}
            style={{ height: `${value}px` }}
          ></div>
        ))}
      </div>
    </div>
  );
};

export default Visualizer;
