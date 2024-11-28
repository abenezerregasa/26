import React, { useState } from "react";
import CategorySelector from "./components/CategorySelector";
import TemplatePreloader from "./components/TemplatePreloader";
import TemplateCustomizer from "./components/TemplateCustomizer";
import Footer from "./components/Footer";
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

  const handleTemplateAdd = (template) => {
    setSelectedTemplates((prev) => [...prev, { ...template, uniqueId: Date.now() }]);
  };

  const handleTemplateRemove = (uniqueId) => {
    setSelectedTemplates((prev) => prev.filter((template) => template.uniqueId !== uniqueId));
  };

  const goToCustomization = () => {
    setView("customizer");
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-gray-100 to-gray-300">
      <header className="text-5xl font-extrabold text-center mt-12 mb-10 text-gray-800">
        Template Management System
      </header>

      <main className="flex-grow px-4">
        <CategorySelector onCategorySelect={handleCategorySelect} />

        {view === "preloader" && (
          <>
            <TemplatePreloader
              category={category}
              onTemplatesLoaded={(templates) => console.log("Templates Loaded:", templates)}
              onTemplateSelect={handleTemplateAdd}
            />
            {selectedTemplates.length > 0 && (
              <div className="mt-8 text-center">
                <button
                  onClick={goToCustomization}
                  className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg font-bold text-lg hover:opacity-90 transition-all"
                >
                  Go to Customization ({selectedTemplates.length} Selected)
                </button>
              </div>
            )}
          </>
        )}

        {view === "customizer" && (
          <TemplateCustomizer
            selectedTemplates={selectedTemplates}
            onRemoveTemplate={handleTemplateRemove}
          />
        )}
      </main>

      <Footer />
    </div>
  );
};

export default App;
