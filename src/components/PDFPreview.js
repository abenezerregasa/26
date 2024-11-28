import React from "react";
import { PDFDocument, rgb } from "pdf-lib";

const PDFPreview = ({ selectedTemplates, customizations, positions }) => {
  const generatePDF = async () => {
    try {
      const pdfDoc = await PDFDocument.create();

      for (const template of selectedTemplates) {
        const page = pdfDoc.addPage([800, 600]);
        const { width, height } = page.getSize();

        // Add Template Image
        const imgBytes = await fetch(template.url).then((res) => res.arrayBuffer());
        const img = await pdfDoc.embedJpg(imgBytes);
        const imgWidth = width - 100;
        const imgHeight = (imgWidth * img.height) / img.width;
        page.drawImage(img, {
          x: 50,
          y: height - imgHeight - 50,
          width: imgWidth,
          height: imgHeight,
        });

        // Add Custom Text Overlays
        const custom = customizations[template.id] || {};
        page.drawText(custom.text || "", {
          x: positions[template.id]?.x || 100,
          y: positions[template.id]?.y || 400,
          size: parseInt(custom.fontSize) || 16,
          font: pdfDoc.getFont("Helvetica"),
          color: custom.color
            ? rgb(
                parseInt(custom.color.slice(1, 3), 16) / 255,
                parseInt(custom.color.slice(3, 5), 16) / 255,
                parseInt(custom.color.slice(5, 7), 16) / 255
              )
            : rgb(0, 0, 0),
        });
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      window.open(url);
    } catch (error) {
      console.error("Error generating PDF:", error);
    }
  };

  return (
    <div className="text-center mt-8">
      <button
        onClick={generatePDF}
        className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg font-bold text-xl hover:opacity-90 transition-all"
      >
        Preview PDF
      </button>
    </div>
  );
};

export default PDFPreview;
