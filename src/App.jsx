import React, { useState } from "react";
import { ThemeProvider } from "./context/ThemeContext";
import Navbar from "./components/Navbar";
import Header from "./components/Header";
import MainSection from "./components/MainSection";
import Footer from "./components/Footer";
import SortingVisualizer from "./algorithms/sorting/SortingVisualizer";

function App() {
  const [selectedFeature, setSelectedFeature] = useState(null);

  return (
    <ThemeProvider>
      {selectedFeature === "sorting" ? (
        <SortingVisualizer goBack={() => setSelectedFeature(null)} />
      ) : (
        <>
          <Navbar />
          <Header setSelectedFeature={setSelectedFeature} />
          <MainSection setSelectedFeature={setSelectedFeature} />
          <Footer />
        </>
      )}
    </ThemeProvider>
  );
}

export default App;
