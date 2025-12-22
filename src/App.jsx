import React, { useState } from "react";
import Navbar from "./components/navbar";
import MainSection from "./components/MainSection";
import Visualizer from "./components/Visualizer";

function App() {
  const [selectedFeature, setSelectedFeature] = useState(null);

  return (
    <>
      <Navbar />
      {!selectedFeature ? (
        <MainSection setSelectedFeature={setSelectedFeature} />
      ) : (
        <Visualizer
          feature={selectedFeature}
          goBack={() => setSelectedFeature(null)}
        />
      )}
    </>
  );
}

export default App;
