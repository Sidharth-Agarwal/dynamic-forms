// components/UI/SearchInput.jsx
import React, { useState, useRef, useEffect } from 'react';
import { Search, X, Loader2 } from 'lucide-react';
import { debounce } from '../../utils';

const SearchInput = ({
  value = '',
  onChange,
  onSearch,
  placeholder = 'Search...',
  debounceMs = 300,
  loading = false,
  disabled = false,
  clearable = true,
  autoFocus = false,
  size = 'md',
  className = '',
  suggestions = [],
  onSuggestionSelect,
  showSuggestions = false,
  ...props
}) => {
  const [internalValue, setInternalValue] = useState(value);
  const [showSuggestionsList, setShowSuggestionsList] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const inputRef = useRef(null);
  const suggestionsRef = useRef(null);

  const sizeClasses = {
    sm: 'h-8 text-sm',
    md: 'h-10 text-sm',
    lg: 'h-12 text-base'
  };

  // Debounced search function
  const debouncedSearch = useRef(
    debounce((searchValue) => {
      onSearch?.(searchValue);
    }, debounceMs)
  ).current;

  // Update internal value when prop changes
  useEffect(() => {
    setInternalValue(value);
  }, [value]);

  // Auto focus
  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  // Handle clicks outside suggestions
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target) &&
        !inputRef.current?.contains(event.target)
      ) {
        setShowSuggestionsList(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setInternalValue(newValue);
    onChange?.(newValue);
    
    // Show suggestions if we have them and input is not empty
    if (suggestions.length > 0 && newValue.trim()) {
      setShowSuggestionsList(true);
      setHighlightedIndex(-1);
    } else {
      setShowSuggestionsList(false);
    }

    // Trigger debounced search
    debouncedSearch(newValue);
  };

  const handleClear = () => {
    setInternalValue('');
    onChange?.('');
    onSearch?.('');
    setShowSuggestionsList(false);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e) => {
    if (!showSuggestionsList || suggestions.length === 0) {
      if (e.key === 'Enter') {
        e.preventDefault();
        onSearch?.(internalValue);
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0) {
          handleSuggestionSelect(suggestions[highlightedIndex]);
        } else {
          onSearch?.(internalValue);
        }
        break;
      
      case 'Escape':
        setShowSuggestionsList(false);
        setHighlightedIndex(-1);
        break;
      
      default:
        break;
    }
  };

  const handleSuggestionSelect = (suggestion) => {
    const selectedValue = typeof suggestion === 'string' ? suggestion : suggestion.value || suggestion.label;
    setInternalValue(selectedValue);
    onChange?.(selectedValue);
    onSuggestionSelect?.(suggestion);
    setShowSuggestionsList(false);
    setHighlightedIndex(-1);
  };

  const filteredSuggestions = suggestions.filter(suggestion => {
    const suggestionText = typeof suggestion === 'string' 
      ? suggestion 
      : suggestion.label || suggestion.value || '';
    return suggestionText.toLowerCase().includes(internalValue.toLowerCase());
  });

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        {/* Search Icon */}
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          {loading ? (
            <Loader2 className="h-4 w-4 text-gray-400 animate-spin" />
          ) : (
            <Search className="h-4 w-4 text-gray-400" />
          )}
        </div>

        {/* Input */}
        <input
          ref={inputRef}
          type="text"
          value={internalValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (suggestions.length > 0 && internalValue.trim()) {
              setShowSuggestionsList(true);
            }
          }}
          placeholder={placeholder}
          disabled={disabled}
          className={`
            block w-full pl-10 pr-10 border border-gray-300 rounded-md
            focus:ring-blue-500 focus:border-blue-500
            disabled:opacity-50 disabled:cursor-not-allowed
            ${sizeClasses[size]}
          `}
          {...props}
        />

        {/* Clear Button */}
        {clearable && internalValue && !loading && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            <button
              type="button"
              onClick={handleClear}
              className="text-gray-400 hover:text-gray-600 focus:outline-none"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      {/* Suggestions Dropdown */}
      {showSuggestions && showSuggestionsList && filteredSuggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto"
        >
          {filteredSuggestions.map((suggestion, index) => {
            const suggestionText = typeof suggestion === 'string' 
              ? suggestion 
              : suggestion.label || suggestion.value || '';
            
            return (
              <button
                key={index}
                type="button"
                onClick={() => handleSuggestionSelect(suggestion)}
                className={`
                  w-full text-left px-4 py-2 text-sm hover:bg-gray-100 focus:bg-gray-100 focus:outline-none
                  ${index === highlightedIndex ? 'bg-blue-50 text-blue-900' : 'text-gray-900'}
                `}
              >
                {suggestionText}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

// Quick search component with built-in styling
export const QuickSearch = ({ onSearch, ...props }) => (
  <SearchInput
    placeholder="Quick search..."
    size="sm"
    debounceMs={200}
    onSearch={onSearch}
    {...props}
  />
);

// Search with filters component
export const FilterableSearch = ({
  filters = [],
  activeFilter,
  onFilterChange,
  ...searchProps
}) => (
  <div className="flex space-x-2">
    {filters.length > 0 && (
      <select
        value={activeFilter}
        onChange={(e) => onFilterChange?.(e.target.value)}
        className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
      >
        {filters.map((filter) => (
          <option key={filter.value} value={filter.value}>
            {filter.label}
          </option>
        ))}
      </select>
    )}
    <div className="flex-1">
      <SearchInput {...searchProps} />
    </div>
  </div>
);

export default SearchInput;