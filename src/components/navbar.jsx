import React from "react";


import {
    FaCode ,
  FaSortAmountUp,
  FaSearch,
  FaProjectDiagram,
  FaTree,
  FaLayerGroup,
  FaStream,
  FaCogs

} from "react-icons/fa";

import "../styles/navbar.css";

const Navbar = () => {
  return (
    <header className="navbar">
      <div className="logo"><FaProjectDiagram className="icon" id="first" /> VISU-ALGO</div>

      <nav className="nav-actions">
        <button className="nav-btn">
          <FaSortAmountUp className="icon" />
          Sorting
        </button>

        <button className="nav-btn">
          <FaSearch className="icon" />
          Searching
        </button>

        <button className="nav-btn">
          <FaProjectDiagram className="icon" />
          Graphs
        </button>

        <button className="nav-btn">
          <FaTree className="icon" />
          Tree
        </button>

        <button className="nav-btn">
          <FaLayerGroup className="icon" />
          Stack
        </button>

        <button className="nav-btn">
          <FaStream className="icon" />
          Queue
        </button>

        <button className="nav-btn">
          <FaCogs className="icon" />
          Dynamic Programming
        </button>
      </nav>
    </header>
  );
};

export default Navbar;
