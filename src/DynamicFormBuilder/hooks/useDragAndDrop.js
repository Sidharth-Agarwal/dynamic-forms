// hooks/useDragAndDrop.js
import { useState, useCallback, useRef, useEffect } from 'react';

/**
 * Hook for drag and drop functionality
 * @param {Object} options - Drag and drop configuration
 * @returns {Object} - Drag and drop state and handlers
 */
export const useDragAndDrop = (options = {}) => {
  const {
    onDrop = () => {},
    onDragStart = () => {},
    onDragEnd = () => {},
    onDragOver = () => {},
    disabled = false,
    dragDelay = 0
  } = options;

  const [isDragging, setIsDragging] = useState(false);
  const [draggedItem, setDraggedItem] = useState(null);
  const [dropTarget, setDropTarget] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const dragStartTimeout = useRef(null);
  const dragCounter = useRef(0);

  // Handle drag start
  const handleDragStart = useCallback((e, item, dragHandle = null) => {
    if (disabled) return;

    // If dragHandle is specified, check if the drag started from the handle
    if (dragHandle && !dragHandle.contains(e.target)) {
      e.preventDefault();
      return;
    }

    const startDrag = () => {
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', ''); // Required for Firefox
      
      setIsDragging(true);
      setDraggedItem(item);
      
      // Calculate offset from mouse to element
      const rect = e.currentTarget.getBoundingClientRect();
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });

      onDragStart(item, e);
    };

    if (dragDelay > 0) {
      dragStartTimeout.current = setTimeout(startDrag, dragDelay);
    } else {
      startDrag();
    }
  }, [disabled, dragDelay, onDragStart]);

  // Handle drag end
  const handleDragEnd = useCallback((e) => {
    if (dragStartTimeout.current) {
      clearTimeout(dragStartTimeout.current);
      dragStartTimeout.current = null;
    }

    setIsDragging(false);
    setDropTarget(null);
    dragCounter.current = 0;

    onDragEnd(draggedItem, e);
    setDraggedItem(null);
  }, [draggedItem, onDragEnd]);

  // Handle drag over
  const handleDragOver = useCallback((e) => {
    if (disabled || !isDragging) return;

    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    
    onDragOver(draggedItem, e);
  }, [disabled, isDragging, draggedItem, onDragOver]);

  // Handle drag enter
  const handleDragEnter = useCallback((e, targetId) => {
    if (disabled || !isDragging) return;

    e.preventDefault();
    dragCounter.current++;
    
    if (dragCounter.current === 1) {
      setDropTarget(targetId);
    }
  }, [disabled, isDragging]);

  // Handle drag leave
  const handleDragLeave = useCallback((e, targetId) => {
    if (disabled || !isDragging) return;

    e.preventDefault();
    dragCounter.current--;
    
    if (dragCounter.current === 0) {
      setDropTarget(null);
    }
  }, [disabled, isDragging]);

  // Handle drop
  const handleDrop = useCallback((e, targetId, targetIndex = null) => {
    if (disabled || !isDragging) return;

    e.preventDefault();
    setDropTarget(null);
    dragCounter.current = 0;

    if (draggedItem) {
      onDrop(draggedItem, targetId, targetIndex, e);
    }
  }, [disabled, isDragging, draggedItem, onDrop]);

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (dragStartTimeout.current) {
        clearTimeout(dragStartTimeout.current);
      }
    };
  }, []);

  return {
    isDragging,
    draggedItem,
    dropTarget,
    dragOffset,
    handlers: {
      onDragStart: handleDragStart,
      onDragEnd: handleDragEnd,
      onDragOver: handleDragOver,
      onDragEnter: handleDragEnter,
      onDragLeave: handleDragLeave,
      onDrop: handleDrop
    }
  };
};

/**
 * Hook for sortable list functionality
 * @param {Array} items - List of items
 * @param {Function} onReorder - Callback when items are reordered
 * @param {Object} options - Configuration options
 * @returns {Object} - Sortable state and handlers
 */
export const useSortableList = (items, onReorder, options = {}) => {
  const { disabled = false, axis = 'vertical' } = options;

  const [draggedIndex, setDraggedIndex] = useState(null);
  const [hoveredIndex, setHoveredIndex] = useState(null);

  const { isDragging, handlers } = useDragAndDrop({
    disabled,
    onDragStart: (item) => {
      const index = items.findIndex(i => i.id === item.id);
      setDraggedIndex(index);
    },
    onDragEnd: () => {
      setDraggedIndex(null);
      setHoveredIndex(null);
    },
    onDrop: (draggedItem, targetId, targetIndex) => {
      const fromIndex = items.findIndex(i => i.id === draggedItem.id);
      const toIndex = targetIndex !== null ? targetIndex : items.findIndex(i => i.id === targetId);
      
      if (fromIndex !== -1 && toIndex !== -1 && fromIndex !== toIndex) {
        onReorder(fromIndex, toIndex);
      }
    }
  });

  // Get drag handlers for list item
  const getItemProps = useCallback((item, index) => {
    return {
      draggable: !disabled,
      onDragStart: (e) => handlers.onDragStart(e, item),
      onDragEnd: handlers.onDragEnd,
      onDragOver: (e) => {
        handlers.onDragOver(e);
        
        // Calculate drop position based on mouse position
        const rect = e.currentTarget.getBoundingClientRect();
        const midpoint = axis === 'vertical' 
          ? rect.top + rect.height / 2
          : rect.left + rect.width / 2;
        const mousePos = axis === 'vertical' ? e.clientY : e.clientX;
        
        const dropIndex = mousePos < midpoint ? index : index + 1;
        setHoveredIndex(dropIndex);
      },
      onDragEnter: (e) => handlers.onDragEnter(e, item.id),
      onDragLeave: (e) => handlers.onDragLeave(e, item.id),
      onDrop: (e) => handlers.onDrop(e, item.id, hoveredIndex),
      className: `
        ${isDragging && draggedIndex === index ? 'opacity-50' : ''}
        ${hoveredIndex === index ? 'border-t-2 border-blue-500' : ''}
        ${hoveredIndex === index + 1 ? 'border-b-2 border-blue-500' : ''}
      `.trim()
    };
  }, [disabled, handlers, isDragging, draggedIndex, hoveredIndex, axis]);

  return {
    isDragging,
    draggedIndex,
    hoveredIndex,
    getItemProps
  };
};

