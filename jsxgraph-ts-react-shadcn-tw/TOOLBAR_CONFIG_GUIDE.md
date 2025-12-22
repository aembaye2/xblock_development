# Drawing Tools Configuration Guide

The DrawingBoard component has been refactored to support configurable tool selection, allowing you to display only the drawing tools you need.

## Quick Start

### Default (All Tools)
```tsx
import DrawingBoard from "@/components/DrawingBoard";

<DrawingBoard />
// or explicitly:
<DrawingBoard tools="all" />
```

### Predefined Tool Sets
```tsx
// Basic shapes only
<DrawingBoard tools="basic" />

// Geometric shapes
<DrawingBoard tools="geometric" />

// Arrows and lines
<DrawingBoard tools="arrows" />

// Minimal (point + segment only)
<DrawingBoard tools="minimal" />
```

### Custom Tool Selection
```tsx
// Specific tools only
<DrawingBoard tools={["point", "circle", "triangle"]} />

// Just curves and points
<DrawingBoard tools={["point", "curve"]} />
```

## Available Drawing Tools

| Tool ID | Icon | Description |
|---------|------|-------------|
| `point` | • | Click to place a point |
| `segment` | / | Click and drag to draw a line segment |
| `arrow` | ↗ | Click and drag to draw a single-headed arrow |
| `doubleArrow` | ⇄ | Click and drag to draw a double-headed arrow |
| `triangle` | △ | Click 3 points, double-click to finish |
| `curve` | ∿ | Click and drag 4 points for a smooth Catmull-Rom spline |
| `rectangle` | ▭ | Click and drag to draw a rectangle |
| `circle` | ○ | Click center and drag to set radius |

## Predefined Tool Sets

### `"basic"`
Perfect for simple drawings and beginners
- point, segment, rectangle, circle

### `"geometric"` 
All basic geometric shapes
- point, segment, triangle, rectangle, circle

### `"arrows"`
Great for diagrams and flowcharts
- arrow, doubleArrow, segment

### `"minimal"`
Just the essentials
- point, segment

### `"all"` (default)
Every available tool

## Use Case Examples

### Math Education
```tsx
<DrawingBoard tools={["point", "segment", "triangle", "circle"]} />
```

### Technical Diagrams
```tsx
<DrawingBoard tools={["rectangle", "arrow", "doubleArrow", "segment"]} />
```

### Artistic Drawing
```tsx
<DrawingBoard tools={["point", "curve", "circle"]} />
```

### Vector Graphics
```tsx
<DrawingBoard tools={["segment", "arrow", "curve", "rectangle"]} />
```

## Adding Custom Presets

Edit `lib/drawingTools.ts` to add your own preset:

```typescript
export const TOOL_SETS = {
  // ... existing presets ...
  diagram: ["rectangle", "circle", "arrow", "segment"] as DrawingMode[],
  artistic: ["point", "curve", "circle"] as DrawingMode[],
};
```

Then use it:
```tsx
<DrawingBoard tools="diagram" />
```

## Architecture

### Files Created

1. **`lib/drawingTools.ts`**
   - Defines all available tools with icons and descriptions
   - Exports tool configurations and preset sets
   - Helper functions for tool selection

2. **`components/DrawingToolbar.tsx`**
   - Reusable toolbar component
   - Renders only the specified tools
   - Handles all toolbar actions (draw, undo, redo, clear, export)

3. **`lib/drawingModes/`** (from previous refactor)
   - Individual handler files for each drawing mode
   - Consistent interface pattern
   - Isolated, maintainable code

### Component Props

```typescript
interface DrawingBoardProps {
  tools?: DrawingMode[] | keyof typeof TOOL_SETS;
}
```

- **Default**: `"all"` (shows all tools)
- **String**: Use predefined set name
- **Array**: Specify exact tools to show

## Demo Page

Visit `/tools-demo` to see live examples of different tool configurations:
- Basic tools
- Geometric shapes
- Arrows only
- Custom selections
- All tools

## Benefits

✅ **Flexibility** - Show only the tools you need  
✅ **Reusability** - Same component, different configurations  
✅ **Maintainability** - Easy to add/remove tools  
✅ **Clean Code** - Separated concerns, modular design  
✅ **Type Safety** - Full TypeScript support  

## Migration from Previous Version

If you're upgrading from the previous version where all tools were always shown:

**Before:**
```tsx
<DrawingBoard />
```

**After (same behavior):**
```tsx
<DrawingBoard />
// or explicitly:
<DrawingBoard tools="all" />
```

**To customize:**
```tsx
<DrawingBoard tools="basic" />
// or
<DrawingBoard tools={["point", "segment", "circle"]} />
```
