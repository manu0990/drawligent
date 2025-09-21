import { Shape } from "@/types/whiteboard-types";

export function drawShape(ctx: CanvasRenderingContext2D, shape: Shape, isEditingText?: boolean): void {
  // Skip rendering text shapes that are currently being edited
  if (shape.type === 'text' && isEditingText) {
    return;
  }

  ctx.strokeStyle = shape.strokeColor;
  ctx.fillStyle = shape.fillColor;
  ctx.lineWidth = shape.strokeWidth;

  if (shape.selected) {
    ctx.setLineDash([5, 5]);
    ctx.strokeStyle = "#FF6B6B";
  } else {
    ctx.setLineDash([]);
  }

  switch (shape.type) {
    case 'rectangle': {
      if (shape.fillColor !== 'transparent') {
        ctx.fillRect(shape.x, shape.y, shape.width, shape.height);
      }
      ctx.strokeRect(shape.x, shape.y, shape.width, shape.height);
      break;
    }

    case 'diamond': {
      const centerX = shape.x + shape.width / 2;
      const centerY = shape.y + shape.height / 2;

      ctx.beginPath();
      ctx.moveTo(centerX, shape.y);                 // top point
      ctx.lineTo(shape.x + shape.width, centerY);   // right point
      ctx.lineTo(centerX, shape.y + shape.height);  // bottom point
      ctx.lineTo(shape.x, centerY);                 // left point
      ctx.closePath();

      if (shape.fillColor !== 'transparent') {
        ctx.fill();
      }
      ctx.stroke();
      break;
    }

    case 'ellipse': {
      ctx.beginPath();
      ctx.ellipse(
        shape.x + shape.width / 2,        // ellipse's center x-axis
        shape.y + shape.height / 2,       // ellipse's center y-axis
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
    }

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
      const endX = shape.endX || shape.x;
      const endY = shape.endY || shape.y;

      ctx.beginPath();
      ctx.moveTo(shape.x, shape.y);
      ctx.lineTo(endX, endY);
      ctx.stroke();
      break;
    }

    case 'freedraw': {
      if (shape.points && shape.points.length > 1 && shape.points[0]) {
        ctx.beginPath();
        ctx.moveTo(shape.points[0].x, shape.points[0].y);
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
      break;
    }

    case 'text': {
      if (shape.text) {
        const fontSize = shape.fontSize || 24;
        ctx.font = `100 ${fontSize}px Caveat`;
        ctx.textBaseline = 'middle';
        const lineHeight = fontSize * 1.2;

        // Split text into lines to handle multi-line text
        const lines = shape.text.split('\n');
        
        lines.forEach((line, index) => {
          const yPosition = shape.y + (index * lineHeight);
          
          // If fillColor is not transparent, fill the text
          if (shape.fillColor !== 'transparent') {
            ctx.fillStyle = shape.fillColor;
            ctx.fillText(line, shape.x, yPosition);
          } else {
            // If no fill color, use stroke color as fill for lighter appearance
            ctx.fillStyle = shape.strokeColor;
            ctx.fillText(line, shape.x, yPosition);
          }

          // Only add a very light stroke if explicitly needed
          if (shape.strokeWidth && shape.strokeWidth > 0.5) {
            ctx.strokeStyle = shape.strokeColor;
            ctx.lineWidth = Math.min(shape.strokeWidth * 0.3, 0.5);
            ctx.strokeText(line, shape.x, yPosition);
          }
        });
      }
      break;
    }

    case 'image': {
      if (shape.imageData) {
        const img = new Image();
        img.onload = () => {
          ctx.drawImage(img, shape.x, shape.y, shape.width, shape.height);
          
          // Draw selection outline if selected
          if (shape.selected) {
            ctx.strokeRect(shape.x, shape.y, shape.width, shape.height);
          }
        };
        img.src = shape.imageData;
      }
      break;
    }
  }

  ctx.setLineDash([]);
}

export function clearCanvas(canvas: HTMLCanvasElement): void {
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
}