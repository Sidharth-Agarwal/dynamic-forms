import { useState, useCallback, useRef, useEffect } from 'react';
import { UI_CONSTANTS } from '../utils/constants.js';

/**
 * Hook for drag and drop functionality
 * Provides comprehensive drag and drop operations for form builder
 */
export const useDragDrop = (options = {}) => {
  const {
    onDragStart = null,
    onDragEnd = null,
    onDrop = null,
    enabledDropTypes = [],
    dragThreshold = 5,
    snapToGrid = false,
    gridSize = 10
  } = options;

  const [isDragging, setIsDragging] = useState(false);
  const [draggedItem, setDraggedItem] = useState(null);
  const [dropZone, setDropZone] = useState(null);
  const [dragPosition, setDragPosition] = useState({ x: 0, y: 0 });
  const [dropIndicator, setDropIndicator] = useState(null);

  const dragStartPos = useRef({ x: 0, y: 0 });
  const dragOffset = useRef({ x: 0, y: 0 });
  const hasMoved = useRef(false);

  // Create draggable element handlers
  const createDraggable = useCallback((item, type = UI_CONSTANTS.DRAG_TYPES.FIELD_TYPE) => {
    const handleMouseDown = (e) => {
      e.preventDefault();
      
      const rect = e.currentTarget.getBoundingClientRect();
      dragStartPos.current = { x: e.clientX, y: e.clientY };
      dragOffset.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
      hasMoved.current = false;

      const handleMouseMove = (moveEvent) => {
        const deltaX = Math.abs(moveEvent.clientX - dragStartPos.current.x);
        const deltaY = Math.abs(moveEvent.clientY - dragStartPos.current.y);

        // Check if moved beyond threshold
        if (!hasMoved.current && (deltaX > dragThreshold || deltaY > dragThreshold)) {
          hasMoved.current = true;
          setIsDragging(true);
          setDraggedItem({ ...item, type });
          onDragStart?.({ item, type, startPos: dragStartPos.current });
        }

        if (hasMoved.current) {
          let newX = moveEvent.clientX - dragOffset.current.x;
          let newY = moveEvent.clientY - dragOffset.current.y;

          // Snap to grid if enabled
          if (snapToGrid) {
            newX = Math.round(newX / gridSize) * gridSize;
            newY = Math.round(newY / gridSize) * gridSize;
          }

          setDragPosition({ x: newX, y: newY });
        }
      };

      const handleMouseUp = () => {
        if (hasMoved.current) {
          setIsDragging(false);
          setDraggedItem(null);
          setDropIndicator(null);
          onDragEnd?.({ item, type });
        }
        
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };

      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    };

    const handleTouchStart = (e) => {
      const touch = e.touches[0];
      const rect = e.currentTarget.getBoundingClientRect();
      
      dragStartPos.current = { x: touch.clientX, y: touch.clientY };
      dragOffset.current = {
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top
      };
      hasMoved.current = false;

      const handleTouchMove = (moveEvent) => {
        moveEvent.preventDefault();
        const touch = moveEvent.touches[0];
        const deltaX = Math.abs(touch.clientX - dragStartPos.current.x);
        const deltaY = Math.abs(touch.clientY - dragStartPos.current.y);

        if (!hasMoved.current && (deltaX > dragThreshold || deltaY > dragThreshold)) {
          hasMoved.current = true;
          setIsDragging(true);
          setDraggedItem({ ...item, type });
          onDragStart?.({ item, type, startPos: dragStartPos.current });
        }

        if (hasMoved.current) {
          let newX = touch.clientX - dragOffset.current.x;
          let newY = touch.clientY - dragOffset.current.y;

          if (snapToGrid) {
            newX = Math.round(newX / gridSize) * gridSize;
            newY = Math.round(newY / gridSize) * gridSize;
          }

          setDragPosition({ x: newX, y: newY });
        }
      };

      const handleTouchEnd = () => {
        if (hasMoved.current) {
          setIsDragging(false);
          setDraggedItem(null);
          setDropIndicator(null);
          onDragEnd?.({ item, type });
        }
        
        document.removeEventListener('touchmove', handleTouchMove);
        document.removeEventListener('touchend', handleTouchEnd);
      };

      document.addEventListener('touchmove', handleTouchMove, { passive: false });
      document.addEventListener('touchend', handleTouchEnd);
    };

    return {
      onMouseDown: handleMouseDown,
      onTouchStart: handleTouchStart,
      draggable: false, // Disable native drag
      style: {
        cursor: isDragging ? 'grabbing' : 'grab',
        userSelect: 'none',
        touchAction: 'none'
      }
    };
  }, [isDragging, dragThreshold, snapToGrid, gridSize, onDragStart, onDragEnd]);

  // Create drop zone handlers
  const createDropZone = useCallback((zoneId, acceptedTypes = [], onDropItem = null) => {
    const handleMouseEnter = () => {
      if (isDragging && draggedItem) {
        const isAccepted = acceptedTypes.length === 0 || 
                          acceptedTypes.includes(draggedItem.type);
        
        if (isAccepted) {
          setDropZone(zoneId);
        }
      }
    };

    const handleMouseLeave = () => {
      setDropZone(null);
    };

    const handleMouseUp = (e) => {
      if (isDragging && draggedItem && dropZone === zoneId) {
        const rect = e.currentTarget.getBoundingClientRect();
        const dropPosition = {
          x: e.clientX - rect.left,
          y: e.clientY - rect.top
        };

        const dropData = {
          item: draggedItem,
          zone: zoneId,
          position: dropPosition,
          event: e
        };

        // Call zone-specific drop handler
        onDropItem?.(dropData);
        
        // Call global drop handler
        onDrop?.(dropData);

        setDropZone(null);
      }
    };

    const handleTouchEnd = (e) => {
      if (isDragging && draggedItem) {
        // Get element at touch position
        const touch = e.changedTouches[0];
        const elementBelow = document.elementFromPoint(touch.clientX, touch.clientY);
        const dropZoneElement = elementBelow?.closest(`[data-drop-zone="${zoneId}"]`);
        
        if (dropZoneElement) {
          const rect = dropZoneElement.getBoundingClientRect();
          const dropPosition = {
            x: touch.clientX - rect.left,
            y: touch.clientY - rect.top
          };

          const dropData = {
            item: draggedItem,
            zone: zoneId,
            position: dropPosition,
            event: e
          };

          onDropItem?.(dropData);
          onDrop?.(dropData);
        }

        setDropZone(null);
      }
    };

    return {
      onMouseEnter: handleMouseEnter,
      onMouseLeave: handleMouseLeave,
      onMouseUp: handleMouseUp,
      onTouchEnd: handleTouchEnd,
      'data-drop-zone': zoneId,
      className: `drop-zone ${dropZone === zoneId ? 'drop-zone-active' : ''}`,
      style: {
        minHeight: '50px',
        position: 'relative'
      }
    };
  }, [isDragging, draggedItem, dropZone, onDrop]);

  // Create sortable list handlers
  const createSortable = useCallback((items, onReorder) => {
    const [draggedIndex, setDraggedIndex] = useState(null);
    const [hoveredIndex, setHoveredIndex] = useState(null);

    const createSortableItem = (item, index) => {
      const handleMouseDown = (e) => {
        e.preventDefault();
        setDraggedIndex(index);
        
        const startY = e.clientY;
        let currentIndex = index;

        const handleMouseMove = (moveEvent) => {
          const deltaY = moveEvent.clientY - startY;
          const itemHeight = 60; // Approximate item height
          const newIndex = Math.max(0, Math.min(items.length - 1, 
            index + Math.round(deltaY / itemHeight)));
          
          if (newIndex !== currentIndex) {
            setHoveredIndex(newIndex);
            currentIndex = newIndex;
          }
        };

        const handleMouseUp = () => {
          if (hoveredIndex !== null && hoveredIndex !== index) {
            onReorder?.(index, hoveredIndex);
          }
          
          setDraggedIndex(null);
          setHoveredIndex(null);
          
          document.removeEventListener('mousemove', handleMouseMove);
          document.removeEventListener('mouseup', handleMouseUp);
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
      };

      return {
        onMouseDown: handleMouseDown,
        'data-sortable-index': index,
        className: `sortable-item ${draggedIndex === index ? 'dragging' : ''} ${hoveredIndex === index ? 'drop-target' : ''}`,
        style: {
          cursor: 'grab',
          userSelect: 'none',
          opacity: draggedIndex === index ? 0.5 : 1,
          transform: draggedIndex === index ? 'scale(1.02)' : 'scale(1)',
          transition: draggedIndex === index ? 'none' : 'all 0.2s ease'
        }
      };
    };

    return { createSortableItem, draggedIndex, hoveredIndex };
  }, []);

  // Get drop indicator position
  const getDropIndicator = useCallback((e, containerRef, items = []) => {
    if (!containerRef.current || !isDragging) return null;

    const container = containerRef.current;
    const rect = container.getBoundingClientRect();
    const y = e.clientY - rect.top;
    
    // Find insertion point
    let insertIndex = items.length;
    const itemElements = container.querySelectorAll('[data-field-item]');
    
    for (let i = 0; i < itemElements.length; i++) {
      const itemRect = itemElements[i].getBoundingClientRect();
      const itemY = itemRect.top - rect.top + itemRect.height / 2;
      
      if (y < itemY) {
        insertIndex = i;
        break;
      }
    }

    return {
      index: insertIndex,
      position: y,
      show: true
    };
  }, [isDragging]);

  // Handle field reordering
  const handleFieldReorder = useCallback((fromIndex, toIndex, onReorder) => {
    if (fromIndex !== toIndex && onReorder) {
      onReorder(fromIndex, toIndex);
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isDragging) {
        setIsDragging(false);
        setDraggedItem(null);
        setDropZone(null);
        setDropIndicator(null);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isDragging]);

  return {
    // State
    isDragging,
    draggedItem,
    dropZone,
    dragPosition,
    dropIndicator,

    // Creators
    createDraggable,
    createDropZone,
    createSortable,

    // Utilities
    getDropIndicator,
    handleFieldReorder,

    // Manual control
    startDrag: (item, type) => {
      setIsDragging(true);
      setDraggedItem({ ...item, type });
    },
    
    endDrag: () => {
      setIsDragging(false);
      setDraggedItem(null);
      setDropZone(null);
      setDropIndicator(null);
    },

    setDropIndicator
  };
};

/**
 * Hook for keyboard navigation support in drag and drop
 * Provides accessibility features for drag and drop operations
 */
export const useDragDropKeyboard = (items = [], onReorder = null) => {
  const [focusedIndex, setFocusedIndex] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState(null);

  const handleKeyDown = useCallback((e, index) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        if (selectedIndex !== null) {
          // Move selected item down
          if (selectedIndex < items.length - 1) {
            onReorder?.(selectedIndex, selectedIndex + 1);
            setSelectedIndex(selectedIndex + 1);
          }
        } else {
          // Move focus down
          setFocusedIndex(Math.min(items.length - 1, focusedIndex + 1));
        }
        break;

      case 'ArrowUp':
        e.preventDefault();
        if (selectedIndex !== null) {
          // Move selected item up
          if (selectedIndex > 0) {
            onReorder?.(selectedIndex, selectedIndex - 1);
            setSelectedIndex(selectedIndex - 1);
          }
        } else {
          // Move focus up
          setFocusedIndex(Math.max(0, focusedIndex - 1));
        }
        break;

      case ' ':
      case 'Enter':
        e.preventDefault();
        if (selectedIndex === index) {
          // Deselect
          setSelectedIndex(null);
        } else {
          // Select for moving
          setSelectedIndex(index);
          setFocusedIndex(index);
        }
        break;

      case 'Escape':
        e.preventDefault();
        setSelectedIndex(null);
        break;

      default:
        break;
    }
  }, [items.length, focusedIndex, selectedIndex, onReorder]);

  const getItemProps = useCallback((index) => ({
    tabIndex: focusedIndex === index ? 0 : -1,
    role: 'button',
    'aria-pressed': selectedIndex === index,
    'aria-label': `${selectedIndex === index ? 'Selected item' : 'Item'} ${index + 1} of ${items.length}. Press space to ${selectedIndex === index ? 'deselect' : 'select'}, arrow keys to ${selectedIndex === index ? 'move' : 'navigate'}.`,
    onKeyDown: (e) => handleKeyDown(e, index),
    onFocus: () => setFocusedIndex(index),
    className: `keyboard-navigable ${focusedIndex === index ? 'focused' : ''} ${selectedIndex === index ? 'selected' : ''}`
  }), [focusedIndex, selectedIndex, items.length, handleKeyDown]);

  return {
    focusedIndex,
    selectedIndex,
    getItemProps,
    setFocusedIndex,
    clearSelection: () => setSelectedIndex(null)
  };
};

