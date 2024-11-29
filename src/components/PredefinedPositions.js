// PredefinedPositions.js
import React, { useState } from "react";

const PredefinedPositions = () => {
  return {
    smartphone: [
      { name: "Model", x: 114, y: 180, fontSize: 42, color: "#000000" },
      { name: "Storage", x: 114, y: 253, fontSize: 35, color: "#000000" },
      { name: "Display", x: 274, y: 323, fontSize: 30, color: "#000000" },
      { name: "Grado", x: 274, y: 375, fontSize: 30, color: "#000000" },
      { name: "Price", x: 317, y: 19, fontSize: 90, color: "#000000" },
    ],
    rectangular: [
      { name: "Model", x: 165, y: 28, fontSize: 25, color: "#FFFFFF" },
      { name: "RAM", x: 266, y: 72, fontSize: 25, color: "#FFFFFF" },
      { name: "CPU", x: 266, y: 102, fontSize: 25, color: "#FFFFFF" },
      { name: "SSD", x: 266, y: 134, fontSize: 25, color: "#FFFFFF" },
      { name: "Graphics", x: 307, y: 163, fontSize: 25, color: "#FFFFFF" },
      { name: "Codice", x: 408, y: 222, fontSize: 16, color: "#FFFFFF" },
      { name: "Price", x: 518, y: 16, fontSize: 100, color: "#000000" },
    ],
    square: [
      { name: "Model", x: 200, y: 330, fontSize: 25, color: "#FFFFFF" },
      { name: "RAM", x: 110, y: 415, fontSize: 16, color: "#000000" },
      { name: "CPU", x: 110, y: 448, fontSize: 16, color: "#000000" },
      { name: "SSD", x: 110, y: 478, fontSize: 16, color: "#000000" },
      { name: "Graphics", x: 150, y: 512, fontSize: 16, color: "#000000" },
      { name: "Codice", x: 445, y: 490, fontSize: 12, color: "#000000" },
      { name: "Price", x: 357, y:-2, fontSize: 80, color: "#FFFFFF" },
    ],
  };
};

export default PredefinedPositions;