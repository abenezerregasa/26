import React, { useState, useEffect } from "react";

// Declare the available fonts inside the FontSelector component.
const availableFonts = [
  "Bodoni Moda", "Didot", "Garamond", "Georgia", "Impact", "Verdana", "Futura",
  "Helvetica", "Gill Sans", "Avenir", "Baskerville", "Times New Roman", "Courier Bold",
  "Rockwell", "Century Gothic", "Copperplate", "Trajan Pro", "Roboto Bold",
  "Open Sans Bold", "Lato Bold", "Montserrat Bold", "Playfair Display Bold",
  "Poppins Bold", "Raleway Bold", "Oswald Bold", "Nunito Bold", "PT Serif",
  "Merriweather Bold", "Libre Baskerville Bold", "Anton", "Bebas Neue",
  "Abril Fatface", "Allerta Stencil", "Archivo Black", "Oswald", "Zilla Slab Highlight",
  "Roboto Slab"
];

const FontSelector = ({ 
  selectedFont,
  onFontChange,
  onFontSizeChange,
  onFontColorChange,
  onBoldChange,
  onItalicChange,
}) => {
  const [currentSize, setCurrentSize] = useState(selectedFont.size || 16);

  useEffect(() => {
    setCurrentSize(selectedFont.size || 16);
  }, [selectedFont.size]);

  useEffect(() => {
    // Load fonts dynamically from Google Fonts
    const styleElement = document.createElement("link");
    styleElement.rel = "stylesheet";
    styleElement.href =
      "https://fonts.googleapis.com/css2?family=" +
      availableFonts.map((font) => font.replace(/\s+/g, "+") + "&display=swap").join("");
    document.head.appendChild(styleElement);
  }, []);

  const handleFontSizeInput = (e) => {
    const newSize = parseInt(e.target.value, 10) || 0;
    if (newSize > 0) {
      setCurrentSize(newSize);
      onFontSizeChange(newSize);
    }
  };

  const handleIncrementSize = (increment) => {
    const newSize = currentSize + increment;
    if (newSize > 0) {
      setCurrentSize(newSize);
      onFontSizeChange(newSize);
    }
  };

  return (
    <div className="flex flex-row items-center gap-4">
      {/* Font Type Selector */}
      <select
        value={selectedFont.type}
        onChange={(e) => onFontChange(e.target.value)}
        className="px-3 py-2 border border-gray-300 rounded-lg"
      >
        <option value="">Select Font</option>
        {availableFonts.map((font) => (
          <option key={font} value={font}>
            {font}
          </option>
        ))}
      </select>

      {/* Font Size Controls */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => handleIncrementSize(-1)}
          className="px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
        >
          -
        </button>
        <input
          type="number"
          value={currentSize}
          onChange={handleFontSizeInput}
          className="w-16 text-center px-3 py-2 border border-gray-300 rounded-lg"
        />
        <button
          onClick={() => handleIncrementSize(1)}
          className="px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
        >
          +
        </button>
      </div>

      {/* Font Color Picker */}
      <input
        type="color"
        value={selectedFont.color}
        onChange={(e) => onFontColorChange(e.target.value)}
        className="w-16 h-10 p-0 border border-gray-300 rounded-lg"
      />

      {/* Bold Toggle */}
      <button
        onClick={() => onBoldChange(!selectedFont.bold)}
        className={`px-3 py-1 border border-gray-300 rounded-lg ${
          selectedFont.bold ? "bg-gray-800 text-white" : "bg-gray-200 text-gray-700"
        }`}
      >
        B
      </button>

      {/* Italic Toggle */}
      <button
        onClick={() => onItalicChange(!selectedFont.italic)}
        className={`px-3 py-1 border border-gray-300 rounded-lg ${
          selectedFont.italic ? "bg-gray-800 text-white italic" : "bg-gray-200 text-gray-700"
        }`}
      >
        I
      </button>
    </div>
  );
};

export default FontSelector;
