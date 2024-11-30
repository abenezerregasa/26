import React, { useState, useRef } from "react";
import Modal from "react-modal";
import { toPng } from "html-to-image"; // Importing toPng for capturing images
import { PDFDocument } from "pdf-lib";

Modal.setAppElement("#root");

const PDFPreview = ({ selectedTemplates = [] }) => {
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [pdfDataUrl, setPdfDataUrl] = useState(null);
  const gridRef = useRef(null);

  // Capture the image and overlay (without input fields)
  const captureTemplateImage = async (container) => {
    try {
      const imageSection = container.querySelector(".template-image")?.parentElement;
      if (imageSection) {
        return await toPng(imageSection);
      }
      throw new Error("Image section not found!");
    } catch (error) {
      console.error("Error capturing template image:", error);
      return null;
    }
  };

  // Generate the PDF
  const generatePDF = async () => {
    if (!gridRef.current) return;

    try {
      const pdfDoc = await PDFDocument.create();
      const containers = gridRef.current.querySelectorAll(".template-container");
      const images = [];

      // Capture images with overlays
      for (const container of containers) {
        const image = await captureTemplateImage(container);
        if (image) images.push(image);
      }

      if (images.length === 0) {
        alert("No templates selected for preview.");
        return;
      }

      // Add images to the PDF
      for (let i = 0; i < images.length; i++) {
        const page = pdfDoc.addPage([595.28, 841.89]); // A4 size
        const imgBytes = await fetch(images[i]).then((res) => res.arrayBuffer());
        const img = await pdfDoc.embedPng(imgBytes);

        // Fit the image into the page (centered, maintaining aspect ratio)
        const width = page.getWidth();
        const height = page.getHeight();
        const imgWidth = img.width;
        const imgHeight = img.height;

        const scale = Math.min(width / imgWidth, height / imgHeight);
        const scaledWidth = imgWidth * scale;
        const scaledHeight = imgHeight * scale;

        page.drawImage(img, {
          x: (width - scaledWidth) / 2,
          y: (height - scaledHeight) / 2,
          width: scaledWidth,
          height: scaledHeight,
        });
      }

      // Save the PDF
      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      setPdfDataUrl(url);
      setModalIsOpen(true);
    } catch (error) {
      console.error("Error generating PDF:", error);
    }
  };

  const closeModal = () => {
    setModalIsOpen(false);
    setPdfDataUrl(null);
  };

  return (
    <div>
      {/* Grid for templates */}
      <div ref={gridRef} className="grid grid-cols-2 gap-6 max-w-7xl mx-auto">
        {selectedTemplates.map((template, index) => (
          <div
            key={index}
            className="p-4 bg-white shadow rounded relative template-container"
          >
            <h3 className="text-center">{template.name}</h3>
            <div className="relative">
              <img
                src={template.url}
                alt={template.name}
                className="w-full h-auto border rounded mb-4 template-image"
                onError={(e) => (e.target.src = "https://via.placeholder.com/150")}
              />
              {/* Overlay text dynamically added */}
              {template.fields?.map((field, i) => (
                <div
                  key={i}
                  className="absolute"
                  style={{
                    top: `${field.y}px`,
                    left: `${field.x}px`,
                    fontSize: `${field.fontSize || 12}px`,
                    color: field.color || "#000",
                  }}
                >
                  {field.value || ""}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Preview PDF button */}
      <button
        onClick={generatePDF}
        className="fixed bottom-4 right-4 bg-blue-500 text-white px-4 py-2 rounded shadow"
      >
        Preview PDF
      </button>

      {/* Modal for displaying PDF */}
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

export default PDFPreview;
