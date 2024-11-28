import React, { useState, useEffect, useRef } from "react";
import axios from "axios";

const AutoSuggestion = ({ onSuggestionSelect }) => {
  const [modelInput, setModelInput] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [hoveredSuggestion, setHoveredSuggestion] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const debounceTimeout = useRef(null);

  // Fetch model suggestions when user types in the input field
  useEffect(() => {
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }

    debounceTimeout.current = setTimeout(() => {
      const fetchSuggestions = async () => {
        if (modelInput.length > 0) {
          setIsLoading(true);
          try {
            const response = await axios.get(
              `http://localhost:8000/templates/suggestions?keyword=${encodeURIComponent(modelInput)}`
            );
            setSuggestions(response.data);
          } catch (error) {
            console.error("Error fetching suggestions:", error);
            setSuggestions([]);
          } finally {
            setIsLoading(false);
          }
        } else {
          setSuggestions([]);
        }
      };

      fetchSuggestions();
    }, 300); // 300ms debounce

    return () => {
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }
    };
  }, [modelInput]);

  // Handle user selecting a suggestion
  const handleSelect = (suggestion) => {
    setModelInput(suggestion.model);
    onSuggestionSelect(suggestion);
    setSuggestions([]);
  };

  return (
    <div className="relative w-full">
      <input
        type="text"
        value={modelInput}
        onChange={(e) => setModelInput(e.target.value)}
        placeholder="Enter model name..."
        className="w-full p-2 border border-gray-300 rounded"
      />
      {isLoading && <div className="absolute right-2 top-2 text-gray-500">Loading...</div>}
      {suggestions.length > 0 && (
        <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded mt-1 max-h-48 overflow-y-auto">
          {suggestions.map((suggestion) => (
            <li
              key={suggestion.id}
              className={`p-2 hover:bg-gray-200 cursor-pointer ${
                hoveredSuggestion === suggestion ? "bg-gray-200" : ""
              }`}
              onMouseEnter={() => setHoveredSuggestion(suggestion)}
              onMouseLeave={() => setHoveredSuggestion(null)}
              onClick={() => handleSelect(suggestion)}
            >
              {suggestion.model}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AutoSuggestion;
