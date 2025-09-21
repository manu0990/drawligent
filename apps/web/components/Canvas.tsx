"use client";

import { clearCanvas, drawShape } from "@/lib/canvas-renderer";
import { cn } from "@repo/ui/lib/utils";
import { Point, Shape } from "@/types/whiteboard-types";
import { useCallback, useEffect, useRef } from "react";
import TextEditor from "@/components/TextEditor";

interface CanvasProps {
  shapes: Shape[];
  currentShape: Shape | null;
  selectedShapeId: string | null;
  currentTool: string;
  isEditingText: boolean;
  editingTextId: string | null;
  panOffset: Point;
  onMouseDown: (point: Point) => void;
  onMouseMove: (point: Point) => void;
  onMouseUp: () => void;
  onTextUpdate: (shapeId: string, text: string) => void;
  onFinishTextEditing: () => void;
}

export default function Canvas({
  shapes,
  currentShape,
  selectedShapeId,
  currentTool,
  isEditingText,
  editingTextId,
  panOffset,
  onMouseDown,
  onMouseMove,
  onMouseUp,
  onTextUpdate,
  onFinishTextEditing
}: CanvasProps) {

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const tool = currentTool;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const parent = canvas.parentElement;
    if (!parent) return;
    canvas.width = parent.clientWidth;
    canvas.height = parent.clientHeight;
  }, []);

  const getCanvasPoint = useCallback((e: React.PointerEvent<HTMLCanvasElement>): Point => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  }, []);

  const handlePointerDown = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const point = getCanvasPoint(e);
    onMouseDown(point);
  }, [getCanvasPoint, onMouseDown]);

  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const point = getCanvasPoint(e);
    onMouseMove(point);
  }, [getCanvasPoint, onMouseMove]);

  const handlePointerUp = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    onMouseUp();
  }, [onMouseUp]);

  // draw shapes
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    clearCanvas(canvas);

    // Apply pan transformation
    ctx.save();
    ctx.translate(panOffset.x, panOffset.y);

    // Draw all completed shapes
    shapes.forEach(shape => {
      const shapeWithSelection = {
        ...shape,
        selected: shape.id === selectedShapeId,
      };
      // Pass isEditingText flag to skip rendering text being edited
      const isEditingThisText = isEditingText && shape.id === editingTextId;
      drawShape(ctx, shapeWithSelection, isEditingThisText);
    });

    // Draw current shape being drawn
    if (currentShape) {
      drawShape(ctx, currentShape);
    }

    ctx.restore();
  }, [shapes, currentShape, selectedShapeId, isEditingText, editingTextId, panOffset]);

  // Get the text shape currently being edited
  const editingTextShape = isEditingText && editingTextId 
    ? shapes.find(shape => shape.id === editingTextId)
    : null;

  return (
    <div className="flex-1 relative overflow-hidden h-screen bg-background">
      <canvas
        ref={canvasRef}
        className={cn(
          "absolute inset-0 touch-none h-full w-full",
          tool === 'hand' ? "cursor-grab" :
          tool === 'text' ? "cursor-text" : 
          tool === 'eraser' ? "cursor-eraser" : "cursor-crosshair"
        )}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      />
      
      {/* Text Editor Overlay */}
      {editingTextShape && (
        <TextEditor
          shape={editingTextShape}
          onTextUpdate={(text) => onTextUpdate(editingTextShape.id, text)}
          onFinishEditing={onFinishTextEditing}
        />
      )}
    </div>
  )
}
