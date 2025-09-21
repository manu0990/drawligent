"use client";

import { Point, Shape, Tool, WhiteboardState } from "@/types/whiteboard-types";
import { useCallback, useEffect, useState } from "react";

const initialState: WhiteboardState = {
  shapes: [],
  selectedShapeId: null,
  tool: 'select',
  isDrawing: false,
  dragStart: null,
  currentShape: null,
  history: [[]],
  isEditingText: false,
  editingTextId: null,
  isLocked: false,
  panOffset: { x: 0, y: 0 },
  isPanning: false,
};

export function useWhiteboard() {
  const [state, setState] = useState<WhiteboardState>(initialState);
  const [currentStrokeColor, setCurrentStrokeColor] = useState<string>('#3B82F6');
  const [currentFillColor, setCurrentFillColor] = useState<string>('#3B82F6');


  // load shapes from localStorage to canvas in mount
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const saved = localStorage.getItem('whiteboard-state');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const loadedShapes = parsed.shapes || [];
        setState(prev => ({
          ...prev,
          shapes: loadedShapes,
          history: [loadedShapes], // Initialize history with loaded shapes
        }));
      } catch (err) {
        console.log("Failed to load data from localStorage", err);
      }
    }
  }, []);

  // save shapes to localstorage after changes
  useEffect(() => {
    if (state.shapes.length > 0 || state.history.length > 1) {
      localStorage.setItem('whiteboard-state', JSON.stringify({
        shapes: state.shapes
      }))
    }
  }, [state.shapes, state.history]);

  const addToHistory = useCallback((shapes: Shape[]) => {
    setState(prev => {
      const newHistory = [...prev.history, [...shapes]];
      return {
        ...prev,
        history: newHistory.slice(-50), // Keep last 50 states
      };
    });
  }, []);

  const setTool = useCallback((tool: Tool) => {
    setState(prev => ({ ...prev, tool, selectedShapeId: null }));
  }, []);

  const startTextEditing = useCallback((shapeId: string) => {
    setState(prev => ({
      ...prev,
      isEditingText: true,
      editingTextId: shapeId,
      selectedShapeId: null,
      tool: 'select', // Switch to select tool during text editing
    }));
  }, []);

  const updateTextContent = useCallback((shapeId: string, newText: string) => {
    const newShapes = state.shapes.map(shape => {
      if (shape.id === shapeId) {
        // Calculate new dimensions based on text content
        const lines = newText.split('\n');
        const fontSize = shape.fontSize || 24;
        const lineHeight = fontSize * 1.2;

        // Estimate width (roughly 0.6 * fontSize per character for Caveat font)
        const maxLineLength = Math.max(...lines.map(line => line.length));
        const estimatedWidth = Math.max(maxLineLength * fontSize * 0.6, 100);

        // Calculate height based on number of lines
        const estimatedHeight = Math.max(lines.length * lineHeight, fontSize + 4);

        return {
          ...shape,
          text: newText,
          width: estimatedWidth,
          height: estimatedHeight
        };
      }
      return shape;
    });
    setState(prev => ({ ...prev, shapes: newShapes }));
    addToHistory(newShapes);
  }, [state.shapes, addToHistory]);

  const endTextEditing = useCallback(() => {
    setState(prev => ({
      ...prev,
      isEditingText: false,
      editingTextId: null,
    }));
  }, []);

  const startDrawing = useCallback((point: Point) => {
    if (state.tool === 'hand') {
      setState(prev => ({
        ...prev,
        isPanning: true,
        dragStart: point,
      }));

    } else if (state.tool == 'select') {
      // Adjust point for pan offset when detecting shapes
      const adjustedPoint = { x: point.x - state.panOffset.x, y: point.y - state.panOffset.y };
      const selectedShape = state.shapes
        .slice()
        .reverse()
        .find(shape => isPointInShape(adjustedPoint, shape));

      // If a text shape is clicked, start text editing
      if (selectedShape && selectedShape.type === 'text') {
        startTextEditing(selectedShape.id);
        return;
      }

      setState(prev => ({
        ...prev,
        selectedShapeId: selectedShape?.id || null,
        dragStart: selectedShape ? point : null,
      }));

    } else if (state.tool === 'eraser') {
      // Adjust point for pan offset when detecting shapes
      const adjustedPoint = { x: point.x - state.panOffset.x, y: point.y - state.panOffset.y };
      const selectedShape = state.shapes
        .slice()
        .reverse()
        .find(shape => isPointInShape(adjustedPoint, shape));

      if (selectedShape) {
        const newShapes = state.shapes.filter(s => s.id !== selectedShape.id);
        setState(prev => ({ ...prev, shapes: newShapes }));
        addToHistory(newShapes);
      }

    } else {
      // Adjust point for pan offset when creating new shapes
      const adjustedPoint = { x: point.x - state.panOffset.x, y: point.y - state.panOffset.y };
      const newShape: Shape = createShape(state.tool, adjustedPoint, currentStrokeColor, currentFillColor);
      setState(prev => ({
        ...prev,
        isDrawing: true,
        currentShape: newShape,
        dragStart: point,
      }));

      // If creating a text shape, immediately start editing it when drawing ends
      if (state.tool === 'text') {
        // We'll handle this in endDrawing
      }
    };
  }, [state.tool, state.shapes, state.panOffset.x, state.panOffset.y, addToHistory, currentStrokeColor, currentFillColor, startTextEditing])

  const updateDrawing = useCallback((point: Point) => {
    if (state.isPanning && state.dragStart) {
      const dx = point.x - state.dragStart.x;
      const dy = point.y - state.dragStart.y;

      setState(prev => ({
        ...prev,
        panOffset: {
          x: prev.panOffset.x + dx,
          y: prev.panOffset.y + dy,
        },
        dragStart: point,
      }));

    } else if (state.tool === 'select' && state.selectedShapeId && state.dragStart) {
      const dx = point.x - state.dragStart.x;
      const dy = point.y - state.dragStart.y;

      if (Math.abs(dx) > 1 || Math.abs(dy) > 1) {
        setState(prev => ({
          ...prev,
          shapes: prev.shapes.map(shape =>
            shape.id === prev.selectedShapeId
              ? {
                ...shape,
                x: shape.x + dx,
                y: shape.y + dy,
                endX: shape.endX ? shape.endX + dx : undefined,
                endY: shape.endY ? shape.endY + dy : undefined,
              }
              : shape
          ),
          dragStart: point
        }));
      }
    } else if (state.isDrawing && state.currentShape && state.dragStart) {
      // Adjust points for pan offset when updating shapes
      const adjustedStart = { x: state.dragStart.x - state.panOffset.x, y: state.dragStart.y - state.panOffset.y };
      const adjustedCurrent = { x: point.x - state.panOffset.x, y: point.y - state.panOffset.y };
      const updatedShape = updateShapeWithPoint(state.currentShape, adjustedStart, adjustedCurrent);
      setState(prev => ({ ...prev, currentShape: updatedShape }));
    }

  }, [state.tool, state.selectedShapeId, state.dragStart, state.currentShape, state.isDrawing, state.isPanning, state.panOffset.x, state.panOffset.y])

  const endDrawing = useCallback(() => {
    if (state.isPanning) {
      setState(prev => ({
        ...prev,
        isPanning: false,
        dragStart: null,
      }));

    } else if (state.isDrawing && state.currentShape) {
      const newShapes = [...state.shapes, state.currentShape];
      const isTextShape = state.currentShape.type === 'text';

      setState(prev => ({
        ...prev,
        shapes: newShapes,
        isDrawing: false,
        currentShape: null,
        dragStart: null,
        // Switch to select tool after drawing only if tool is not locked
        tool: prev.isLocked ? prev.tool : 'select',
      }));
      addToHistory(newShapes);

      // If we just created a text shape, immediately start editing it
      if (isTextShape) {
        setTimeout(() => {
          startTextEditing(state.currentShape!.id);
        }, 0);
      }
    } else if (state.tool === 'select' && state.selectedShapeId) {
      addToHistory(state.shapes);
      setState(prev => ({ ...prev, dragStart: null }));
    }
  }, [state.isDrawing, state.currentShape, state.shapes, state.tool, state.selectedShapeId, state.isPanning, addToHistory, startTextEditing]);

  const undo = useCallback(() => {
    if (state.history.length > 1) {
      setState(prev => {
        const newHistory = [...prev.history];
        newHistory.pop(); // Remove the current state
        const previousState = newHistory[newHistory.length - 1] || [];
        return {
          ...prev,
          shapes: [...previousState],
          history: newHistory,
          selectedShapeId: null,
        };
      });
    }
  }, [state.history.length]);

  const clearCanvas = useCallback(() => {
    setState(prev => ({
      ...prev,
      shapes: [],
      selectedShapeId: null,
    }));
    addToHistory([]);
  }, [addToHistory]);

  const setStrokeColor = useCallback((color: string) => {
    setCurrentStrokeColor(color);
  }, []);

  const setFillColor = useCallback((color: string) => {
    setCurrentFillColor(color);
  }, []);

  const toggleLock = useCallback(() => {
    setState(prev => ({ ...prev, isLocked: !prev.isLocked }));
  }, []);

  const insertImage = useCallback((file: File, position: Point) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const imageData = e.target?.result as string;
      const img = new Image();
      img.onload = () => {
        // Calculate scaled dimensions to fit within reasonable bounds
        const maxDimension = 300;
        let width = img.width;
        let height = img.height;
        
        if (width > maxDimension || height > maxDimension) {
          const ratio = Math.min(maxDimension / width, maxDimension / height);
          width = width * ratio;
          height = height * ratio;
        }

        const imageShape: Shape = {
          id: Math.random().toString(36),
          type: 'image',
          x: position.x - state.panOffset.x - width / 2, // Center on click position
          y: position.y - state.panOffset.y - height / 2,
          width,
          height,
          imageData,
          imageWidth: img.width,
          imageHeight: img.height,
          strokeColor: currentStrokeColor,
          fillColor: currentFillColor,
          strokeWidth: 2,
        };

        setState(prev => {
          const newShapes = [...prev.shapes, imageShape];
          const newHistory = [...prev.history, newShapes];
          return {
            ...prev,
            shapes: newShapes,
            history: newHistory.slice(-50),
            selectedShapeId: imageShape.id,
            tool: 'select', // Switch back to select tool after inserting image
          };
        });
      };
      img.src = imageData;
    };
    reader.readAsDataURL(file);
  }, [state.panOffset, currentStrokeColor, currentFillColor]);

  return {
    state,
    setTool,
    startDrawing,
    updateDrawing,
    endDrawing,
    undo,
    clearCanvas,
    strokeColor: currentStrokeColor,
    setStrokeColor,
    fillColor: currentFillColor,
    setFillColor,
    startTextEditing,
    endTextEditing,
    updateTextContent,
    toggleLock,
    insertImage
  }
}

