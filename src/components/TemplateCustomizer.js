import React from "react";

const TemplateCustomizer = ({ selectedTemplates, onSaveCustomizations }) => {
  return (
    <div className="mt-16 mx-auto max-w-6xl">
      <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">Customize Your Templates</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {selectedTemplates.map((template, index) => (
          <div key={index} className="p-6 bg-white rounded-lg shadow-xl">
            <img
              src={template.url}
              alt={template.name}
              className="w-full h-40 object-cover rounded-md"
            />
            <h3 className="font-bold text-xl mt-4 text-gray-800">{template.name}</h3>
            <div className="space-y-4 mt-4">
              <input
                type="text"
                placeholder="Enter custom value 1"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
              <input
                type="text"
                placeholder="Enter custom value 2"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          </div>
        ))}
      </div>
      <div className="text-center mt-8">
        <button
          onClick={onSaveCustomizations}
          className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg font-bold text-xl hover:opacity-90 transition-all"
        >
          Save Customizations
        </button>
      </div>
    </div>
  );
};

export default TemplateCustomizer;