/**
 * Hook for draggable field palette (form builder)
 * @param {Array} fieldTypes - Available field types
 * @param {Function} onFieldDrop - Callback when field is dropped
 * @param {Object} options - Configuration options
 * @returns {Object} - Field palette state and handlers
 */
export const useFieldPalette = (fieldTypes, onFieldDrop, options = {}) => {
  const { disabled = false } = options;

  const { isDragging, draggedItem, handlers } = useDragAndDrop({
    disabled,
    onDragStart: (fieldType) => {
      // Create a ghost element for better visual feedback
      const dragImage = document.createElement('div');
      dragImage.className = 'bg-blue-100 border-2 border-blue-300 rounded p-2 text-sm font-medium';
      dragImage.textContent = fieldType.label;
      dragImage.style.position = 'absolute';
      dragImage.style.top = '-1000px';
      document.body.appendChild(dragImage);
      
      // Clean up after drag
      setTimeout(() => {
        document.body.removeChild(dragImage);
      }, 0);
    },
    onDrop: (fieldType, targetId, insertIndex) => {
      onFieldDrop(fieldType, insertIndex);
    }
  });

  // Get drag handlers for field type
  const getFieldTypeProps = useCallback((fieldType) => {
    return {
      draggable: !disabled,
      onDragStart: (e) => {
        handlers.onDragStart(e, fieldType);
        
        // Set drag effect
        e.dataTransfer.effectAllowed = 'copy';
        e.dataTransfer.setData('application/json', JSON.stringify(fieldType));
      },
      onDragEnd: handlers.onDragEnd,
      className: `
        cursor-move transition-opacity
        ${isDragging && draggedItem?.type === fieldType.type ? 'opacity-50' : ''}
      `.trim()
    };
  }, [disabled, handlers, isDragging, draggedItem]);

  return {
    isDragging,
    draggedFieldType: draggedItem,
    getFieldTypeProps
  };
};

/**
 * Hook for drop zones (form builder canvas)
 * @param {Function} onDrop - Callback when item is dropped
 * @param {Object} options - Configuration options
 * @returns {Object} - Drop zone state and handlers
 */
export const useDropZone = (onDrop, options = {}) => {
  const { disabled = false, acceptTypes = [] } = options;

  const [isOver, setIsOver] = useState(false);
  const [canDrop, setCanDrop] = useState(false);
  const dragCounter = useRef(0);

  const handleDragEnter = useCallback((e) => {
    if (disabled) return;

    e.preventDefault();
    dragCounter.current++;

    if (dragCounter.current === 1) {
      setIsOver(true);
      
      // Check if dropped data is acceptable
      const types = e.dataTransfer.types;
      const isAcceptable = acceptTypes.length === 0 || 
        acceptTypes.some(type => types.includes(type));
      setCanDrop(isAcceptable);
    }
  }, [disabled, acceptTypes]);

  const handleDragLeave = useCallback((e) => {
    if (disabled) return;

    e.preventDefault();
    dragCounter.current--;

    if (dragCounter.current === 0) {
      setIsOver(false);
      setCanDrop(false);
    }
  }, [disabled]);

  const handleDragOver = useCallback((e) => {
    if (disabled) return;

    e.preventDefault();
    e.dataTransfer.dropEffect = canDrop ? 'copy' : 'none';
  }, [disabled, canDrop]);

  const handleDrop = useCallback((e) => {
    if (disabled || !canDrop) return;

    e.preventDefault();
    setIsOver(false);
    setCanDrop(false);
    dragCounter.current = 0;

    // Get dropped data
    let dropData = null;
    
    try {
      // Try to parse as JSON first (for our field types)
      const jsonData = e.dataTransfer.getData('application/json');
      if (jsonData) {
        dropData = JSON.parse(jsonData);
      }
    } catch {
      // Fallback to text data
      dropData = e.dataTransfer.getData('text/plain');
    }

    if (dropData) {
      // Calculate drop position
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      onDrop(dropData, { x, y }, e);
    }
  }, [disabled, canDrop, onDrop]);

  const dropZoneProps = {
    onDragEnter: handleDragEnter,
    onDragLeave: handleDragLeave,
    onDragOver: handleDragOver,
    onDrop: handleDrop,
    className: `
      transition-colors
      ${isOver && canDrop ? 'bg-blue-50 border-blue-300' : ''}
      ${isOver && !canDrop ? 'bg-red-50 border-red-300' : ''}
    `.trim()
  };

  return {
    isOver,
    canDrop,
    dropZoneProps
  };
};

export default useDragAndDrop;