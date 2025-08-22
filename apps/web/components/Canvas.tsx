"use client";

import { clearCanvas, drawShape } from "@/lib/canvas-renderer";
import { cn } from "@repo/ui/lib/utils";
import { Point, Shape } from "@/types/whiteboard-types";
import { useCallback, useEffect, useRef } from "react";

interface CanvasProps {
  shapes: Shape[];
  currentShape: Shape | null;
  selectedShapeId: string | null;
  currentTool: string;
  onMouseDown: (point: Point) => void;
  onMouseMove: (point: Point) => void;
  onMouseUp: () => void;
}

export default function Canvas({
  shapes,
  currentShape,
  selectedShapeId,
  currentTool,
  onMouseDown,
  onMouseMove,
  onMouseUp
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

    // Draw all completed shapes
    shapes.forEach(shape => {
      const shapeWithSelection = {
        ...shape,
        selected: shape.id === selectedShapeId,
      };
      drawShape(ctx, shapeWithSelection);
    });

    // Draw current shape being drawn
    if (currentShape) {
      drawShape(ctx, currentShape);
    }
  }, [shapes, currentShape, selectedShapeId]);

  return (
    <div className="flex-1 relative overflow-hidden">
      <canvas
        ref={canvasRef}
        className={cn(
          "absolute inset-0 touch-none",
          `${tool == 'text' ? "cursor-text" : "cursor-crosshair"}`
        )}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      />
    </div>
  )
}
