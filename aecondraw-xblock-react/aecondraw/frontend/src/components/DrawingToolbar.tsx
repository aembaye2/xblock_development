import React from 'react';
import { Button } from "./ui/button";
import { Undo, Redo, Trash2, Download, FileJson } from "lucide-react";
import type { DrawingMode } from "../lib/drawingModes";
import type { DrawingTool } from "../lib/drawingTools";

type ActionButton = "undo" | "redo" | "clear" | "downloadPNG" | "downloadJSON" | "submit";

interface DrawingToolbarProps {
  // Drawing tools to display
  tools: DrawingTool[];
  
  // Current active mode
  currentMode: DrawingMode;
  
  // Mode change handler
  onModeChange: (mode: DrawingMode) => void;
  
  // Action handlers
  onUndo: () => void;
  onRedo: () => void;
  onClear: () => void;
  onDownloadPNG: () => void;
  onDownloadJSON: () => void;
  
  // State for disabling buttons
  canUndo: boolean;
  canRedo: boolean;
  
  // Which action buttons to display
  buttons: ActionButton[];
}

export default function DrawingToolbar({
  tools,
  currentMode,
  onModeChange,
  onUndo,
  onRedo,
  onClear,
  onDownloadPNG,
  onDownloadJSON,
  canUndo,
  canRedo,
  buttons,
}: DrawingToolbarProps) {
  return (
    <div className="flex items-center gap-1 flex-nowrap">
      {/* Drawing mode tools */}
      {tools.map((tool) => {
        const Icon = tool.icon;
        return (
          <Button
            key={tool.id}
            onClick={() => onModeChange(tool.id)}
            variant={currentMode === tool.id ? "default" : "outline"}
            title={tool.title}
            size="default"
          >
            <Icon className="h-4 w-4" />
          </Button>
        );
      })}
      
      {/* Action buttons */}
      {buttons.includes("undo") && (
        <Button 
          onClick={onUndo} 
          variant="outline"
          disabled={!canUndo}
          title="Undo"
        >
          <Undo className="h-4 w-4" />
        </Button>
      )}
      
      {buttons.includes("redo") && (
        <Button 
          onClick={onRedo} 
          variant="outline"
          disabled={!canRedo}
          title="Redo"
        >
          <Redo className="h-4 w-4" />
        </Button>
      )}
      
      {buttons.includes("clear") && (
        <Button 
          onClick={onClear} 
          variant="destructive" 
          title="Clear All"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      )}
      
      {buttons.includes("downloadPNG") && (
        <Button 
          onClick={onDownloadPNG} 
          variant="outline" 
          title="Download PNG"
        >
          <Download className="h-4 w-4" />
        </Button>
      )}
      
      {buttons.includes("downloadJSON") && (
        <Button 
          onClick={onDownloadJSON} 
          variant="outline" 
          title="Download JSON"
        >
          <FileJson className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
