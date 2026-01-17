import React, { useState } from "react";
import { ThemeProvider } from "./context/ThemeContext";
import Navbar from "./components/Navbar";
import Header from "./components/Header";
import MainSection from "./components/MainSection";
import Footer from "./components/Footer";
import SortingVisualizer from "./algorithms/sorting/SortingVisualizer";
import SearchingVisualizer from "./algorithms/searching/SearchingVisualizer";
import "./styles/index.css";

function App() {
  const [selectedFeature, setSelectedFeature] = useState(null);

  return (
    <ThemeProvider>
      <Navbar setSelectedFeature={setSelectedFeature} />

      {selectedFeature === "sorting" ? (
        <SortingVisualizer goBack={() => setSelectedFeature(null)} />
      ) : selectedFeature === "searching" ? (
        <SearchingVisualizer goBack={() => setSelectedFeature(null)} />
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