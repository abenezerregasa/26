import React from "react";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

const PDFPreview = ({ selectedTemplates, customizations }) => {
  const generatePDF = async () => {
    try {
      const pdfDoc = await PDFDocument.create();

      for (const template of selectedTemplates) {
        const page = pdfDoc.addPage([800, 600]);
        const { width, height } = page.getSize();

        // Fetch Template Image and Embed
        const response = await fetch(template.url);
        const imgBytes = await response.arrayBuffer();
        let img;

        const contentType = response.headers.get("content-type");
        if (contentType === "image/png") {
          img = await pdfDoc.embedPng(imgBytes);
        } else if (contentType === "image/jpeg" || template.url.endsWith(".jpg") || template.url.endsWith(".jpeg")) {
          img = await pdfDoc.embedJpg(imgBytes);
        } else {
          console.error("Unsupported image format:", contentType);
          continue; // Skip this template if the image format isn't supported
        }

        // Add Image to PDF Page
        const imgWidth = width - 100;
        const imgHeight = (imgWidth * img.height) / img.width;
        page.drawImage(img, {
          x: 50,
          y: height - imgHeight - 50,
          width: imgWidth,
          height: imgHeight,
        });

        // Add Custom Text Overlays
        const customFields = customizations[template.uniqueId] || {};
        for (const [fieldName, custom] of Object.entries(customFields)) {
          page.drawText(custom.text || "", {
            x: custom.x || 100,
            y: custom.y || 400,
            size: parseInt(custom.fontSize, 10) || 16,
            font: await pdfDoc.embedFont(StandardFonts.Helvetica),
            color: custom.color
              ? rgb(
                  parseInt(custom.color.slice(1, 3), 16) / 255,
                  parseInt(custom.color.slice(3, 5), 16) / 255,
                  parseInt(custom.color.slice(5, 7), 16) / 255
                )
              : rgb(0, 0, 0),
            fontWeight: custom.bold ? "bold" : "normal",
            fontStyle: custom.italic ? "italic" : "normal",
          });
        }
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
