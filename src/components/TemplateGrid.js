import React from "react";

const TemplateGrid = ({ templates, onTemplateSelect, category }) => {
  return (
    <div className="mt-16 mx-auto max-w-6xl">
      <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">
        Templates for {category}
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {templates.map((template) => (
          <div
            key={template.id}
            className="relative p-6 bg-white rounded-lg shadow-xl hover:shadow-2xl transition-transform transform hover:-translate-y-2"
          >
            <div className="relative w-full h-40 bg-gray-200 rounded-md overflow-hidden">
              <img
                src={template.url}
                alt={template.name}
                className="w-full h-full object-cover rounded-md"
              />
            </div>
            <h3 className="font-bold text-xl mt-4 text-gray-800">{template.name}</h3>
            <p className="text-md text-gray-600 mb-4">Type: {template.type}</p>
            <button
              onClick={() => onTemplateSelect(template)}
              className="absolute top-2 right-2 px-4 py-2 bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-lg font-semibold hover:opacity-90 transition-all"
            >
              Select
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TemplateGrid;