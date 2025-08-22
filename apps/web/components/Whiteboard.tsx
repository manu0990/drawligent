"use client";

import { useWhiteboard } from "@/hooks/useWhiteboard";
import Canvas from "@/components/Canvas";
import Toolbar from "@/components/Toolbar";

export default function Whiteboard() {
  const { 
    state,
    setTool,
    startDrawing,
    updateDrawing,
    endDrawing,
    undo,
    clearCanvas,
    strokeColor,
    setStrokeColor,
    fillColor,
    setFillColor 
  } = useWhiteboard();

  return (
    <div>
      <Toolbar 
        currentTool={state.tool}
        onToolChange={setTool}
        currentStrokeColor={strokeColor}
        currentFillColor={fillColor}
        onStrokeColorChange={setStrokeColor}
        onFillColorChange={setFillColor}
        onUndo={undo}
        onClear={clearCanvas}
        canUndo={state.history.length > 0}
      />

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