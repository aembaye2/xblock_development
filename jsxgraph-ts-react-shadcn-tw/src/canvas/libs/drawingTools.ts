import { 
  Slash, 
  Square, 
  Circle, 
  Dot, 
  Triangle, 
  MoveUpRight, 
  MoveDiagonal, 
  Spline,
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
    description: "Click and drag to place 4 points for a smooth curve"
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
];

// Helper to get specific tools by ID
export const getToolsByIds = (ids: DrawingMode[]): DrawingTool[] => {
  return ids
    .map(id => ALL_DRAWING_TOOLS.find(tool => tool.id === id))
    .filter((tool): tool is DrawingTool => tool !== undefined);
};

// Predefined tool sets for common use cases
export const TOOL_SETS = {
  basic: ["point", "segment", "rectangle", "circle"] as DrawingMode[],
  geometric: ["point", "segment", "triangle", "rectangle", "circle"] as DrawingMode[],
  arrows: ["arrow", "doubleArrow", "segment"] as DrawingMode[],
  all: ALL_DRAWING_TOOLS.map(tool => tool.id) as DrawingMode[],
  minimal: ["point", "segment"] as DrawingMode[],
};
