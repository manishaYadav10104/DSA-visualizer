import React, { useState } from "react";
import Navbar from "./components/Navbar";
import MainSection from "./components/MainSection";
import SortingVisualizer from "./algorithms/sorting/SortingVisualizer";

function App() {
  const [selectedFeature, setSelectedFeature] = useState(null);

  return (
    <>
      {/* Show Navbar ONLY on home page */}
      {!selectedFeature && <Navbar />}

      {!selectedFeature ? (
        <MainSection setSelectedFeature={setSelectedFeature} />
      ) : selectedFeature === "Sorting Algorithms" ? (
        <SortingVisualizer goBack={() => setSelectedFeature(null)} />
      ) : (
        <div style={{ padding: "40px", color: "white" }}>
          <button onClick={() => setSelectedFeature(null)}>← Back</button>
          <h2>{selectedFeature}</h2>
          <p>Page coming soon...</p>
        </div>
      )}
    </>
  );
}

export default App;
