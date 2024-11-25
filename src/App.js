import React, { useState, useRef } from "react";
import axios from "axios";
import PredefinedPositions from "./components/PredefinedPositions"; // Predefined field positions
import OverlayFields from "./components/OverlayFields"; // Overlay for dragging fields
import { toPng } from "html-to-image"; // For saving templates as images
import jsPDF from "jspdf"; // For generating PDF


function App() {
  const predefinedPositions = PredefinedPositions();
  const [category, setCategory] = useState("");
  const [subCategory, setSubCategory] = useState("");
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [fields, setFields] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [hoveredData, setHoveredData] = useState(null);
  const [refreshOverlayKey, setRefreshOverlayKey] = useState(0);
  const [pdfPreview, setPdfPreview] = useState(null); // For PDF preview
  const templateRef = useRef(null);

  // Fetch templates from backend
  const fetchTemplates = async (type) => {
    try {
      const response = await axios.get(`http://localhost:8000/templates/${type}`);
      setTemplates(response.data);
    } catch (error) {
      console.error("Error fetching templates:", error);
    }
  };

  // Save data to the database
  const saveDataToDatabase = async () => {
    if (!selectedTemplate) {
      alert("Please select a template first!");
      return;
    }

    const dataToSave = {
      shape_type: category === "smartphone" ? "smartphone" : subCategory,
      template_name: selectedTemplate.name,
    };

    fields.forEach((field) => {
      dataToSave[field.name.toLowerCase()] = field.value || "";
    });

    try {
      const response = await axios.post("http://localhost:8000/save-inputs", dataToSave);
      alert(response.data.message);
    } catch (error) {
      console.error("Error saving data:", error);
      alert("Failed to save data!");
    }
  };

  // Fetch suggestions for model input
  const fetchSuggestions = async (query) => {
    try {
      const response = await axios.get("http://localhost:8000/fetch-inputs", {
        params: {
          query,
          shape_type: category === "smartphone" ? "smartphone" : subCategory,
        },
      });

      if (response.data.length === 0) {
        setSuggestions([]);
        return;
      }

      setSuggestions(response.data);
    } catch (error) {
      console.error("Error fetching suggestions:", error);
    }
  };

  // Preview autofill fields based on hovered suggestion
  const previewAutofill = (data) => {
    const previewFields = fields.map((field) => ({
      ...field,
      value: data[field.name.toLowerCase()] || field.value,
    }));
    setHoveredData(previewFields);
  };

  // Commit autofill when a suggestion is clicked
  const commitAutofill = (data) => {
    const updatedFields = fields.map((field) => ({
      ...field,
      value: data[field.name.toLowerCase()] || field.value,
    }));
    setFields(updatedFields);
    setSuggestions([]);
    setHoveredData(null);
  };

  // Reset hovered data when leaving the dropdown
  const resetHoveredData = () => {
    if (hoveredData) {
      setFields(hoveredData);
    }
    setHoveredData(null);
  };

  // Reset all input fields to empty
  const resetFields = () => {
    const clearedFields = fields.map((field) => ({
      ...field,
      value: "",
    }));
    setFields(clearedFields);
    setSuggestions([]);
    setHoveredData(null);
  };

  // Update font size, type, or color
  const updateStyle = (index, key, value) => {
    const updatedFields = [...fields];
    updatedFields[index][key] = value;
    setFields(updatedFields);
  };

  // Generate merged image
  const generateMergedImage = async () => {
    if (!templateRef.current) {
      alert("No template selected!");
      return null;
    }
  
    try {
      const dataUrl = await toPng(templateRef.current, { cacheBust: true });
      console.log("Generated PNG Data URL:", dataUrl); // Debugging
      return dataUrl;
    } catch (error) {
      console.error("Error generating merged image:", error);
      alert("Failed to generate image!");
      return null;
    }
  };
  
  const previewPdf = async () => {
    const mergedImage = await generateMergedImage();
    if (!mergedImage) return;
  
    const pdf = new jsPDF("portrait", "px", "a4");
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 10; // Margin between images
  
    const addImageSafely = (imageUrl, x, y, width, height) => {
      const img = new Image();
      img.src = imageUrl;
  
      img.onload = () => {
        pdf.addImage(img, "PNG", x, y, width, height);
      };
  
      img.onerror = (error) => {
        console.error("Error loading image for PDF:", error);
      };
    };
  
    if (category === "smartphone" || subCategory === "square") {
      // Smartphone and Square Templates (2x2 grid, forcefully stretching width)
      const forcedWidth = (pageWidth - 3 * margin) / 2; // Full width for each cell
      const forcedHeight = forcedWidth * 0.6; // Force a slightly smaller height to make the shape rectangular
  
      console.log("Forced Dimensions (Square/Smartphone):", forcedWidth, forcedHeight);
  
      let currentX = margin;
      let currentY = margin;
  
      for (let i = 0; i < 4; i++) {
        addImageSafely(mergedImage, currentX, currentY, forcedWidth, forcedHeight);
        currentX += forcedWidth + margin;
  
        if ((i + 1) % 2 === 0) {
          currentX = margin;
          currentY += forcedHeight + margin;
        }
      }
    }
  
    if (subCategory === "rectangular") {
      // Rectangular Templates (4x1 grid, maintaining aspect ratio 1500x500)
      const imgWidth = pageWidth - 2 * margin; // Full page width minus margins
      const imgHeight = (imgWidth * 500) / 1500; // Maintain aspect ratio of 1500x500
  
      let currentY = margin;
  
      for (let i = 0; i < 4; i++) {
        addImageSafely(mergedImage, margin, currentY, imgWidth, imgHeight);
        currentY += imgHeight + margin;
  
        if (currentY + imgHeight + margin > pageHeight && i < 3) {
          pdf.addPage(); // Add a new page for the next row
          currentY = margin;
        }
      }
    }
  
    setTimeout(() => {
      const pdfUrl = pdf.output("dataurlstring");
      setPdfPreview(pdfUrl);
    }, 1000); // Delay to allow image loading
  };
  

  
  
  
  return (
    <div className="min-h-screen bg-gray-100 p-6 overflow-x-hidden">
      <h1 className="text-2xl font-bold mb-6 text-center">BNO TEMPLATE GENERATOR</h1>

      {/* Category Selection */}
      <div className="max-w-3xl mx-auto">
        <select
          onChange={(e) => {
            const selectedCategory = e.target.value;
            setCategory(selectedCategory);
            setSubCategory("");
            setTemplates([]);
            setSelectedTemplate(null);
            setFields([]);
            if (selectedCategory === "smartphone") {
              fetchTemplates("smartphone");
            }
          }}
          className="block w-full mb-4 p-3 border rounded-md"
        >
          <option value="">Select a Category</option>
          <option value="smartphone">Smartphone</option>
          <option value="computer">Computer</option>
        </select>

        {category === "computer" && (
          <select
            onChange={(e) => {
              const selectedSubCategory = e.target.value;
              setSubCategory(selectedSubCategory);
              fetchTemplates(selectedSubCategory);
            }}
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
            onClick={() => {
              setSelectedTemplate(template);
              const defaultFields =
                category === "smartphone"
                  ? predefinedPositions.smartphone
                  : subCategory === "rectangular"
                  ? predefinedPositions.rectangular
                  : predefinedPositions.square;

              setFields(defaultFields.map((field) => ({ ...field, value: "" })));
            }}
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

      {/* Selected Template */}
      {selectedTemplate && (
        <div className="relative mt-6 bg-white p-4 rounded shadow max-w-5xl mx-auto">
          <h2 className="text-xl font-bold mb-4 text-center">{selectedTemplate.name}</h2>
          <div ref={templateRef} className="relative flex justify-center overflow-hidden">
            <img
              src={`http://localhost:8000/fetch-image/?url=${encodeURIComponent(selectedTemplate.url)}`}
              alt={selectedTemplate.name}
              className="max-h-96 w-auto object-contain rounded"
              onError={(e) => (e.target.src = "https://via.placeholder.com/150")}
            />

            <OverlayFields
              key={refreshOverlayKey}
              fields={hoveredData || fields}
              updateFieldPosition={(index, x, y) => {
                const updatedFields = [...fields];
                updatedFields[index] = { ...updatedFields[index], x, y };
                setFields(updatedFields);
              }}
            />
          </div>

          {/* Input Fields */}
          <div className="mt-6">
            {fields.map((field, index) => (
              <div key={index} className="mb-4 relative">
                <label className="block font-semibold mb-1">{field.name}</label>
                <input
                  type="text"
                  value={
                    hoveredData && hoveredData[index]
                      ? hoveredData[index].value
                      : field.value
                  }
                  onChange={(e) => {
                    const updatedFields = [...fields];
                    updatedFields[index].value = e.target.value;
                    setFields(updatedFields);

                    if (field.name.toLowerCase() === "model") {
                      fetchSuggestions(e.target.value);
                    }
                  }}
                  className="block w-full p-2 border rounded mb-2"
                />

                {/* Font Customization */}
                <div className="flex gap-4 mt-2">
                  <label>Font Size:</label>
                  <input
                    type="number"
                    value={field.fontSize || 16}
                    onChange={(e) => updateStyle(index, "fontSize", parseInt(e.target.value, 10))}
                    className="w-24 p-1 border rounded"
                  />
                  <label>Font Type:</label>
                  <select
                    value={field.fontFamily || "Arial"}
                    onChange={(e) => updateStyle(index, "fontFamily", e.target.value)}
                    className="w-32 p-1 border rounded"
                  >
                    <option value="Arial">Arial</option>
                    <option value="Verdana">Verdana</option>
                    <option value="Times New Roman">Times New Roman</option>
                    <option value="Courier New">Courier New</option>
                  </select>
                  <label>Font Color:</label>
                  <input
                    type="color"
                    value={field.color || "#000000"}
                    onChange={(e) => updateStyle(index, "color", e.target.value)}
                    className="w-10 h-10 p-1 border rounded"
                  />
                </div>

                {/* Suggestions */}
                {field.name.toLowerCase() === "model" && suggestions.length > 0 && (
                  <div
                    className="absolute z-10 bg-white border rounded shadow-lg w-full max-h-40 overflow-y-auto"
                    onMouseLeave={resetHoveredData}
                  >
                    {suggestions.map((suggestion, i) => (
                      <div
                        key={i}
                        className="p-2 hover:bg-gray-200 cursor-pointer"
                        onMouseEnter={() => previewAutofill(suggestion)}
                        onClick={() => commitAutofill(suggestion)}
                      >
                        {suggestion.model}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Buttons */}
          <button
            onClick={resetFields}
            className="mt-4 bg-red-500 text-white px-4 py-2 rounded shadow"
          >
            Reset Fields
          </button>
          <button
            onClick={saveDataToDatabase}
            className="mt-4 bg-blue-500 text-white px-4 py-2 rounded shadow ml-4"
          >
            Save to Database
          </button>
          <button
            onClick={previewPdf}
            className="mt-4 bg-green-500 text-white px-4 py-2 rounded shadow ml-4"
          >
            Preview PDF
          </button>
        </div>
      )}

      {/* PDF Preview */}
      {pdfPreview && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded shadow-lg max-w-3xl w-full">
            <iframe
              src={pdfPreview}
              className="w-full h-96"
              title="PDF Preview"
            ></iframe>
            <button
              onClick={() => setPdfPreview(null)}
              className="mt-4 bg-red-500 text-white px-4 py-2 rounded shadow"
            >
              Close Preview
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
