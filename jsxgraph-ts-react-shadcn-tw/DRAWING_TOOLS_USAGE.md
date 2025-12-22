# DrawingBoard Tool Configuration Examples

The `DrawingBoard` component now accepts a `tools` prop to customize which drawing tools are displayed.

## Usage Examples

### Using Predefined Tool Sets

```tsx
import DrawingBoard from "@/components/DrawingBoard";

// Show all tools (default)
<DrawingBoard tools="all" />

// Show only basic tools (point, segment, rectangle, circle)
<DrawingBoard tools="basic" />

// Show geometric shapes (point, segment, triangle, rectangle, circle)
<DrawingBoard tools="geometric" />

// Show arrow tools (arrow, doubleArrow, segment)
<DrawingBoard tools="arrows" />

// Show minimal set (point, segment only)
<DrawingBoard tools="minimal" />
```

### Using Custom Tool Arrays

```tsx
// Show only point and circle
<DrawingBoard tools={["point", "circle"]} />

// Show point, segment, and triangle
<DrawingBoard tools={["point", "segment", "triangle"]} />

// Show all shape tools (no points or lines)
<DrawingBoard tools={["triangle", "rectangle", "circle"]} />

// Show only curved elements
<DrawingBoard tools={["curve", "circle"]} />
```

## Available Tool IDs

- `"point"` - Place individual points
- `"segment"` - Draw line segments
- `"arrow"` - Draw single-headed arrows
- `"doubleArrow"` - Draw double-headed arrows
- `"triangle"` - Draw triangles (3 clicks + double-click)
- `"curve"` - Draw Catmull-Rom spline curves (4 points)
- `"rectangle"` - Draw rectangles
- `"circle"` - Draw circles

## Predefined Tool Sets

Defined in `lib/drawingTools.ts`:

```typescript
export const TOOL_SETS = {
  basic: ["point", "segment", "rectangle", "circle"],
  geometric: ["point", "segment", "triangle", "rectangle", "circle"],
  arrows: ["arrow", "doubleArrow", "segment"],
  all: [...all tools...],
  minimal: ["point", "segment"],
};
```

## Adding Custom Tool Sets

Edit `lib/drawingTools.ts` to add your own preset:

```typescript
export const TOOL_SETS = {
  // ... existing sets ...
  myCustomSet: ["point", "segment", "triangle"] as DrawingMode[],
};
```

Then use it:

```tsx
<DrawingBoard tools="myCustomSet" />
```

## Examples by Use Case

### Math Education (Basic Geometry)
```tsx
<DrawingBoard tools={["point", "segment", "triangle", "circle"]} />
```

### Vector Graphics
```tsx
<DrawingBoard tools={["segment", "arrow", "curve"]} />
```

### Diagram Creation
```tsx
<DrawingBoard tools={["rectangle", "circle", "arrow", "doubleArrow"]} />
```

### Simple Sketching
```tsx
<DrawingBoard tools={["point", "segment", "curve"]} />
```
