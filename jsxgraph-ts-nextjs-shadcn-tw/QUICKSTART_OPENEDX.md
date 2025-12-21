# Quick Start: OpenEdX Integration

## 5-Minute Setup

### 1. Basic Student Exercise

```tsx
<DrawingBoard 
  tools={["point", "segment"]}
  buttons={["undo", "redo", "submit"]}
  onSubmit={(state) => console.log(state)}
/>
```

### 2. With Instructor's Initial Drawing

```tsx
const instructorSetup = {
  version: "1.0",
  boardSettings: { boundingBox: [-1, 11, 11, -1] },
  objects: [
    {
      id: "point_A",
      type: "point",
      coords: { x: 2, y: 3 },
      properties: { fillColor: "#ff0000" },
      isInitial: true,
    }
  ],
};

<DrawingBoard 
  tools={["segment"]}
  buttons={["undo", "redo", "submit"]}
  initialState={instructorSetup}
  readOnlyInitial={true}
  onSubmit={(state) => gradeAnswer(state)}
/>
```

### 3. Simple Grading Function

```typescript
function gradeAnswer(state: BoardState) {
  // Get only student's objects
  const studentWork = state.objects.filter(obj => !obj.isInitial);
  
  // Check for required object
  const hasSegment = studentWork.some(obj => obj.type === 'segment');
  
  if (hasSegment) {
    return { score: 100, feedback: "Correct!" };
  } else {
    return { score: 0, feedback: "Please draw a line segment." };
  }
}
```

## Common Patterns

### Read-Only Demo
```tsx
<DrawingBoard 
  tools={["point"]}
  buttons={[]}
  initialState={demonstrationDrawing}
  readOnlyInitial={true}
/>
```

### Practice Mode
```tsx
<DrawingBoard 
  tools={["point", "segment", "circle"]}
  buttons={["undo", "redo", "clear"]}
/>
```

### Assessment Mode
```tsx
<DrawingBoard 
  tools={["triangle", "circle"]}
  buttons={["undo", "redo", "submit"]}
  onSubmit={handleSubmission}
/>
```

## Props at a Glance

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `tools` | `string[]` | `"all"` | Drawing tools to show |
| `buttons` | `string[]` | all buttons | Action buttons to show |
| `initialState` | `BoardState` | `undefined` | Pre-drawn elements |
| `readOnlyInitial` | `boolean` | `false` | Lock initial elements |
| `onSubmit` | `function` | `undefined` | Handle submission |
| `onStateChange` | `function` | `undefined` | Track changes |

## Available Tools

`"point"` · `"segment"` · `"line"` · `"circle"` · `"rectangle"` · `"triangle"` · `"curve"` · `"arrow"` · `"doubleArrow"`

## Available Buttons

`"undo"` · `"redo"` · `"clear"` · `"downloadPNG"` · `"downloadJSON"` · `"submit"`

## Live Example

Visit `/openedx-demo` to see a complete working example with:
- ✅ Instructor's pre-drawn elements
- ✅ Student interaction
- ✅ Automated grading
- ✅ Immediate feedback

## Full Documentation

📖 [OPENEDX_XBLOCK_GUIDE.md](./OPENEDX_XBLOCK_GUIDE.md) - Complete XBlock integration guide
📖 [BUTTON_VISIBILITY_GUIDE.md](./BUTTON_VISIBILITY_GUIDE.md) - UI configuration
📖 [API_COMPARISON.md](./API_COMPARISON.md) - API examples
