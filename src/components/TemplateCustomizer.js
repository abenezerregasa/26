import React, { useState, useEffect, useCallback } from "react";
import Draggable from "react-draggable";
import PredefinedPositions from "./PredefinedPositions";
import FontSelector from "./FontSelector";

const TemplateCustomizer = ({ selectedTemplates, onRemoveTemplate }) => {
  const [customizations, setCustomizations] = useState({});
  const [draggingPosition, setDraggingPosition] = useState({ x: 0, y: 0 });
  const [currentField, setCurrentField] = useState(null); // Keep track of the currently dragged field
  const predefinedPositions = PredefinedPositions();
  const scaleFactor = 0.4;

  useEffect(() => {
    // Load fonts dynamically from Google Fonts
    const styleElement = document.createElement("link");
    styleElement.rel = "stylesheet";
    styleElement.href =
      "https://fonts.googleapis.com/css2?family=" +
      ["Bodoni Moda", "Didot", "Garamond", "Georgia"].map(
        (font) => font.replace(/\s+/g, "+") + "&display=swap"
      ).join("");
    document.head.appendChild(styleElement);
  }, []);

  const handleInputChange = useCallback((uniqueId, field, value) => {
    setCustomizations((prev) => ({
      ...prev,
      [uniqueId]: { ...prev[uniqueId], [field]: value },
    }));
  }, []);

  const updateStyle = (uniqueId, fieldName, property, value) => {
    setCustomizations((prev) => ({
      ...prev,
      [uniqueId]: {
        ...prev[uniqueId],
        [fieldName]: {
          ...prev[uniqueId]?.[fieldName],
          [property]: value,
        },
      },
    }));
  };

  const getGridStyle = (type) => {
    switch (type) {
      case "rectangular":
        return { width: `${1500 * scaleFactor}px`, height: `${500 * scaleFactor}px` };
      case "square":
        return { width: `${1080 * scaleFactor}px`, height: `${1080 * scaleFactor}px` };
      case "smartphone":
        return { width: `${1375 * scaleFactor}px`, height: `${1044 * scaleFactor}px` };
      default:
        return { width: `${400 * scaleFactor}px`, height: `${300 * scaleFactor}px` };
    }
  };

  const handleDrag = (e, data, uniqueId, fieldName) => {
    setDraggingPosition({ x: Math.round(data.x), y: Math.round(data.y) });
    setCurrentField({ uniqueId, fieldName });
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">
        Customize Your Templates
      </h2>

      {/* Real-Time Position Counter */}
      {currentField && (
        <div className="fixed bottom-2 right-2 bg-gray-700 text-white text-sm px-4 py-2 rounded-lg z-50">
          {`Label: ${currentField.fieldName}, Position: X: ${draggingPosition.x}, Y: ${draggingPosition.y}`}
        </div>
      )}

      {/* Template Section */}
      <section
        className="flex-grow bg-gray-100 px-4 py-8 overflow-y-auto"
        style={{
          minHeight: "400px",
          maxHeight: "calc(100vh - 200px)",
        }}
      >
        <div
          className="grid"
          style={{
            gridTemplateColumns: "repeat(2, 1fr)",
            rowGap: "1000px",
            columnGap: "32px",
            alignItems: "center",
            justifyItems: "center",
          }}
        >
          {selectedTemplates.map((template) => (
            <div
              key={template.uniqueId}
              className="template-row relative bg-white p-4 rounded-lg shadow-lg"
              style={{
                ...getGridStyle(template.type),
              }}
            >
              {/* Remove Template Button */}
              <button
                onClick={() => onRemoveTemplate(template.uniqueId)}
                className="absolute top-2 right-2 px-3 py-1 flex items-center gap-2 bg-red-600 text-white font-medium rounded-md shadow hover:bg-red-700 hover:shadow-lg transition duration-300"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="w-5 h-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
                Remove
              </button>

              {/* Template Preview */}
              <div
                className="relative w-full h-full rounded-md overflow-hidden"
                style={{
                  ...getGridStyle(template.type),
                }}
              >
                <img
                  src={template.url}
                  alt={template.template_name}
                  className="w-full h-full object-contain"
                />
                {(predefinedPositions[template.type] || []).map((field) => (
                  <Draggable
                    key={`${template.uniqueId}-${field.name}`}
                    bounds="parent"
                    onDrag={(e, data) => handleDrag(e, data, template.uniqueId, field.name)}
                  >
                    <div
                      style={{
                        position: "absolute",
                        left: `${field.x}px`,
                        top: `${field.y}px`,
                        fontSize: customizations[template.uniqueId]?.[field.name]?.fontSize || field.fontSize,
                        color: customizations[template.uniqueId]?.[field.name]?.color || field.color,
                        fontFamily: customizations[template.uniqueId]?.[field.name]?.font || "Arial",
                        fontWeight: customizations[template.uniqueId]?.[field.name]?.bold ? "bold" : "normal",
                        fontStyle: customizations[template.uniqueId]?.[field.name]?.italic ? "italic" : "normal",
                      }}
                      className="cursor-move bg-transparent"
                    >
                      {customizations[template.uniqueId]?.[field.name]?.text || ""}
                    </div>
                  </Draggable>
                ))}
              </div>

              {/* Input Fields with Font Controls */}
              <div className="mt-4 space-y-4">
                {(predefinedPositions[template.type] || []).map((field) => (
                  <div key={field.name} className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      {field.name}
                    </label>
                    <input
                      type="text"
                      placeholder={`Enter ${field.name}`}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      value={customizations[template.uniqueId]?.[field.name]?.text || ""}
                      onChange={(e) =>
                        handleInputChange(template.uniqueId, field.name, {
                          ...customizations[template.uniqueId]?.[field.name],
                          text: e.target.value,
                        })
                      }
                    />

                    {/* Font Customization */}
                    <FontSelector
                      selectedFont={{
                        type: customizations[template.uniqueId]?.[field.name]?.font || "",
                        size: parseInt(customizations[template.uniqueId]?.[field.name]?.fontSize) || field.fontSize,
                        color: customizations[template.uniqueId]?.[field.name]?.color || "",
                        bold: customizations[template.uniqueId]?.[field.name]?.bold || false,
                        italic: customizations[template.uniqueId]?.[field.name]?.italic || false,
                      }}
                      onFontChange={(font) =>
                        updateStyle(template.uniqueId, field.name, "font", font)
                      }
                      onFontSizeChange={(fontSize) =>
                        updateStyle(template.uniqueId, field.name, "fontSize", `${fontSize}px`)
                      }
                      onFontColorChange={(color) =>
                        updateStyle(template.uniqueId, field.name, "color", color)
                      }
                      onBoldChange={(bold) =>
                        updateStyle(template.uniqueId, field.name, "bold", bold)
                      }
                      onItalicChange={(italic) =>
                        updateStyle(template.uniqueId, field.name, "italic", italic)
                      }
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Save Button */}
      <div className="text-center mt-8">
        <button
          onClick={() => console.log("Customizations saved for:", customizations)}
          className="px-8 py-4 bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-lg font-bold text-xl hover:opacity-90 transition-all"
        >
          Save Customizations
        </button>
      </div>
    </div>
  );
};

export default TemplateCustomizer;
