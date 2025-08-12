import { Point, Shape } from "@/types/whiteboard";
import { useCallback, useEffect, useRef } from "react";

interface CanvasProps {
  shapes: Shape[];
  currentShape: Shape | null;
  selectedShapeId: string | null;
  editingTextId: string | null;
  currentTool: string;
  onMouseDown: (point: Point) => void;
  onMouseMove: (point: Point) => void;
  onMouseUp: () => void;
  onExportPNG: (canvas: HTMLCanvasElement) => void;
  onUpdateText: (id: string, text: string) => void;
  onFinishTextEditing: () => void;
}

export default function Canvas({
  shapes,
  currentShape,
  selectedShapeId,
  editingTextId,
  currentTool,
  onMouseDown,
  onMouseMove,
  onMouseUp,
  onExportPNG,
  onUpdateText,
  onFinishTextEditing
}: CanvasProps) {

  const canvasRef = useRef<HTMLCanvasElement>(null);

  const getCanvasPoint = useCallback((e: MouseEvent | TouchEvent): Point => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0]?.clientX || 0 : e.clientX;
    const clientY = 'touches' in e ? e.touches[0]?.clientY || 0 : e.clientY;

    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    }
  }, []);

  const handlePointerDown = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    const point = getCanvasPoint(e.nativeEvent);
    onMouseDown(point);
  }, [getCanvasPoint, onMouseDown]);

  const handlePointerMove = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    const point = getCanvasPoint(e.nativeEvent);
    onMouseMove(point);
  }, [getCanvasPoint, onMouseMove]);

  const handlePointerUp = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    onMouseUp();
  }, [onMouseUp]);

  // draw shapes
  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');
    if(!canvas || !context) return;

    // clearCanvas(canvas);
  }, [])


  return (
    <div className="flex-1 relative overflow-hidden">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 touch-none"
        onMouseDown={handlePointerDown}
        onMouseMove={handlePointerMove}
        onMouseUp={handlePointerUp}
        onTouchStart={handlePointerDown}
        onTouchMove={handlePointerMove}
        onTouchEnd={handlePointerUp}
      />
    </div>
  )
}
