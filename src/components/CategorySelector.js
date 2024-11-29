// src/components/CategorySelector.js
import React, { useState } from "react";

const CategorySelector = ({ onCategorySelect }) => {
  const [mainCategory, setMainCategory] = useState(null);
  const [subCategory, setSubCategory] = useState(null);

  const handleMainCategoryChange = (category) => {
    setMainCategory(category);
    setSubCategory(null);
    onCategorySelect(category, null);
  };

  const handleSubCategoryChange = (category) => {
    setSubCategory(category);
    onCategorySelect("computer", category);
  };

  return (
    <div className="p-6 bg-gradient-to-r from-blue-100 via-purple-100 to-pink-100 rounded-lg shadow-xl max-w-md mx-auto mt-10">
      <h2 className="text-3xl font-extrabold mb-6 text-center text-gray-800">Select a Category</h2>
      <div className="flex justify-center gap-6 mb-8">
        <button
          onClick={() => handleMainCategoryChange("smartphone")}
          className={`px-6 py-3 rounded-lg font-semibold transition-all ${
            mainCategory === "smartphone"
              ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg"
              : "bg-white text-blue-700 border border-blue-700 hover:bg-blue-100"
          }`}
        >
          Smartphone
        </button>
        <button
          onClick={() => handleMainCategoryChange("computer")}
          className={`px-6 py-3 rounded-lg font-semibold transition-all ${
            mainCategory === "computer"
              ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg"
              : "bg-white text-blue-700 border border-blue-700 hover:bg-blue-100"
          }`}
        >
          Computer
        </button>
      </div>
      {mainCategory === "computer" && (
        <div className="text-center">
          <h3 className="text-2xl font-bold mb-6 text-gray-800">Select Computer Type</h3>
          <div className="flex justify-center gap-6">
            <button
              onClick={() => handleSubCategoryChange("square")}
              className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                subCategory === "square"
                  ? "bg-gradient-to-r from-green-500 to-teal-500 text-white shadow-lg"
                  : "bg-white text-green-700 border border-green-700 hover:bg-green-100"
              }`}
            >
              Square
            </button>
            <button
              onClick={() => handleSubCategoryChange("rectangular")}
              className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                subCategory === "rectangular"
                  ? "bg-gradient-to-r from-green-500 to-teal-500 text-white shadow-lg"
                  : "bg-white text-green-700 border border-green-700 hover:bg-green-100"
              }`}
            >
              Rectangular
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategorySelector;