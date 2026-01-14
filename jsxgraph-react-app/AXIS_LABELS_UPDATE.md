# Update: Customizable Axis Labels

## What's New

✅ **X and Y axis labels are now customizable!**

### Features Added:

1. **Input fields** in the UI to change axis labels
2. **Real-time updates** - changes are reflected immediately on the canvas
3. **Props support** - `xAxisLabel` and `yAxisLabel` can be passed to DrawingBoard component

### How to Use:

#### In the App UI:
1. Look for the "Axis Labels" section above the drawing canvas
2. Enter custom labels in the "X-Axis Label" and "Y-Axis Label" input fields
3. The labels update in real-time on the canvas

#### As Props (for developers):
```tsx
<DrawingBoard
  tools={['point', 'segment', 'circle']}
  buttons={['undo', 'redo', 'clear', 'downloadPNG', 'downloadJSON']}
  boardPixelSize={[700, 600]}
  xAxisLabel="time"        // Custom x-axis label
  yAxisLabel="velocity"    // Custom y-axis label
/>
```

### Default Values:
- X-Axis: 'x'
- Y-Axis: 'y'

### Use Cases:

- **Physics**: time vs. position, time vs. velocity
- **Economics**: quantity vs. price
- **Statistics**: different variable names
- **Education**: teaching different coordinate systems

The axis labels are dynamic and update instantly when changed!

---

**Try it now:** Open http://localhost:3000 and change the axis labels in the input fields!
