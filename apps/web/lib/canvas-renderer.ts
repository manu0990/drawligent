import { Shape } from "@/types/whiteboard";

export function drawShape(ctx: CanvasRenderingContext2D, shape: Shape): void {
  ctx.strokeStyle = shape.strokeColor;
  ctx.fillStyle = shape.fillColor;
  ctx.lineWidth = shape.strokeWidth;

  if(shape.selected) {
    ctx.setLineDash([5, 5]);
    ctx.strokeStyle = "#FF6B6B";
  } else {
    ctx.setLineDash([]);
  }
  
}