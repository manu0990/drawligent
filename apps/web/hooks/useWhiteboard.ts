"use client";

import { Point, Shape, Tool, WhiteboardState } from "@/types/whiteboard-types";
import { randomUUID } from "crypto";
import { useCallback, useEffect, useState } from "react";

const initialState: WhiteboardState = {
  shapes: [],
  selectedShapeId: null,
  tool: 'select',
  isDrawing: false,
  dragStart: null,
  currentShape: null,
  history: [[]],
  historyIndex: 0,
};

export function useWhiteboard() {
  const [state, setState] = useState<WhiteboardState>(initialState);
  const [currentStrokeColor, setCurrentStrokeColor] = useState<string>('#3B82F6');
  const [currentFillColor, setCurrentFillColor] = useState<string>('#3B82F6');


  // load shapes from localStorage to canvas in mount
  useEffect(() => {
    const saved = localStorage.getItem('whiteboard-state');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setState(prev => ({
          ...prev,
          shapes: parsed.shapes || [],
          history: [],
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
        shape: state.shapes
      }))
    }
  }, [state.shapes, state.history]);

  const addToHistory = useCallback((shapes: Shape[]) => {
    setState(prev => {
      const newHistory = prev.history.slice(0, prev.historyIndex + 1);
      newHistory.push([...shapes]);
      return {
        ...prev,
        history: newHistory.slice(-50), // Keep last 50 states
        historyIndex: newHistory.length - 1,
      };
    });
  }, []);

  const setTool = useCallback((tool: Tool) => {
    setState(prev => ({ ...prev, tool, selectedShapeId: null }));
  }, []);

  const startDrawing = useCallback((point: Point) => {
    if (state.tool == 'select') {
      const selectedShape = state.shapes
        .slice()
        .reverse()
        .find(shape => isPointInShape(point, shape));

      setState(prev => ({
        ...prev,
        selectedShapeId: selectedShape?.id || null,
        dragStart: selectedShape ? point : null,
      }));

    } else if (state.tool === 'delete') {
      const selectedShape = state.shapes
        .slice()
        .reverse()
        .find(shape => isPointInShape(point, shape));

      if (selectedShape) {
        const newShapes = state.shapes.filter(s => s.id !== selectedShape.id);
        setState(prev => ({ ...prev, shapes: newShapes }));
        addToHistory(newShapes);
      }

    } else {
      const newShape: Shape = createShape(state.tool, point, currentStrokeColor, currentFillColor);
      setState(prev => ({
        ...prev,
        isDrawing: true,
        currentShape: newShape,
        dragStart: point,
      }));
    };
  }, [state.tool, state.shapes, addToHistory, currentStrokeColor, currentFillColor])

  const updateDrawing = useCallback((point: Point) => {
    if (state.tool === 'select' && state.selectedShapeId && state.dragStart) {
      const dx = point.x - state.dragStart.x;
      const dy = point.y - state.dragStart.y;

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
    } else if (state.isDrawing && state.currentShape && state.dragStart) {
      const updatedShape = updateShapeWithPoint(state.currentShape, state.dragStart, point);
      setState(prev => ({ ...prev, currentShape: updatedShape }));
    }

  }, [state.tool, state.selectedShapeId, state.dragStart, state.currentShape, state.isDrawing])

  const endDrawing = useCallback(() => {
    if (state.isDrawing && state.currentShape) {
      const newShapes = [...state.shapes, state.currentShape];
      setState(prev => ({
        ...prev,
        shapes: newShapes,
        isDrawing: false,
        currentShape: null,
        dragStart: null,
      }));
      addToHistory(newShapes);
    } else if (state.tool === 'select' && state.selectedShapeId) {
      addToHistory(state.shapes);
      setState(prev => ({ ...prev, dragStart: null }));
    }
  }, [state.isDrawing, state.currentShape, state.shapes, state.tool, state.selectedShapeId, addToHistory]);

  const undo = useCallback(() => {
    if (state.historyIndex > 0) {
      const newIndex = state.historyIndex - 1;
      setState(prev => ({
        ...prev,
        shapes: [...(prev.history[newIndex] || [])],
        historyIndex: newIndex,
        selectedShapeId: null,
      }));
    }
  }, [state.historyIndex]);

  const redo = useCallback(() => {
    if (state.historyIndex < state.history.length - 1) {
      const newIndex = state.historyIndex + 1;
      setState(prev => ({
        ...prev,
        shapes: [...(prev.history[newIndex] || [])],
        historyIndex: newIndex,
        selectedShapeId: null,
      }));
    }
  }, [state.historyIndex, state.history.length]);

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

  return {
    state,
    setTool,
    startDrawing,
    updateDrawing,
    endDrawing,
    undo,
    redo,
    clearCanvas,
    strokeColor: currentStrokeColor,
    setStrokeColor,
    fillColor: currentFillColor,
    setFillColor
  }
}

function isPointInShape(point: Point, shape: Shape) {
  switch (shape.type) {
    case 'rectangle':
      return point.x >= shape.x && point.x <= shape.x + shape.width &&
        point.y >= shape.y && point.y <= shape.y + shape.height;

    case 'ellipse': {
      const centerX = shape.x + shape.width / 2;
      const centerY = shape.y + shape.height / 2;
      const a = shape.width / 2;
      const b = shape.height / 2;
      return ((point.x - centerX) ** 2) / (a ** 2) + ((point.y - centerY) ** 2) / (b ** 2) <= 1;
    }

    case 'arrow':
    case 'line': {
      // Simple line distance check
      const dist = distanceFromPointToLine(point, { x: shape.x, y: shape.y }, { x: shape.endX || shape.x, y: shape.endY || shape.y });
      return dist < 10;
    }

    case 'freedraw':
      return shape.points?.some(p => Math.abs(p.x - point.x) < 5 && Math.abs(p.y - point.y) < 5) || false;

    case 'text':
      return point.x >= shape.x && point.x <= shape.x + shape.width &&
        point.y >= shape.y && point.y <= shape.y + shape.height;

    default:
      return false;
  }
}

function distanceFromPointToLine(point: Point, lineStart: Point, lineEnd: Point): number {
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
}

function createShape(tool: Tool, point: Point, strokeColor = "#3B82F6", fillColor = "transparent"): Shape {
  const baseShape: Shape = {
    id: randomUUID(),
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
    case 'ellipse':
      return { ...baseShape, type: 'ellipse' };
    case 'arrow':
      return { ...baseShape, type: 'arrow', endX: point.x, endY: point.y };
    case 'line':
      return { ...baseShape, type: 'line', endX: point.x, endY: point.y };
    case 'freedraw':
      return { ...baseShape, type: 'freedraw', points: [point] };
    case 'text':
      return { ...baseShape, type: 'text', text: '', fontSize: 16, width: 100, height: 20 };
    default:
      return { ...baseShape, type: 'rectangle' };
  };
}

function updateShapeWithPoint(shape: Shape, start: Point, current: Point): Shape {
  switch (shape.type) {
    // rectangle  & ellipse both have the same bounding box so logic is same
    case 'rectangle':
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