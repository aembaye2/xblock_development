import { 
  Slash, 
  Square, 
  Circle, 
  Dot, 
  Triangle, 
  MoveUpRight, 
  MoveDiagonal, 
  Spline,
  Type,
  Pentagon,
  MousePointer,
  Trash2,
  XCircle,
  type LucideIcon
} from "lucide-react";
import type { DrawingMode } from "./drawingModes";

export interface DrawingTool {
  id: DrawingMode;
  icon: LucideIcon;
  title: string;
  description?: string;
}

// All available drawing tools
export const ALL_DRAWING_TOOLS: DrawingTool[] = [
  {
    id: "select",
    icon: MousePointer,
    title: "Select & Move",
    description: "Click and drag to select and move objects"
  },
  {
    id: "point",
    icon: Dot,
    title: "Draw Point",
    description: "Click to place a point"
  },
  {
    id: "segment",
    icon: Slash,
    title: "Draw Segment",
    description: "Click and drag to draw a line segment"
  },
  {
    id: "arrow",
    icon: MoveUpRight,
    title: "Draw Arrow",
    description: "Click and drag to draw an arrow"
  },
  {
    id: "doubleArrow",
    icon: MoveDiagonal,
    title: "Draw Double Arrow",
    description: "Click and drag to draw a double-headed arrow"
  },
  {
    id: "triangle",
    icon: Triangle,
    title: "Draw Triangle",
    description: "Click three points, double-click to finish"
  },
  {
    id: "curve",
    icon: Spline,
    title: "Draw Curve",
    description: "Click to add points, drag to adjust, double-click to finish"
  },
  {
    id: "rectangle",
    icon: Square,
    title: "Draw Rectangle",
    description: "Click and drag to draw a rectangle"
  },
  {
    id: "circle",
    icon: Circle,
    title: "Draw Circle",
    description: "Click center and drag to set radius"
  },
  {
    id: "text",
    icon: Type,
    title: "Add Text",
    description: "Click to place text on the canvas"
  },
  {
    id: "polygon",
    icon: Pentagon,
    title: "Draw Polygon",
    description: "Click to add vertices, double-click to close"
  },
  {
    id: "delete2",
    icon: XCircle,
    title: "Delete Shape",
    description: "Click on a shape to delete it"
  },
];

// Helper to get specific tools by ID
export const getToolsByIds = (ids: DrawingMode[]): DrawingTool[] => {
  return ids
    .map(id => ALL_DRAWING_TOOLS.find(tool => tool.id === id))
    .filter((tool): tool is DrawingTool => tool !== undefined);
};

// Predefined tool sets for common use cases
export const TOOL_SETS = {
  basic: ["select", "point", "segment", "rectangle", "circle"] as DrawingMode[],
  geometric: ["select", "point", "segment", "triangle", "rectangle", "circle"] as DrawingMode[],
  arrows: ["select", "arrow", "doubleArrow", "segment"] as DrawingMode[],
  all: ALL_DRAWING_TOOLS.map(tool => tool.id) as DrawingMode[],
  minimal: ["select", "point", "segment"] as DrawingMode[],
};
