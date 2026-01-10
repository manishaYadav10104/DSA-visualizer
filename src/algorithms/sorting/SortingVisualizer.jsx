import React, { useEffect, useState, useRef } from "react";
import "./sorting.css";

import ALGORITHMS from "./Algorithms/ALGORITHMS";

export default function SortingVisualizer({ goBack }) {
  const [array, setArray] = useState([]);
  const [size, setSize] = useState(20);
  const [speed, setSpeed] = useState(60);
  const [active, setActive] = useState([]);
  const [sorted, setSorted] = useState([]);
  const [algo, setAlgo] = useState("Bubble Sort");

  const isSorting = useRef(false);
  const isPaused = useRef(false);

  useEffect(() => {
    generateArray();
  }, [size]);

  /* ---------- Helpers ---------- */

  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  const waitWhilePaused = async () => {
    while (isPaused.current) {
      await sleep(50);
    }
  };

  /* ---------- Array ---------- */

  const generateArray = () => {
    if (isSorting.current) return;

    const arr = Array.from({ length: size }, () =>
      Math.floor(Math.random() * 280) + 20
    );

    setArray(arr);
    setActive([]);
    setSorted([]);
  };

  /* ---------- Sorting ---------- */

  const startSorting = async () => {
    if (isSorting.current) return;

    isSorting.current = true;
    isPaused.current = false;

    let arr = [...array];
    const animations = ALGORITHMS[algo].algo.getAnimations(arr);

    for (let step of animations) {
      await waitWhilePaused();

      if (step.type === "compare") {
        setActive(step.indices);
      }

      if (step.type === "swap") {
        const [i, j] = step.indices;
        [arr[i], arr[j]] = [arr[j], arr[i]];
        setArray([...arr]);
        setActive([i, j]);
      }

      await sleep(speed);
    }

    setSorted(arr.map((_, i) => i));
    setActive([]);
    isSorting.current = false;
  };

  const togglePause = () => {
    if (!isSorting.current) return;
    isPaused.current = !isPaused.current;
  };
  // const [stepMessage, setStepMessage] = useState("Click Sort to start");


  /* ---------- UI ---------- */

  return (
    <div className="sorting-page">
      {/* Toolbar */}
      <div className="sorting-toolbar">
        <button onClick={goBack}>← Back</button>

        <select value={algo} onChange={(e) => setAlgo(e.target.value)}>
          {Object.keys(ALGORITHMS).map((a) => (
            <option key={a}>{a}</option>
          ))}
        </select>

        <button onClick={generateArray}>Generate</button>
        <button onClick={startSorting}>Sort</button>
        <button onClick={togglePause}>
          {isPaused.current ? "Resume" : "Pause"}
        </button>

        <div className="range">
          Speed
          <input
            type="range"
            min="10"
            max="200"
            value={speed}
            onChange={(e) => setSpeed(+e.target.value)}
          />
        </div>

        <div className="range">
          Size
          <input
            type="range"
            min="10"
            max="40"
            value={size}
            onChange={(e) => setSize(+e.target.value)}
          />
        </div>
      </div>

      {/* Visualizer */}
      <div className="visualizer-box">
        {array.map((val, i) => (
          <div
            key={i}
            className={`bar 
              ${active.includes(i) ? "active" : ""}
              ${sorted.includes(i) ? "sorted" : ""}`}
            style={{ height: `${val}px` }}
          />
        ))}
      </div>
    </div>
  );
}
