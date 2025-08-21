import { Shape } from "@/types/whiteboard-types";

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
  
  switch(shape.type) {
    case 'rectangle':
      if(shape.fillColor !== 'transparent') {
        ctx.fillRect(shape.x, shape.y, shape.width, shape.height);
      }
      ctx.strokeRect(shape.x, shape.y, shape.width, shape.height);
      break;

    case 'ellipse':
      ctx.beginPath();
      ctx.ellipse(
        (shape.x + shape.y) / 2,          // ellipse's center x-axis
        (shape.y + shape.height) / 2,     // ellipse's center y-axis
        shape.width / 2,                  // ellipse's major-axis radius
        shape.height / 2,                 // ellipse's minor-axis radius
        0,                                // rotation of the ellipse
        0,                                // at which the ellipse starts
        2 * Math.PI                       // at which the ellipse ends
      );
      if (shape.fillColor !== 'transparent') {
        ctx.fill();
      }
      ctx.stroke();
      break;

    case 'arrow': {
      const endX = shape.endX || shape.x;
      const endY = shape.endY || shape.y;
      
      // Draw line
      ctx.beginPath();
      ctx.moveTo(shape.x, shape.y);
      ctx.lineTo(endX, endY);
      ctx.stroke();

      // Draw arrowhead
      const angle = Math.atan2(endY - shape.y, endX - shape.x);
      const arrowLength = 15;
      const arrowAngle = Math.PI / 6;

      ctx.beginPath();
      ctx.moveTo(endX, endY);
      ctx.lineTo(
        endX - arrowLength * Math.cos(angle - arrowAngle),
        endY - arrowLength * Math.sin(angle - arrowAngle)
      );
      ctx.moveTo(endX, endY);
      ctx.lineTo(
        endX - arrowLength * Math.cos(angle + arrowAngle),
        endY - arrowLength * Math.sin(angle + arrowAngle)
      );
      ctx.stroke();
      break;
    }

    case 'line': {
      if (shape.points && shape.points.length > 1) {
        const firstPoint = shape.points[0];
        if (firstPoint) {
          ctx.beginPath();
          ctx.moveTo(firstPoint.x, firstPoint.y);
          for (let i = 1; i < shape.points.length; i++) {
            const point = shape.points[i];
            if (point) {
              ctx.lineTo(point.x, point.y);
            }
          }
          
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';
          ctx.stroke();
        }
      }
      break;
    }

    case 'text':
      if (shape.text) {
        const fontSize = shape.fontSize || 16;
        ctx.font = `${fontSize}px Arial`;
        ctx.textBaseline = 'top';
        
        // If fillColor is not transparent, fill the text
        if (shape.fillColor !== 'transparent') {
          ctx.fillStyle = shape.fillColor;
          ctx.fillText(shape.text, shape.x, shape.y);
        }
        
        // Always stroke the text with stroke color
        ctx.strokeStyle = shape.strokeColor;
        ctx.lineWidth = shape.strokeWidth || 1;
        ctx.strokeText(shape.text, shape.x, shape.y);
      }
      break;
  }

  ctx.setLineDash([]);
}

export function clearCanvas(canvas: HTMLCanvasElement): void {
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
}