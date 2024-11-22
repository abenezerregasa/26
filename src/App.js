import React, { useState } from "react";
import axios from "axios";
import PredefinedPositions from "./components/PredefinedPositions"; // Import the predefined positions
import OverlayFields from "./components/OverlayFields"; // Import the OverlayFields component

function App() {
  const predefinedPositions = PredefinedPositions(); // Get the predefined positions
  const [category, setCategory] = useState(""); // Smartphone or Computer
  const [subCategory, setSubCategory] = useState(""); // Rectangular or Square for Computers
  const [templates, setTemplates] = useState([]); // Templates fetched from backend
  const [selectedTemplate, setSelectedTemplate] = useState(null); // Selected template
  const [fields, setFields] = useState([]); // Dynamic input fields based on type
  const [refreshOverlayKey, setRefreshOverlayKey] = useState(0); // Used to force refresh the overlays

  // Fetch templates from backend
  const fetchTemplates = async (type) => {
    try {
      const response = await axios.get(`http://localhost:8000/templates/${type}`);
      setTemplates(response.data);
    } catch (error) {
      console.error("Error fetching templates:", error);
    }
  };

  // Handle category selection
  const handleCategoryChange = (event) => {
    const selectedCategory = event.target.value;
    setCategory(selectedCategory);
    setSubCategory(""); // Reset subcategory when changing category
    setTemplates([]); // Clear templates
    setSelectedTemplate(null); // Clear selected template
    setFields([]); // Clear fields
    if (selectedCategory === "smartphone") {
      fetchTemplates("smartphone");
    }
  };

  // Handle subcategory selection (Rectangular or Square for Computers)
  const handleSubCategoryChange = (event) => {
    const selectedSubCategory = event.target.value;
    setSubCategory(selectedSubCategory);
    fetchTemplates(selectedSubCategory);
  };

  // Handle template selection
  const handleTemplateSelect = (template) => {
    setSelectedTemplate(template);

    // Set default fields with predefined positions
    const defaultFields =
      category === "smartphone"
        ? predefinedPositions.smartphone
        : subCategory === "rectangular"
        ? predefinedPositions.rectangular
        : predefinedPositions.square;

    setFields(defaultFields.map((field) => ({ ...field, value: "" })));
  };

  // Update field position (when dragging text)
  const updateFieldPosition = (index, x, y) => {
    const updatedFields = [...fields];
    updatedFields[index] = { ...updatedFields[index], x, y };
    setFields(updatedFields);
  };

  // Handle input value changes
  const handleInputChange = (index, value) => {
    const updatedFields = [...fields];
    updatedFields[index].value = value;
    setFields(updatedFields);
  };

  // Handle font size and color changes
  const handleStyleChange = (index, key, value) => {
    const updatedFields = [...fields];
    updatedFields[index][key] = value;
    setFields(updatedFields);
  };

  // Refresh overlays
  const refreshOverlayHandler = () => {
    setRefreshOverlayKey((prevKey) => prevKey + 1); // Update key to force refresh
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6 overflow-x-hidden">
      <h1 className="text-2xl font-bold mb-6 text-center">Template Editor</h1>

      {/* Category Selection */}
      <div className="max-w-3xl mx-auto">
        <select
          onChange={handleCategoryChange}
          className="block w-full mb-4 p-3 border rounded-md"
        >
          <option value="">Select a Category</option>
          <option value="smartphone">Smartphone</option>
          <option value="computer">Computer</option>
        </select>

        {/* Subcategory Selection */}
        {category === "computer" && (
          <select
            onChange={handleSubCategoryChange}
            className="block w-full mb-4 p-3 border rounded-md"
          >
            <option value="">Select Subcategory</option>
            <option value="rectangular">Rectangular</option>
            <option value="square">Square</option>
          </select>
        )}
      </div>

      {/* Template List */}
      <div className="grid grid-cols-3 gap-4 max-w-5xl mx-auto">
        {templates.map((template) => (
          <div
            key={template.id}
            className="p-4 bg-white shadow rounded-md cursor-pointer"
            onClick={() => handleTemplateSelect(template)}
          >
            <h2 className="text-center">{template.name}</h2>
            <img
              src={`http://localhost:8000/fetch-image/?url=${encodeURIComponent(template.url)}`}
              alt={template.name}
              className="w-full h-60 object-contain mx-auto"
              onError={(e) => (e.target.src = "https://via.placeholder.com/150")}
            />
          </div>
        ))}
      </div>

      {/* Selected Template with Dynamic Text Fields */}
      {selectedTemplate && (
        <div className="relative mt-6 bg-white p-4 rounded shadow max-w-5xl mx-auto">
          <h2 className="text-xl font-bold mb-4 text-center">{selectedTemplate.name}</h2>
          <div className="relative flex justify-center overflow-hidden">
            <img
              src={`http://localhost:8000/fetch-image/?url=${encodeURIComponent(selectedTemplate.url)}`}
              alt={selectedTemplate.name}
              className="max-h-96 w-auto object-contain rounded"
              onError={(e) => (e.target.src = "https://via.placeholder.com/150")}
            />

            {/* Overlay Fields Component */}
            <OverlayFields
              key={refreshOverlayKey}
              fields={fields}
              updateFieldPosition={updateFieldPosition}
            />
          </div>

          <button
            onClick={refreshOverlayHandler}
            className="mt-4 bg-blue-500 text-white px-4 py-2 rounded shadow"
          >
            Refresh Overlays
          </button>

          {/* Input Fields */}
          <div className="mt-6">
            {fields.map((field, index) => (
              <div key={index} className="mb-4">
                <label className="block font-semibold mb-1">{field.name}</label>
                <input
                  type="text"
                  value={field.value}
                  onChange={(e) => handleInputChange(index, e.target.value)}
                  className="block w-full p-2 border rounded mb-2"
                />
                <div className="flex gap-4 mt-2">
                  <label>Font Size:</label>
                  <input
                    type="number"
                    value={field.fontSize}
                    onChange={(e) => handleStyleChange(index, "fontSize", parseInt(e.target.value, 10))}
                    className="w-24 p-2 border rounded"
                  />
                  <label>Font Color:</label>
                  <input
                    type="color"
                    value={field.color}
                    onChange={(e) => handleStyleChange(index, "color", e.target.value)}
                    className="w-24 h-8 p-2 border rounded"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
