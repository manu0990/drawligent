export type Tool = 'hand' | 'select' | 'rectangle' | 'diamond' | 'ellipse' | 'arrow' | 'line' | 'freedraw' | 'text' | 'image' | 'eraser';

export interface Point {
  x: number;
  y: number;
}

export interface Shape {
  id: string;
  type: 'rectangle' | 'diamond' | 'ellipse' | 'arrow' | 'line' | 'freedraw' | 'text' | 'image';
  x: number;
  y: number;
  width: number;
  height: number;
  points?: Point[];   // For freedraw
  endX?: number;      // For arrow
  endY?: number;      // For arrow
  text?: string;      // For text
  fontSize?: number;  // For text
  imageData?: string; // For image - base64 data URL
  imageWidth?: number; // Original image width
  imageHeight?: number; // Original image height
  selected?: boolean;
  strokeColor: string;
  fillColor: string;
  strokeWidth: number;
}

export interface WhiteboardState {
  shapes: Shape[];
  selectedShapeId: string | null;
  tool: Tool;
  isDrawing: boolean;
  dragStart: Point | null;
  currentShape: Shape | null;
  history: Shape[][];
  isEditingText: boolean;
  editingTextId: string | null;
  isLocked: boolean;
  panOffset: Point;
  isPanning: boolean;
}