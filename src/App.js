import React, { useState, useRef } from "react";
import axios from "axios";
import PredefinedPositions from "./components/PredefinedPositions"; // Predefined field positions
import OverlayFields from "./components/OverlayFields"; // Overlay for dragging fields
import { toPng } from "html-to-image"; // For saving templates as images
import { PDFDocument, rgb } from "pdf-lib";
 
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
  const [templateClicks, setTemplateClicks] = useState({});

  

  // Fetch templates from backend
  const fetchTemplates = async (type) => {
    try {
      const response = await axios.get(`http://localhost:8000/templates/${type}`);
      const validTemplates = response.data.filter((template) => template.url); // Ensure `url` exists
      setTemplates(validTemplates);
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
// adding the logic to remove template
  const removeTemplate = (templateId, instanceNumber) => {
    setTemplateClicks((prev) => {
      const updated = { ...prev };
      if (updated[templateId] > 1) {
        updated[templateId] -= 1;
      } else {
        delete updated[templateId];
      }
      return updated;
    });
  
    setFields((prev) =>
      prev.filter(
        (field) => !field.id.startsWith(`${templateId}-${instanceNumber}`)
      )
    );
  };
  

 
  
  const mergeImageWithOverlay = async (template) => {
    return new Promise(async (resolve, reject) => {
      try {
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");
  
        const image = new Image();
        image.crossOrigin = "Anonymous";
        image.src = `http://localhost:8000/fetch-image/?url=${encodeURIComponent(template.url)}`;
  
        image.onload = () => {
          // Match canvas size to the image dimensions
          canvas.width = image.width;
          canvas.height = image.height;
  
          // Draw the image onto the canvas
          context.drawImage(image, 0, 0, canvas.width, canvas.height);
  
          // Get scaling factors for consistency
          const containerWidth = templateRef.current.offsetWidth;
          const containerHeight = templateRef.current.offsetHeight;
  
          const scaleX = canvas.width / containerWidth;
          const scaleY = canvas.height / containerHeight;
  
          // Draw overlay fields
          const fieldsForTemplate = fields.filter((field) =>
            field.id.startsWith(`${template.id}-`)
          );
  
          fieldsForTemplate.forEach((field) => {
            const adjustedX = field.x * scaleX;
            const adjustedY = field.y * scaleY;
            const adjustedFontSize = field.fontSize * scaleY;
  
            context.font = `${adjustedFontSize}px ${field.fontFamily || "Arial"}`;
            context.fillStyle = field.color || "#000000";
            context.fillText(field.value, adjustedX, adjustedY);
          });
  
          // Convert the canvas to a base64 image URL
          const mergedImageUrl = canvas.toDataURL("image/png");
          resolve(mergedImageUrl);
        };
  
        image.onerror = (error) => {
          console.error("Error loading image:", error);
          reject(error);
        };
      } catch (error) {
        console.error("Error merging image with overlay:", error);
        reject(error);
      }
    });
  };
  
  
  

  const previewPdf = async () => {
    try {
      const pdfDoc = await PDFDocument.create();
      const pageSize = [595, 842]; // A4 size
      const margin = 10;
  
      const selectedTemplates = Object.entries(templateClicks)
        .flatMap(([templateId, count]) =>
          Array.from({ length: count }).map(() =>
            templates.find((t) => t.id === parseInt(templateId))
          )
        );
  
      if (selectedTemplates.length === 0) {
        alert("No templates selected for PDF preview.");
        return;
      }
  
      const gridSlotsPerPage = 4;
      const pagesNeeded = Math.ceil(selectedTemplates.length / gridSlotsPerPage);
  
      for (let pageIndex = 0; pageIndex < pagesNeeded; pageIndex++) {
        const page = pdfDoc.addPage(pageSize);
  
        const templatesForPage = selectedTemplates.slice(
          pageIndex * gridSlotsPerPage,
          (pageIndex + 1) * gridSlotsPerPage
        );
  
        let currentX = margin;
        let currentY = pageSize[1] - margin;
  
        for (let i = 0; i < templatesForPage.length; i++) {
          const template = templatesForPage[i];
  
          if (!template || !template.url) {
            console.warn("Template is undefined or missing properties:", template);
            continue;
          }
  
          // Merge overlay with the image
          const mergedImageUrl = await mergeImageWithOverlay(template);
  
          const imageBytes = await fetch(mergedImageUrl).then((res) =>
            res.arrayBuffer()
          );
          const embeddedImage = await pdfDoc.embedPng(imageBytes);
  
          // Position the image in the PDF
          const imageWidth = pageSize[0] - 2 * margin;
          const scaleFactor = imageWidth / embeddedImage.width;
          const imageHeight = embeddedImage.height * scaleFactor;
  
          page.drawImage(embeddedImage, {
            x: margin,
            y: currentY - imageHeight,
            width: imageWidth,
            height: imageHeight,
          });
  
          currentY -= imageHeight + margin; // Move to next position
        }
      }
  
      const pdfBytes = await pdfDoc.save();
      const pdfUrl = URL.createObjectURL(
        new Blob([pdfBytes], { type: "application/pdf" })
      );
      setPdfPreview(pdfUrl);
    } catch (error) {
      console.error("Error during PDF generation:", error);
      alert("Failed to generate PDF preview.");
    }
  };
  
  
  


  const fetchSuggestionsForField = async (query, fieldId) => {
    try {
      const response = await axios.get("http://localhost:8000/fetch-inputs", {
        params: {
          query,
          shape_type: category === "smartphone" ? "smartphone" : subCategory,
        },
      });
  
      const suggestions = response.data.length ? response.data : [];
  
      setFields((prevFields) =>
        prevFields.map((field) =>
          field.id === fieldId ? { ...field, suggestions } : field
        )
      );
    } catch (error) {
      console.error("Error fetching suggestions:", error);
    }
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

// Update the number of clicks for the selected template
setTemplateClicks((prev) => ({
  ...prev,
  [template.id]: (prev[template.id] || 0) + 1,
}));

// Generate fields based on the template type
const defaultFields = (() => {
  if (category === "smartphone") return predefinedPositions.smartphone || [];
  if (subCategory === "rectangular") return predefinedPositions.rectangular || [];
  if (subCategory === "square") return predefinedPositions.square || [];
  return [];
})();

// Debugging to confirm fields
console.log("Default Fields for Square:", defaultFields);
if (!defaultFields.length) {
  alert("No predefined fields found for the square template.");
}


 


setFields((prev) => [
  ...prev,
  ...defaultFields.map((field) => ({
    ...field,
    value: "",
    id: `${template.id}-${(templateClicks[template.id] || 0) + 1}`, // Unique field ID
  })),
]);

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
  <div className="mt-6 grid grid-cols-2 gap-4">
  {fields.map((field, index) => (
    <div key={index} className="relative p-4 bg-white border rounded shadow">
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
            fetchSuggestionsForField(e.target.value, field.id);
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
          onChange={(e) =>
            updateStyle(index, "fontSize", parseInt(e.target.value, 10))
          }
          className="w-20 p-1 border rounded"
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
      {field.suggestions && field.suggestions.length > 0 && (


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

          {Object.entries(templateClicks).map(([templateId, count]) => {
const template = templates.find((t) => t.id === parseInt(templateId));
if (!template || !template.url) {
  console.warn("Template not found or missing properties:", templateId);
  return;
}
  return Array.from({ length: count }).map((_, i) => (
    <div key={`${templateId}-${i}`} className="relative flex justify-center overflow-hidden">
      <img
        src={`http://localhost:8000/fetch-image/?url=${encodeURIComponent(template.url)}`}
        alt={template.name}
        className="max-h-96 w-auto object-contain rounded"
        onError={(e) => (e.target.src = "https://via.placeholder.com/150")}
      />
      <OverlayFields
        fields={fields.filter((field) => field && field.id.startsWith(`${templateId}-${i + 1}`))
        }
        updateFieldPosition={(index, x, y) => {
          const updatedFields = [...fields];
          updatedFields[index] = { ...updatedFields[index], x, y };
          setFields(updatedFields);
        }}
      />
      {/* Remove Template Button */}
      <button
        onClick={() => removeTemplate(templateId, i + 1)}
        className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded"
      >
        Remove
      </button>
    </div>
  ));
})}


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
        onLoad={() => console.log("PDF loaded successfully in iframe.")}
        onError={() => console.error("Error loading PDF in iframe.")}
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
