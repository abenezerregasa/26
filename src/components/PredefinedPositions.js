// PredefinedPositions.js
import React, { useState } from "react";

const PredefinedPositions = () => {
  // State for predefined positions
  const [predefinedPositions] = useState({
    smartphone: [
      { name: "Model", x: -92, y: 127, fontSize: 42, color: "#000000" },
      { name: "Storage", x: -131, y: 176, fontSize: 35, color: "#000000" },
      { name: "Display", x: -26, y: 230, fontSize: 30, color: "#000000" },
      { name: "Grado", x: -7, y: 268, fontSize: 30, color: "#000000" },
      { name: "Price", x: 62, y: 3, fontSize: 80, color: "#000000" },
    ],
    rectangular: [
      { name: "Model", x: -179, y: 62, fontSize: 25, color: "#FFFFFF" },
      { name: "RAM", x: -124, y: 100, fontSize: 25, color: "#FFFFFF" },
      { name: "CPU", x: -107, y: 140, fontSize: 25, color: "#FFFFFF" },
      { name: "SSD", x: -111, y: 183, fontSize: 25, color: "#FFFFFF" },
      { name: "Graphics", x: 9, y: 221, fontSize: 25, color: "#FFFFFF" },
      { name: "Codice", x: 70, y: 300, fontSize: 16, color: "#FFFFFF" },
      { name: "Price", x: 314, y: 41, fontSize: 110, color: "#000000" },
    ],
    square: [
      { name: "Model", x: -1, y: 230, fontSize: 24, color: "#FFFFFF" },
      { name: "RAM", x: -98, y: 293, fontSize: 16, color: "#000000" },
      { name: "CPU", x: -98, y: 315, fontSize: 16, color: "#000000" },
      { name: "SSD", x: -98, y: 337, fontSize: 16, color: "#000000" },
      { name: "Graphics", x: -29, y: 359, fontSize: 16, color: "#000000" },
      { name: "Codice", x: 135, y: 345, fontSize: 12, color: "#000000" },
      { name: "Price", x: 123, y: -4, fontSize: 60, color: "#FFFFFF" },
    ],
  });

  return predefinedPositions;
};

export default PredefinedPositions;
