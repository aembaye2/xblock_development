import { Button } from "@/canvas/components/ui/button";
import { Undo, Redo, Trash2, Download, FileJson } from "lucide-react";
import type { DrawingMode } from "@/canvas/libs/drawingModes/types";
import type { DrawingTool } from "@/canvas/libs/drawingTools";

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

// Component for drawing mode tools only
export function DrawingTools({
  tools,
  currentMode,
  onModeChange,
}: {
  tools: DrawingTool[];
  currentMode: DrawingMode;
  onModeChange: (mode: DrawingMode) => void;
}) {
  return (
    <div className="flex items-center gap-1 flex-wrap">
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
    </div>
  );
}

// Component for action buttons only
export function ActionButtons({
  onUndo,
  onRedo,
  onClear,
  onDownloadPNG,
  onDownloadJSON,
  canUndo,
  canRedo,
  buttons,
}: {
  onUndo: () => void;
  onRedo: () => void;
  onClear: () => void;
  onDownloadPNG: () => void;
  onDownloadJSON: () => void;
  canUndo: boolean;
  canRedo: boolean;
  buttons: ActionButton[];
}) {
  return (
    <div className="flex flex-col gap-1">
      {buttons.includes("undo") && (
        <Button 
          onClick={onUndo} 
          variant="outline"
          disabled={!canUndo}
          title="Undo"
          className="w-full"
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
          className="w-full"
        >
          <Redo className="h-4 w-4" />
        </Button>
      )}
      
      {buttons.includes("clear") && (
        <Button 
          onClick={onClear} 
          variant="destructive" 
          title="Clear All"
          className="w-full"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      )}
      
      {buttons.includes("downloadPNG") && (
        <Button 
          onClick={onDownloadPNG} 
          variant="outline" 
          title="Download PNG"
          className="w-full"
        >
          <Download className="h-4 w-4" />
        </Button>
      )}
      
      {buttons.includes("downloadJSON") && (
        <Button 
          onClick={onDownloadJSON} 
          variant="outline" 
          title="Download JSON"
          className="w-full"
        >
          <FileJson className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}

// Legacy combined component (kept for backwards compatibility)
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
