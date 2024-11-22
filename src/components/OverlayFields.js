// OverlayFields.js
import React, { useState } from "react";
import Draggable from "react-draggable";

const OverlayFields = ({ fields, updateFieldPosition }) => {
  const [dragPosition, setDragPosition] = useState(null); // State to track dragging position

  // Handle drag event
  const handleDrag = (index, e, data) => {
    setDragPosition({ index, x: data.x, y: data.y }); // Update the position while dragging
  };

  return (
    <>
      {fields.map((field, index) => (
        <Draggable
          key={index}
          position={{ x: field.x, y: field.y }}
          onDrag={(e, data) => handleDrag(index, e, data)}
          onStop={(e, data) => updateFieldPosition(index, data.x, data.y)}
        >
          <div
            className="absolute"
            style={{
              cursor: "move",
              fontSize: `${field.fontSize}px`,
              color: field.color,
            }}
          >
            {field.value}
          </div>
        </Draggable>
      ))}

      {/* Display the current drag position */}
      {dragPosition !== null && (
        <div
          className="fixed bottom-5 right-5 bg-black text-white p-2 rounded"
          style={{ zIndex: 1000 }}
        >
          <p>Field: {fields[dragPosition.index].name}</p>
          <p>X: {dragPosition.x}, Y: {dragPosition.y}</p>
        </div>
      )}
    </>
  );
};

export default OverlayFields;
