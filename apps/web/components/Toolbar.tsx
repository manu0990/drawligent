import { ForwardRefExoticComponent, ReactElement, RefAttributes } from "react";
import { Tool } from "@/types/whiteboard-types";
import { LockKeyholeOpen, LockKeyhole, Hand, MousePointer, Square, Diamond, Circle, Minus, Eraser, Pencil, TypeIcon, Image, Trash, LucideProps } from "lucide-react";
import { cn } from "@repo/ui/lib/utils";
import { Arrow } from "@/public/svgs/Arrow";

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
  isLocked: boolean;
  onToggleLock: () => void;
}

type toolsetTypes = {
  id: Tool;
  icon: ForwardRefExoticComponent<Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>> | ((props: React.SVGProps<SVGSVGElement>) => ReactElement);
  selector: string;
  label: string;
}

export default function Toolbar({
  currentTool,
  onToolChange,
  onClear,
  isLocked,
  onToggleLock,
}: ToolbarProps) {
  const tools: toolsetTypes[] = [
    { id: 'hand', icon: Hand, selector: 'H', label: 'Hand(panning tool) — H' },
    { id: 'select', icon: MousePointer, selector: '1', label: 'Selection — V or 1' },
    { id: 'rectangle', icon: Square, selector: '2', label: 'Rectangle — R or 2' },
    { id: 'diamond', icon: Diamond, selector: '3', label: 'Diamond — D or 3' },
    { id: 'ellipse', icon: Circle, selector: '4', label: 'Ellipse — O or 4' },
    { id: 'arrow', icon: Arrow, selector: '5', label: 'Arrow — A or 5' },
    { id: 'line', icon: Minus, selector: '6', label: 'Line — L or 6' },
    { id: 'freedraw', icon: Pencil, selector: '7', label: 'Pen — P or 7' },
    { id: 'text', icon: TypeIcon, selector: '8', label: 'Text — t or 8' },
    { id: 'image', icon: Image, selector: '9', label: 'Insert Image — I or 9' },
    { id: 'eraser', icon: Eraser, selector: '0', label: 'Eraser — E or 0' },
  ];

  return (
    <div className="fixed top-2 sm:top-4 left-1/2 transform -translate-x-1/2 z-50 flex items-center gap-0.5 sm:gap-1 px-1 py-1 bg-card/90 backdrop-blur-sm border border-border rounded-lg shadow-lg max-w-3xl sm:max-w-fit min-w-max overflow-x-auto scrollbar-hide">
      <div className="flex items-center gap-0.5 flex-shrink-0">
        <span
          onClick={onToggleLock}
          className={cn(
            "h-6 w-6 sm:h-8 sm:w-8 p-0 rounded-lg flex-shrink-0 cursor-pointer transition-colors flex items-center justify-center text-foreground/70",
            isLocked ? "bg-primary/20" : "hover:bg-secondary"
          )}
          title="Keep selected tool active after drawing — Q"
        >
          {isLocked ? (
            <LockKeyhole className="h-3 w-2.5 sm:h-3.5 sm:w-3" />
          ) : (
            <LockKeyholeOpen className="h-3 w-2.5 sm:h-3.5 sm:w-3" />
          )}
          <span className="h-0.5 w-0.5 text-[0.5rem] transform translate-y-0.5 opacity-70 ">
            Q
          </span>
        </span>
      </div>

      <div className="mx-1 h-6 w-px bg-border" />

      {/* Drawing Tools */}
      <div className="flex items-center gap-1.5 flex-shrink-0">
        {tools.map((tool) => (
          <span
            key={tool.id}
            onClick={() => onToolChange(tool.id)}
            className={cn(
              "h-6 w-6 sm:h-8 sm:w-8 p-0 rounded-lg flex-shrink-0 cursor-pointer transition-colors flex items-center justify-center text-foreground/70 ",
              currentTool === tool.id ? "bg-primary/20" : "hover:bg-secondary ",
            )}
            title={tool.label}
          >
            <tool.icon className="h-3 w-3 sm:h-3.5 sm:w-3.5 font-extralight" />
            <span className="h-0.5 w-0.5 text-[0.5rem] transform translate-y-0.5 opacity-70">
              {tool.selector}
            </span>
          </span>
        ))}
      </div>

      <div className="mx-1 h-6 w-px bg-border" />

      {/* Action Buttons */}
      <div className="flex items-center gap-0.5 flex-shrink-0">
        <span
          onClick={onClear}
          className="h-6 w-6 sm:h-8 sm:w-8 p-0 rounded-lg hover:bg-secondary text-foreground/70 flex-shrink-0 cursor-pointer transition-colors flex items-center justify-center"
          title="Clear Canvas — C"
        >
          <Trash className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
          <span className="h-0.5 w-0.5 text-[0.5rem] transform translate-y-0.5 opacity-70 ">
            C
          </span>
        </span>
      </div>
    </div>
  )
}