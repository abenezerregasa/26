import React, { useState } from "react";
import Modal from "react-modal"; // Modal for PDF preview
import { PDFDocument, rgb } from "pdf-lib"; // For PDF manipulation

Modal.setAppElement("#root"); // Attach modal to the app root

const PDFPreview = ({ selectedTemplates, customizations }) => {
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [pdfDataUrl, setPdfDataUrl] = useState(null);

  // Function to merge template with overlay using canvas
  const mergeImageWithOverlay = async (template) => {
    return new Promise((resolve, reject) => {
      try {
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");

        const image = new Image();
        image.crossOrigin = "Anonymous"; // Avoid CORS issues
        image.src = template.url;

        image.onload = () => {
          // Set canvas dimensions to match the image
          canvas.width = image.width;
          canvas.height = image.height;

          // Draw the base template image onto the canvas
          context.drawImage(image, 0, 0, canvas.width, canvas.height);

          // Draw overlay text based on customizations
          const customFields = customizations[template.uniqueId] || {};
          Object.entries(customFields).forEach(([fieldName, field]) => {
            if (field.text) {
              context.font = `${field.fontSize}px ${field.fontFamily || "Arial"}`;
              context.fillStyle = field.color || "#000000";
              context.fillText(field.text, field.x || 0, field.y || 0);
            }
          });

          // Convert canvas to an image
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

  // Generate PDF with the merged images
  const generatePDF = async () => {
    try {
      const pdfDoc = await PDFDocument.create();

      for (const template of selectedTemplates) {
        const mergedImageUrl = await mergeImageWithOverlay(template);
        const imgBytes = await fetch(mergedImageUrl).then((res) => res.arrayBuffer());

        let img;
        if (mergedImageUrl.includes("image/png")) {
          img = await pdfDoc.embedPng(imgBytes);
        } else {
          img = await pdfDoc.embedJpg(imgBytes);
        }

        const page = pdfDoc.addPage([img.width, img.height]);
        page.drawImage(img, {
          x: 0,
          y: 0,
          width: img.width,
          height: img.height,
        });
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      setPdfDataUrl(url);
      setModalIsOpen(true); // Open modal for PDF preview
    } catch (error) {
      console.error("Error generating PDF:", error);
    }
  };

  const closeModal = () => {
    setModalIsOpen(false);
    setPdfDataUrl(null);
  };

  return (
    <div className="text-center mt-8">
      <button
        onClick={generatePDF}
        className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg font-bold text-xl hover:opacity-90 transition-all"
      >
        Preview PDF
      </button>

      {/* Modal for PDF Preview */}
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