/**
 * Hook for touch-friendly drag and drop
 * Optimized for mobile devices with touch gestures
 */
export const useTouchDragDrop = (options = {}) => {
  const {
    longPressDelay = 500,
    vibrationFeedback = true,
    onLongPressStart = null
  } = options;

  const [isLongPressing, setIsLongPressing] = useState(false);
  const [touchStartTime, setTouchStartTime] = useState(null);
  const longPressTimer = useRef(null);
  const touchStartPos = useRef({ x: 0, y: 0 });

  const handleTouchStart = useCallback((e, item, onDragStart) => {
    const touch = e.touches[0];
    setTouchStartTime(Date.now());
    touchStartPos.current = { x: touch.clientX, y: touch.clientY };

    // Start long press timer
    longPressTimer.current = setTimeout(() => {
      setIsLongPressing(true);
      
      // Haptic feedback
      if (vibrationFeedback && navigator.vibrate) {
        navigator.vibrate(50);
      }

      onLongPressStart?.(item);
      onDragStart?.(item);
    }, longPressDelay);
  }, [longPressDelay, vibrationFeedback, onLongPressStart]);

  const handleTouchMove = useCallback((e) => {
    if (!touchStartTime) return;

    const touch = e.touches[0];
    const deltaX = Math.abs(touch.clientX - touchStartPos.current.x);
    const deltaY = Math.abs(touch.clientY - touchStartPos.current.y);

    // Cancel long press if moved too much
    if (deltaX > 10 || deltaY > 10) {
      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current);
        longPressTimer.current = null;
      }
    }
  }, [touchStartTime]);

  const handleTouchEnd = useCallback(() => {
    setIsLongPressing(false);
    setTouchStartTime(null);
    
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  }, []);

  const createTouchDraggable = useCallback((item, onDragStart) => ({
    onTouchStart: (e) => handleTouchStart(e, item, onDragStart),
    onTouchMove: handleTouchMove,
    onTouchEnd: handleTouchEnd,
    style: {
      touchAction: 'none',
      userSelect: 'none'
    }
  }), [handleTouchStart, handleTouchMove, handleTouchEnd]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current);
      }
    };
  }, []);

  return {
    isLongPressing,
    createTouchDraggable
  };
};

