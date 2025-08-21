"use client";

import Canvas from "@/components/Canvas";
import { useWhiteboard } from "@/hooks/useWhiteboard";

export default function Whiteboard() {
  const { 
    state,
    setTool,
    startDrawing,
    updateDrawing,
    endDrawing,
    undo,
    redo,
    clearCanvas,
    strokeColor,
    setStrokeColor,
    fillColor,
    setFillColor 
  } = useWhiteboard();

  return (
    <div>
      <Canvas
        shapes={state.shapes}
        currentShape={state.currentShape}
        selectedShapeId={state.selectedShapeId}
        currentTool={state.tool}
        onMouseDown={startDrawing}
        onMouseMove={updateDrawing}
        onMouseUp={endDrawing}
      />
    </div>
  )
}