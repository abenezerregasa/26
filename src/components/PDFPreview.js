import React, { useState } from "react";
import Modal from "react-modal";
import { PDFDocument, rgb } from "pdf-lib";

Modal.setAppElement("#root");

const PDFPreview = ({ selectedTemplates }) => {
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [pdfDataUrl, setPdfDataUrl] = useState(null);

  // Function to merge image and overlay
  const mergeImageWithOverlay = async (template) => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");

      const image = new Image();
      image.crossOrigin = "Anonymous";
      image.src = template.url;

      image.onload = () => {
        canvas.width = image.width;
        canvas.height = image.height;

        context.drawImage(image, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/png"));
      };

      image.onerror = (error) => reject(error);
    });
  };

  // Function to draw grid separation lines
  const drawGridLines = (page, gridSize, cellWidth, cellHeight) => {
    const lineColor = rgb(0.7, 0.7, 0.7); // Light gray line for separation

    // Draw vertical lines
    for (let i = 1; i < gridSize.cols; i++) {
      page.drawLine({
        start: { x: i * cellWidth, y: 0 },
        end: { x: i * cellWidth, y: page.getHeight() },
        thickness: 0.5,
        color: lineColor,
      });
    }

    // Draw horizontal lines
    for (let i = 1; i < gridSize.rows; i++) {
      page.drawLine({
        start: { x: 0, y: i * cellHeight },
        end: { x: page.getWidth(), y: i * cellHeight },
        thickness: 0.5,
        color: lineColor,
      });
    }
  };

  // Generate PDF
  const generatePDF = async () => {
    try {
      const pdfDoc = await PDFDocument.create();

      // Separate templates by type
      const smartphoneTemplates = selectedTemplates.filter((t) => t.type === "smartphone");
      const squareTemplates = selectedTemplates.filter((t) => t.type === "square");
      const rectangularTemplates = selectedTemplates.filter((t) => t.type === "rectangular");

      // Add smartphone templates in 2x2 grid
      if (smartphoneTemplates.length > 0) {
        let currentPage = pdfDoc.addPage([595.28, 841.89]); // A4 size
        const gridSize = { cols: 2, rows: 2, cellWidth: 297.64, cellHeight: 420.945 }; // 2x2 grid

        for (let i = 0; i < 4; i++) {
          const template = smartphoneTemplates[i];

          if (template) {
            const mergedImageUrl = await mergeImageWithOverlay(template);
            const imgBytes = await fetch(mergedImageUrl).then((res) => res.arrayBuffer());
            const img = await pdfDoc.embedPng(imgBytes);

            const col = i % gridSize.cols;
            const row = Math.floor(i / gridSize.cols);

            currentPage.drawImage(img, {
              x: col * gridSize.cellWidth,
              y: currentPage.getHeight() - (row + 1) * gridSize.cellHeight,
              width: gridSize.cellWidth,
              height: gridSize.cellHeight,
            });
          }
        }

        // Add grid separation lines
        drawGridLines(currentPage, gridSize, gridSize.cellWidth, gridSize.cellHeight);
      }

      // Add square templates in 2x2 grid (same as smartphone)
      if (squareTemplates.length > 0) {
        let currentPage = pdfDoc.addPage([595.28, 841.89]); // A4 size
        const gridSize = { cols: 2, rows: 2, cellWidth: 297.64, cellHeight: 420.945 }; // 2x2 grid

        for (let i = 0; i < 4; i++) {
          const template = squareTemplates[i];

          if (template) {
            const mergedImageUrl = await mergeImageWithOverlay(template);
            const imgBytes = await fetch(mergedImageUrl).then((res) => res.arrayBuffer());
            const img = await pdfDoc.embedPng(imgBytes);

            const col = i % gridSize.cols;
            const row = Math.floor(i / gridSize.cols);

            currentPage.drawImage(img, {
              x: col * gridSize.cellWidth,
              y: currentPage.getHeight() - (row + 1) * gridSize.cellHeight,
              width: gridSize.cellWidth,
              height: gridSize.cellHeight,
            });
          }
        }

        // Add grid separation lines
        drawGridLines(currentPage, gridSize, gridSize.cellWidth, gridSize.cellHeight);
      }

      // Add rectangular templates in 4x1 grid (stacked vertically)
      if (rectangularTemplates.length > 0) {
        let currentPage = pdfDoc.addPage([595.28, 841.89]); // A4 size
        const gridSize = { cols: 1, rows: 4, cellWidth: 595.28, cellHeight: 210.4725 }; // 4x1 grid, stacked vertically

        for (let i = 0; i < 4; i++) {
          const template = rectangularTemplates[i];

          if (template) {
            const mergedImageUrl = await mergeImageWithOverlay(template);
            const imgBytes = await fetch(mergedImageUrl).then((res) => res.arrayBuffer());
            const img = await pdfDoc.embedPng(imgBytes);

            currentPage.drawImage(img, {
              x: 0,
              y: (gridSize.rows - 1 - i) * gridSize.cellHeight, // Stack vertically
              width: gridSize.cellWidth,
              height: gridSize.cellHeight,
            });
          }
        }

        // Add grid separation lines
        drawGridLines(currentPage, gridSize, gridSize.cellWidth, gridSize.cellHeight);
      }

      // Save and show the PDF
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
    <div className="text-center mt-8">
      <button
        onClick={generatePDF}
        className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg font-bold text-xl hover:opacity-90 transition-all"
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

export default PDFPreview;