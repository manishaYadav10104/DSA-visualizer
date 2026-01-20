import React, { useState } from "react";
import { ThemeProvider } from "./context/ThemeContext";
import Navbar from "./components/Navbar";
import Header from "./components/Header";
import MainSection from "./components/MainSection";
import Footer from "./components/Footer";
import SortingVisualizer from "./algorithms/sorting/SortingVisualizer";
import SearchingVisualizer from "./algorithms/searching/SearchingVisualizer";
import GraphVisualizer from "./algorithms/graphs/GraphVisualizer";
import "./styles/index.css";

function App() {
  const [selectedFeature, setSelectedFeature] = useState(null);

  const handleGoBack = () => {
    setSelectedFeature(null);
  };

  return (
    <ThemeProvider>
      <Navbar 
        setSelectedFeature={setSelectedFeature} 
        selectedFeature={selectedFeature}
      />

      {selectedFeature === "sorting" ? (
        <SortingVisualizer goBack={handleGoBack} />
      ) : selectedFeature === "searching" ? (
        <SearchingVisualizer goBack={handleGoBack} />
      ) : selectedFeature === "graphs" ? (
        <GraphVisualizer goBack={handleGoBack} />
      ) : (
        <>
          <Header setSelectedFeature={setSelectedFeature} />
          <MainSection setSelectedFeature={setSelectedFeature} />
          <Footer setSelectedFeature={setSelectedFeature} />
        </>
      )}
    </ThemeProvider>
  );
}

export default App;