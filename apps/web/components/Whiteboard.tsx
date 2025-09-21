"use client";

import { useWhiteboard } from "@/hooks/useWhiteboard";
import Canvas from "@/components/Canvas";
import Toolbar from "@/components/Toolbar";
import { useEffect, useRef } from "react";

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
    setFillColor,
    endTextEditing,
    updateTextContent,
    toggleLock,
    insertImage
  } = useWhiteboard();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      // Insert image at center of current view
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      insertImage(file, { x: centerX, y: centerY });
    }
    // Reset file input
    if (e.target) {
      e.target.value = '';
    }
  };

  const handleImageToolClick = () => {
    fileInputRef.current?.click();
  };

  // Add keyboard event listener for shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (state.isEditingText) return; // Don't handle shortcuts when editing text

      if (e.key.toLowerCase() === 'q') {
        e.preventDefault();
        toggleLock();
      } else if (e.key.toLowerCase() === 'h') {
        e.preventDefault();
        setTool('hand');
      } else if (e.key.toLowerCase() === 'i' || e.key === '9') {
        e.preventDefault();
        setTool('image');
        handleImageToolClick();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleLock, setTool, state.isEditingText, insertImage]);

  return (
    <div>
      {/* Hidden file input for image uploads */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        style={{ display: 'none' }}
      />
      
      <Toolbar 
        currentTool={state.tool}
        onToolChange={(tool) => {
          setTool(tool);
          if (tool === 'image') {
            handleImageToolClick();
          }
        }}
        currentStrokeColor={strokeColor}
        currentFillColor={fillColor}
        onStrokeColorChange={setStrokeColor}
        onFillColorChange={setFillColor}
        onUndo={undo}
        onClear={clearCanvas}
        canUndo={state.history.length > 0}
        isLocked={state.isLocked}
        onToggleLock={toggleLock}
      />

      <Canvas
        shapes={state.shapes}
        currentShape={state.currentShape}
        selectedShapeId={state.selectedShapeId}
        currentTool={state.tool}
        isEditingText={state.isEditingText}
        editingTextId={state.editingTextId}
        panOffset={state.panOffset}
        onMouseDown={startDrawing}
        onMouseMove={updateDrawing}
        onMouseUp={endDrawing}
        onTextUpdate={updateTextContent}
        onFinishTextEditing={endTextEditing}
      />
    </div>
  )
}