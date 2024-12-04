import React, { useState, useEffect, useCallback, useRef } from "react";
import Draggable from "react-draggable";
import PredefinedPositions from "./PredefinedPositions";
import FontSelector from "./FontSelector";
import AutoSuggestion from "./AutoSuggestion";
import Modal from "react-modal";
import { toPng } from "html-to-image";
import { PDFDocument } from "pdf-lib";

Modal.setAppElement("#root");

const TemplateCustomizer = ({ selectedTemplates, onRemoveTemplate }) => {
  const [customizations, setCustomizations] = useState({});
  const [draggingPosition, setDraggingPosition] = useState({ x: 0, y: 0 });
  const [currentField, setCurrentField] = useState(null);
  const [pdfDataUrl, setPdfDataUrl] = useState(null);
  const [modalIsOpen, setModalIsOpen] = useState(false);

  const predefinedPositions = PredefinedPositions();
  const scaleFactor = 0.5;
  const gridRef = useRef(null);

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
      [uniqueId]: { ...prev[uniqueId], [field]: { ...prev[uniqueId]?.[field], text: value } },
    }));
  }, []);

  const handleSuggestionSelect = (uniqueId, suggestion) => {
    setCustomizations((prev) => ({
      ...prev,
      [uniqueId]: {
        ...prev[uniqueId],
        ...suggestion,
      },
    }));

    Object.keys(suggestion).forEach((key) => {
      const inputField = document.querySelector(`input[name="${key}"][data-unique-id="${uniqueId}"]`);
      if (inputField) {
        inputField.value = suggestion[key] || "";
      }
    });
  };

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
    const adjustedX = Math.round(data.x / scaleFactor);
    const adjustedY = Math.round(data.y / scaleFactor);
    setDraggingPosition({ x: adjustedX, y: adjustedY });
    setCurrentField({ uniqueId, fieldName });

    updateStyle(uniqueId, fieldName, "x", adjustedX);
    updateStyle(uniqueId, fieldName, "y", adjustedY);
  };

  const previewPDF = async () => {
    if (!gridRef.current) {
      alert("No templates selected for preview.");
      return;
    }

    try {
      const pdfDoc = await PDFDocument.create();
      const containers = gridRef.current.querySelectorAll(".template-row");

      for (const container of containers) {
        const imageDataUrl = await toPng(container, { cacheBust: true });
        const imgBytes = await fetch(imageDataUrl).then((res) => res.arrayBuffer());
        const img = await pdfDoc.embedPng(imgBytes);

        const page = pdfDoc.addPage([595.28, 841.89]); // A4 size
        const imgWidth = img.width;
        const imgHeight = img.height;

        const scale = Math.min(page.getWidth() / imgWidth, page.getHeight() / imgHeight);
        const scaledWidth = imgWidth * scale;
        const scaledHeight = imgHeight * scale;

        page.drawImage(img, {
          x: (page.getWidth() - scaledWidth) / 2,
          y: (page.getHeight() - scaledHeight) / 2,
          width: scaledWidth,
          height: scaledHeight,
        });
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      setPdfDataUrl(url);
      setModalIsOpen(true);
    } catch (error) {
      console.error("Error previewing PDF:", error);
    }
  };

  const closeModal = () => {
    setModalIsOpen(false);
    setPdfDataUrl(null);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">
        Customize Your Templates
      </h2>

      {currentField && (
        <div className="fixed bottom-2 right-2 bg-gray-700 text-white text-sm px-4 py-2 rounded-lg z-50">
          {`Label: ${currentField.fieldName}, Position: X: ${draggingPosition.x}, Y: ${draggingPosition.y}`}
        </div>
      )}

      <section
        className="flex-grow bg-gray-100 px-4 py-8 overflow-y-auto"
        style={{
          minHeight: "400px",
          maxHeight: "calc(100vh - 200px)",
        }}
      >
        <div ref={gridRef} className="grid grid-cols-2 gap-4">
          {selectedTemplates.map((template) => (
            <div
              key={template.uniqueId}
              className="template-row relative bg-white p-4 rounded-lg shadow-lg"
              style={{
                ...getGridStyle(template.type),
              }}
            >
              <button
                onClick={() => onRemoveTemplate(template.uniqueId)}
                className="absolute top-2 right-2 px-3 py-1 flex items-center gap-2 bg-red-600 text-white font-medium rounded-md shadow hover:bg-red-700 hover:shadow-lg transition duration-300"
              >
                Remove
              </button>

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
                {predefinedPositions[template.type]?.map((field) => (
                  <Draggable
                    key={`${template.uniqueId}-${field.name}`}
                    bounds="parent"
                    onDrag={(e, data) => handleDrag(e, data, template.uniqueId, field.name)}
                    defaultPosition={{
                      x: field.x * scaleFactor,
                      y: field.y * scaleFactor,
                    }}
                  >
                    <div
                      style={{
                        position: "absolute",
                        left: `${customizations[template.uniqueId]?.[field.name]?.x * scaleFactor || field.x * scaleFactor}px`,
                        top: `${customizations[template.uniqueId]?.[field.name]?.y * scaleFactor || field.y * scaleFactor}px`,
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

              <div className="mt-4 space-y-4">
                <AutoSuggestion
                  templateId={template.uniqueId}
                  onSuggestionSelect={(suggestion) => handleSuggestionSelect(template.uniqueId, suggestion)}
                />

                {predefinedPositions[template.type]?.map((field) => (
                  <div key={field.name} className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      {field.name}
                    </label>
                    <input
                      type="text"
                      name={field.name}
                      placeholder={`Enter ${field.name}`}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      value={customizations[template.uniqueId]?.[field.name]?.text || ""}
                      data-unique-id={template.uniqueId}
                      onChange={(e) =>
                        handleInputChange(template.uniqueId, field.name, e.target.value)
                      }
                    />
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

      <button
        onClick={previewPDF}
        className="mt-8 px-6 py-3 bg-blue-600 text-white rounded-lg"
      >
        Preview PDF
      </button>

      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        contentLabel="PDF Preview"
        style={{
          content: {
            top: "50%",
            left: "50%",
            right: "auto",
            bottom: "auto",
            marginRight: "-50%",
            transform: "translate(-50%, -50%)",
            width: "80%",
            height: "80%",
          },
          overlay: {
            backgroundColor: "rgba(0, 0, 0, 0.75)",
          },
        }}
      >
        <div className="flex flex-col h-full">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">PDF Preview</h2>
            <button
              onClick={closeModal}
              className="text-white bg-red-600 px-4 py-2 rounded hover:bg-red-700"
            >
              Close
            </button>
          </div>
          {pdfDataUrl ? (
            <iframe
              src={pdfDataUrl}
              title="PDF Preview"
              className="flex-grow w-full"
              style={{ border: "none" }}
            />
          ) : (
            <p>Loading PDF...</p>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default TemplateCustomizer;
