import React, { useState } from "react";
import CategorySelector from "./components/CategorySelector";
import TemplatePreloader from "./components/TemplatePreloader";
import TemplateCustomizer from "./components/TemplateCustomizer";
import "tailwindcss/tailwind.css";

const App = () => {
  const [category, setCategory] = useState(null);
  const [view, setView] = useState("preloader");
  const [selectedTemplates, setSelectedTemplates] = useState([]);

  const handleCategorySelect = (mainCategory, subCategory) => {
    const selectedCategory = subCategory ? subCategory : mainCategory;
    setCategory(selectedCategory);
    setView("preloader");
  };

  const handleTemplateSelect = (template) => {
    setSelectedTemplates((prev) => [...prev, { ...template, uniqueId: Date.now() }]);
    setView("customizer");
  };

  const handleSaveCustomizations = () => {
    console.log("Customizations saved for:", selectedTemplates);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-300">
      <h1 className="text-5xl font-extrabold text-center mt-12 mb-10 text-gray-800">
        Template Management System
      </h1>
      <CategorySelector onCategorySelect={handleCategorySelect} />

      {view === "preloader" && (
        <TemplatePreloader
          category={category}
          onTemplatesLoaded={(templates) => console.log("Templates Loaded:", templates)}
          onTemplateSelect={handleTemplateSelect}
        />
      )}

      {view === "customizer" && (
        <TemplateCustomizer
          selectedTemplates={selectedTemplates}
          onSaveCustomizations={handleSaveCustomizations}
        />
      )}
    </div>
  );
};

export default App;
