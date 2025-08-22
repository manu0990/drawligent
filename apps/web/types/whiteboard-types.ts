export type Tool = 'select' | 'rectangle' | 'ellipse' | 'arrow' | 'line' | 'freedraw' | 'text' | 'delete';

export interface Point {
  x: number;
  y: number;
}

export interface Shape {
  id: string;
  type: 'rectangle' | 'ellipse' | 'arrow' | 'line' | 'freedraw' | 'text';
  x: number;
  y: number;
  width: number;
  height: number;
  points?: Point[];   // For freedraw
  endX?: number;      // For arrow
  endY?: number;      // For arrow
  text?: string;      // For text
  fontSize?: number;  // For text
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
}