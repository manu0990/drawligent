import { ForwardRefExoticComponent, RefAttributes } from "react";
import { Tool } from "@/types/whiteboard-types";
import { ArrowRight, Circle, Eraser, LucideProps, Minus, MousePointer, Pencil, Square, Trash, TypeIcon, Undo2 } from "lucide-react";
import { ColorPicker } from "@/components/ColorPicker";
import { cn } from "@repo/ui/lib/utils";

interface ToolbarProps {
  currentTool: Tool;
  onToolChange: (tool: Tool) => void;
  currentStrokeColor: string;
  currentFillColor: string;
  onStrokeColorChange: (color: string) => void;
  onFillColorChange: (color: string) => void;
  onUndo: () => void;
  onClear: () => void;
  canUndo: boolean;
}

type toolsetTypes = {
  id: Tool;
  icon: ForwardRefExoticComponent<Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>>;
  label: string;
}

export default function Toolbar({
  currentTool,
  onToolChange,
  currentStrokeColor,
  currentFillColor,
  onStrokeColorChange,
  onFillColorChange,
  onUndo,
  onClear,
  canUndo,
}: ToolbarProps) {
  const tools: toolsetTypes[] = [
    { id: 'select', icon: MousePointer, label: 'Select' },
    { id: 'rectangle', icon: Square, label: 'Rectangle' },
    { id: 'ellipse', icon: Circle, label: 'Ellipse' },
    { id: 'arrow', icon: ArrowRight, label: 'Arrow' },
    { id: 'line', icon: Minus, label: 'Line' },
    { id: 'freedraw', icon: Pencil, label: 'Draw' },
    { id: 'text', icon: TypeIcon, label: 'Text' },
    { id: 'delete', icon: Eraser, label: 'Delete' },
  ];

  return (
    <div className="fixed top-2 sm:top-4 left-1/2 transform -translate-x-1/2 z-50 flex items-center gap-0.5 sm:gap-1 px-1.5 py-0.5 bg-card/90 backdrop-blur-sm border border-border rounded-lg shadow-lg max-w-3xl sm:max-w-fit min-w-max overflow-x-auto scrollbar-hide">
      {/* Drawing Tools */}
      <div className="flex items-center gap-1.5 flex-shrink-0">
        {tools.map((tool) => (
          <span
            key={tool.id}
            onClick={() => onToolChange(tool.id)}
            className={cn(
              "h-6 w-6 sm:h-7 sm:w-8 p-0 rounded-lg flex-shrink-0 cursor-pointer transition-colors flex items-center justify-center hover:bg-primary/20",
              currentTool === tool.id
                ? "bg-primary/20 text-foreground/70"
                : "text-foreground/70"
            )}
            title={tool.label}
          >
            <tool.icon className="h-3 w-3 sm:h-3.5 sm:w-3.5 font-extralight" />
          </span>
        ))}
      </div>

      <div className="mx-1 h-6 w-px bg-border" />

      {/* Color Picker */}
      <div className="px-0.5 sm:px-1 flex-shrink-0">
        <ColorPicker
          currentColor={currentStrokeColor}
          currentFillColor={currentFillColor}
          onColorChange={onStrokeColorChange}
          onFillColorChange={onFillColorChange}
        />
      </div>

      <div className="mx-1 h-6 w-px bg-border" />

      {/* Action Buttons */}
      <div className="flex items-center gap-0.5 flex-shrink-0">
        <span
          onClick={onUndo}
          className={cn(
            "h-6 w-6 sm:h-8 sm:w-8 p-0 rounded-lg flex-shrink-0 cursor-pointer transition-colors flex items-center justify-center",
            canUndo
              ? "hover:bg-primary/20 text-foreground/70"
              : "opacity-50 cursor-not-allowed text-foreground/70"
          )}
          title="Undo"
        >
          <Undo2 className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
        </span>
        <span
          onClick={onClear}
          className="h-6 w-6 sm:h-8 sm:w-8 p-0 rounded-lg hover:bg-primary/20 text-foreground/70 flex-shrink-0 cursor-pointer transition-colors flex items-center justify-center"
          title="Clear Canvas"
        >
          <Trash className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
        </span>
      </div>
    </div>
  )
}