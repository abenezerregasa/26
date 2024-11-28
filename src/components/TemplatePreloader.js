import React, { useState, useEffect } from "react";
import { ClipLoader } from "react-spinners";

// Preload images function
const preloadImage = async (url, retries = 3) => {
  const proxiedUrl = `http://localhost:8000/fetch-image?url=${encodeURIComponent(url)}`;
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = proxiedUrl;

    img.onload = () => {
      console.log(`Image preloaded successfully: ${url}`);
      resolve(proxiedUrl);
    };

    img.onerror = async () => {
      if (retries > 0) {
        console.warn(`Retrying image preload: ${url}`);
        setTimeout(() => preloadImage(url, retries - 1).then(resolve).catch(reject), 500);
      } else {
        console.error(`Image failed to preload after retries: ${url}`);
        reject(url);
      }
    };
  });
};

const PLACEHOLDER_IMAGE = "/path-to-placeholder-image.png";

const TemplatePreloader = ({ category, onTemplatesLoaded, onTemplateSelect }) => {
  const [loading, setLoading] = useState(true);
  const [templates, setTemplates] = useState([]);

  useEffect(() => {
    const fetchAndPreload = async () => {
      setLoading(true);

      if (!category) {
        console.warn("No category selected. Cannot fetch templates.");
        setLoading(false);
        return;
      }

      console.log(`Fetching templates for category: ${category}`);

      try {
        const response = await fetch(`http://localhost:8000/templates/${category}`);
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        const data = await response.json();

        const preloadedTemplates = await Promise.all(
          data.map(async (template) => {
            try {
              const preloadedUrl = await preloadImage(template.url);
              return { ...template, url: preloadedUrl };
            } catch {
              return { ...template, url: PLACEHOLDER_IMAGE }; // Use placeholder for failed images
            }
          })
        );

        setTemplates(preloadedTemplates);
        onTemplatesLoaded(preloadedTemplates);
      } catch (error) {
        console.error("Error fetching templates:", error);
        setTemplates([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAndPreload();
  }, [category, onTemplatesLoaded]);

  if (loading) {
    return (
      <div className="flex flex-col items-center">
        <ClipLoader size={50} color={"#123abc"} />
        <span className="mt-4 text-2xl font-semibold text-gray-700">Loading templates...</span>
      </div>
    );
  }

  if (!templates.length) {
    return (
      <div className="text-center">
        <h2 className="text-lg text-gray-600">No templates available.</h2>
        <p>Please select a valid category.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {templates.map((template) => (
        <div
          key={template.id}
          className="relative p-4 bg-white rounded-lg shadow-lg hover:shadow-2xl transition-transform transform hover:-translate-y-2"
        >
          <div className="relative w-full aspect-w-4 aspect-h-3 overflow-hidden">
            <img
              src={template.url} // Proxied or preloaded URL
              alt={template.name}
              className="w-full h-full object-cover rounded-md"
            />
          </div>
          <h3 className="font-bold text-lg mt-2 text-gray-800 text-center">{template.name}</h3>
          <button
            onClick={() => onTemplateSelect(template)} // Add to cart
            className="mt-4 w-full px-4 py-2 bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-lg font-semibold hover:opacity-90 transition-all"
          >
            Add to Selection
          </button>
        </div>
      ))}
    </div>
  );
};

export default TemplatePreloader;