function isPointInShape(mousePoint: Point, shape: Shape) {
  const cursor = { cx: mousePoint.x, cy: mousePoint.y, r: 5 }; // center = mouse pointer

  const circleOverlapsRect = (cx: number, cy: number, r: number, x: number, y: number, w: number, h: number) => {
    const nearestX = Math.max(x, Math.min(cx, x + w));
    const nearestY = Math.max(y, Math.min(cy, y + h));
    const dx = cx - nearestX;
    const dy = cy - nearestY;
    return dx * dx + dy * dy <= r * r;
  };

  const distanceFromPointToLine = (point: Point, lineStart: Point, lineEnd: Point) => {
    const A = point.x - lineStart.x;
    const B = point.y - lineStart.y;
    const C = lineEnd.x - lineStart.x;
    const D = lineEnd.y - lineStart.y;

    const dot = A * C + B * D;
    const lenSq = C * C + D * D;
    let param = -1;
    if (lenSq !== 0) param = dot / lenSq;

    let xx, yy;
    if (param < 0) {
      xx = lineStart.x;
      yy = lineStart.y;
    } else if (param > 1) {
      xx = lineEnd.x;
      yy = lineEnd.y;
    } else {
      xx = lineStart.x + param * C;
      yy = lineStart.y + param * D;
    }

    const dx = point.x - xx;
    const dy = point.y - yy;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const circleOverlapsLine = (cx: number, cy: number, r: number, start: Point, end: Point, strokeWidth: number) => {
    const dist = distanceFromPointToLine({ x: cx, y: cy }, start, end);
    return dist <= r + strokeWidth / 2;
  };

  switch (shape.type) {
    case 'rectangle':
    case 'diamond':
    case 'ellipse':
    case 'text':
    case 'image':
      return circleOverlapsRect(cursor.cx, cursor.cy, cursor.r, shape.x, shape.y, shape.width, shape.height);

    case 'line':
    case 'arrow':
      return circleOverlapsLine(
        cursor.cx,
        cursor.cy,
        cursor.r,
        { x: shape.x, y: shape.y },
        { x: shape.endX || shape.x, y: shape.endY || shape.y },
        shape.strokeWidth || 2
      );

    case 'freedraw':
      return shape.points?.some((p, i, arr) => {
        if (i === 0) return false;
        const prev = arr[i - 1];
        if (!prev) return false;
        return circleOverlapsLine(cursor.cx, cursor.cy, cursor.r, prev, p, shape.strokeWidth || 2);
      }) || false;

    default:
      return false;
  }
}

function createShape(tool: Tool, point: Point, strokeColor = "#3B82F6", fillColor = "transparent"): Shape {
  const baseShape: Shape = {
    id: Math.random().toString(36),
    type: 'rectangle',
    x: point.x,
    y: point.y,
    width: 0,
    height: 0,
    strokeColor,
    fillColor,
    strokeWidth: 2
  };

  switch (tool) {
    case 'rectangle':
      return { ...baseShape, type: 'rectangle' };
    case 'diamond':
      return { ...baseShape, type: 'diamond' };
    case 'ellipse':
      return { ...baseShape, type: 'ellipse' };
    case 'arrow':
      return { ...baseShape, type: 'arrow', endX: point.x, endY: point.y };
    case 'line':
      return { ...baseShape, type: 'line', endX: point.x, endY: point.y };
    case 'freedraw':
      return { ...baseShape, type: 'freedraw', points: [point] };
    case 'text':
      return { ...baseShape, type: 'text', text: '', fontSize: 24, width: 100, height: 28 };
    default:
      return { ...baseShape, type: 'rectangle' };
  };
}

function updateShapeWithPoint(shape: Shape, start: Point, current: Point): Shape {
  switch (shape.type) {
    // rectangle, diamond & ellipse both have the same bounding box so logic is same
    case 'rectangle':
    case 'diamond':
    case 'ellipse':
      return {
        ...shape,
        x: Math.min(start.x, current.x),
        y: Math.min(start.y, current.y),
        width: Math.abs(current.x - start.x),
        height: Math.abs(current.y - start.y),
      };
    // arrow & line both have same geometric appearence so logic is same
    case 'arrow':
    case 'line':
      return {
        ...shape,
        endX: current.x,
        endY: current.y,
      };
    case 'freedraw':
      return {
        ...shape,
        points: [...(shape.points || []), current],
      };
    case 'text':
      return shape; // Text doesn't change during drag
    default:
      return shape;
  }
}