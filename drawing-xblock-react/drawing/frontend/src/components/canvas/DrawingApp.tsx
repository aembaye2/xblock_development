import React, { useState } from "react"
import DrawableCanvas, { ComponentArgs } from "./DrawableCanvas"
import DrawingModeSelector from "./DrawingModeSelector"
import { CanvasStateProvider } from "./DrawableCanvasState"

// All props, including initialDrawing, must be provided by backend/parent.
// Example: <DrawingApp initialDrawing={...} canvasHeight={...} ... />
export interface DrawingAppProps {
  AssessName: string
  index: number
  canvasWidth: number
  canvasHeight: number
  scaleFactors: number[]
  submitButtonClicked: boolean
  bgnumber: number // New prop for selecting the background
  modes: { mode: string; icon: React.ElementType; description: string }[] // Add the modes prop
  visibleModes?: string[] // Optional whitelist of mode keys to display
  initialDrawing: object // initial drawing provided by backend/parent
  axisLabels?: [string, string]
}

export function DrawingApp({
  index,
  AssessName,
  canvasWidth,
  canvasHeight,
  scaleFactors,
  submitButtonClicked,
  bgnumber, // Consume the bgnumber prop
  modes, // Destructure the modes prop
  visibleModes,
  initialDrawing,
  axisLabels,
}: DrawingAppProps) {
  // visibleModes semantics:
  // - undefined: backend did not provide the field -> preserve legacy behavior and show all modes
  // - [] (empty array): explicit whitelist of zero -> show no modes
  // - non-empty array: whitelist showing only listed modes
  const visibleModesList = typeof visibleModes === 'undefined'
    ? modes
    : modes.filter(m => (visibleModes as string[]).includes(m.mode))

  // Pick a safe initial mode: prefer the first visible mode; fall back to the first mode overall
  const defaultMode = (visibleModesList && visibleModesList.length > 0) ? visibleModesList[0].mode : (modes.length > 0 ? modes[0].mode : '')
  const [drawingMode, setDrawingMode] = useState(defaultMode)
  const [strokeColor, setStrokeColor] = useState("#000000")
  const [strokeWidth, setStrokeWidth] = useState(2)

  const canvasProps: ComponentArgs = {
    AssessName: AssessName,
    index: index,
    fillColor: "transparent",
    strokeWidth: strokeWidth,
    strokeColor: strokeColor,
    backgroundColor: "blue",
    backgroundImageURL: "",
    canvasWidth: canvasWidth,
    canvasHeight: canvasHeight,
    drawingMode: drawingMode,
    initialDrawing: initialDrawing, // Provided by backend/parent
    displayToolbar: true,
    displayRadius: 3,
    scaleFactors: scaleFactors,
    submitButtonClicked: submitButtonClicked,
    bgnumber: bgnumber, // Pass the bgnumber prop to DrawableCanvas
    axisLabels: axisLabels,
    // control visibility for non-mode UI elements via visibleModes whitelist
    showDownload: typeof visibleModes === 'undefined' ? true : (visibleModes as string[]).includes('download'),
  }

  return (
    <>
      <div>
        <CanvasStateProvider>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              marginBottom: "10px",
            }}
          >
            <DrawingModeSelector
              drawingMode={drawingMode}
              setDrawingMode={setDrawingMode}
              modes={visibleModesList} // Pass the filtered/visible modes to the DrawingModeSelector
            />
            {/* Color selector: visible if visibleModes is undefined (legacy) or includes 'color' */}
            { (typeof visibleModes === 'undefined' || (visibleModes as string[]).includes('color')) && (
              <div style={{ marginLeft: "10px" }}>
                <label htmlFor="strokeColor">Color: </label>
                <input
                  type="color"
                  id="strokeColor"
                  value={strokeColor}
                  onChange={(e) => setStrokeColor(e.target.value)}
                />
              </div>
            )}

            {/* Stroke width selector: visible if visibleModes is undefined (legacy) or includes 'strokeWidth' */}
            { (typeof visibleModes === 'undefined' || (visibleModes as string[]).includes('strokeWidth')) && (
              <div style={{ marginLeft: "10px" }}>
                <label htmlFor="strokeWidth">Width: </label>
                <input
                  type="range"
                  id="strokeWidth"
                  value={strokeWidth}
                  min="1"
                  max="5"
                  onChange={(e) => setStrokeWidth(Number(e.target.value))}
                  style={{ width: "50px" }}
                />
                <span>{strokeWidth}</span>
              </div>
            )}
          </div>
          <DrawableCanvas {...canvasProps} />
        </CanvasStateProvider>
      </div>
    </>
  )
}

//export default DrawingApp
