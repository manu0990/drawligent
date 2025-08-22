"use client";

import { Button } from '@repo/ui/components/button';
import { Popover, PopoverContent, PopoverTrigger } from '@repo/ui/components/popover';
import { Palette } from 'lucide-react';

interface ColorPickerProps {
  currentColor: string;
  currentFillColor: string;
  onColorChange: (color: string) => void;
  onFillColorChange: (color: string) => void;
}

const strokeColors = [
  '#000000', // Black
  '#3B82F6', // Blue
  '#EF4444', // Red
  '#10B981', // Green
  '#F59E0B', // Yellow
];

const fillColors = [
  'transparent', // Transparent
  '#F3F4F6', // Light Gray
  '#DBEAFE', // Light Blue
  '#FEE2E2', // Light Red
  '#D1FAE5', // Light Green
];

export function ColorPicker({
  currentColor,
  currentFillColor,
  onColorChange,
  onFillColorChange,
}: ColorPickerProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-9 w-9 p-0"
          title="Colors"
        >
          <Palette className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-4">
        <div className="space-y-4">
          {/* Stroke Colors */}
          <div>
            <h4 className="text-sm font-medium mb-2">Stroke Color</h4>
            <div className="flex gap-2">
              {strokeColors.map((color) => (
                <button
                  key={color}
                  className={`w-8 h-8 rounded border-2 ${currentColor === color ? 'border-gray-400' : 'border-gray-200'
                    }`}
                  style={{ backgroundColor: color }}
                  onClick={() => onColorChange(color)}
                  title={color}
                />
              ))}
            </div>
          </div>

          {/* Fill Colors */}
          <div>
            <h4 className="text-sm font-medium mb-2">Fill Color</h4>
            <div className="flex gap-2">
              {fillColors.map((color) => (
                <button
                  key={color}
                  className={`w-8 h-8 rounded border-2 ${currentFillColor === color ? 'border-gray-400' : 'border-gray-200'
                    } ${color === 'transparent' ? 'bg-white' : ''}`}
                  style={{
                    backgroundColor: color === 'transparent' ? 'white' : color,
                    backgroundImage: color === 'transparent' ?
                      'linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)' :
                      'none',
                    backgroundSize: color === 'transparent' ? '8px 8px' : 'auto',
                    backgroundPosition: color === 'transparent' ? '0 0, 0 4px, 4px -4px, -4px 0px' : 'auto'
                  }}
                  onClick={() => onFillColorChange(color)}
                  title={color === 'transparent' ? 'Transparent' : color}
                />
              ))}
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}