/**
 * Hook for drag and drop analytics
 * Tracks usage patterns and performance metrics
 */
export const useDragDropAnalytics = () => {
  const [analytics, setAnalytics] = useState({
    totalDrags: 0,
    successfulDrops: 0,
    cancelledDrags: 0,
    averageDragDuration: 0,
    mostUsedFieldType: null,
    heatmapData: []
  });

  const dragStartTimes = useRef(new Map());
  const fieldTypeUsage = useRef(new Map());
  const dropPositions = useRef([]);

  const trackDragStart = useCallback((item) => {
    dragStartTimes.current.set(item.id, Date.now());
    setAnalytics(prev => ({ ...prev, totalDrags: prev.totalDrags + 1 }));
  }, []);

  const trackDragEnd = useCallback((item, wasSuccessful = false) => {
    const startTime = dragStartTimes.current.get(item.id);
    if (startTime) {
      const duration = Date.now() - startTime;
      dragStartTimes.current.delete(item.id);

      setAnalytics(prev => {
        const newAnalytics = { ...prev };
        
        if (wasSuccessful) {
          newAnalytics.successfulDrops++;
          
          // Track field type usage
          const currentUsage = fieldTypeUsage.current.get(item.type) || 0;
          fieldTypeUsage.current.set(item.type, currentUsage + 1);
          
          // Find most used field type
          let mostUsed = null;
          let maxUsage = 0;
          for (const [type, usage] of fieldTypeUsage.current) {
            if (usage > maxUsage) {
              maxUsage = usage;
              mostUsed = type;
            }
          }
          newAnalytics.mostUsedFieldType = mostUsed;
        } else {
          newAnalytics.cancelledDrags++;
        }

        // Update average duration
        const totalDurations = Array.from(dragStartTimes.current.values())
          .map(start => Date.now() - start)
          .concat([duration]);
        
        newAnalytics.averageDragDuration = 
          totalDurations.reduce((sum, d) => sum + d, 0) / totalDurations.length;

        return newAnalytics;
      });
    }
  }, []);

  const trackDropPosition = useCallback((position) => {
    dropPositions.current.push(position);
    
    // Keep only last 100 positions for heatmap
    if (dropPositions.current.length > 100) {
      dropPositions.current = dropPositions.current.slice(-100);
    }

    setAnalytics(prev => ({
      ...prev,
      heatmapData: [...dropPositions.current]
    }));
  }, []);

  const resetAnalytics = useCallback(() => {
    dragStartTimes.current.clear();
    fieldTypeUsage.current.clear();
    dropPositions.current = [];
    
    setAnalytics({
      totalDrags: 0,
      successfulDrops: 0,
      cancelledDrags: 0,
      averageDragDuration: 0,
      mostUsedFieldType: null,
      heatmapData: []
    });
  }, []);

  return {
    analytics,
    trackDragStart,
    trackDragEnd,
    trackDropPosition,
    resetAnalytics
  };
};

export default {
  useDragDrop,
  useDragDropKeyboard,
  useTouchDragDrop,
  useDragDropAnalytics
};