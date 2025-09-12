// DrawingModeSelector.tsx
import React from "react"

interface DrawingModeSelectorProps {
  drawingMode: string
  setDrawingMode: (mode: string) => void
  modes: {
    mode: string
    icon: string | React.ElementType
    description: string
  }[] // Add the modes prop
}

const DrawingModeSelector: React.FC<DrawingModeSelectorProps> = ({
  drawingMode,
  setDrawingMode,
  modes, // Destructure the modes prop
}) => {
  return (
    <div>
      <div style={{ display: "flex", gap: "1px", flexWrap: "wrap" }}>
        {modes.map(({ mode, icon, description }) => (
          <button
            key={mode}
            type="button"
            onClick={() => setDrawingMode(mode)}
            title={description}
            style={{
              backgroundColor:
                drawingMode === mode ? "rgb(187, 182, 182)" : "white",
              border: "0px solid black",
              margin: "0px",
              padding: "5px",
              cursor: "pointer",
              width: "30px",
              height: "30px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "20%",
            }}
          >
            {typeof icon === "string" ? (
              <img
                src={icon}
                alt={mode}
                style={{ width: "24px", height: "24px" }}
              />
            ) : (
              React.createElement(icon, { style: { width: "24px", height: "24px" } })
            )}
          </button>
        ))}
      </div>
    </div>
  )
}

export default DrawingModeSelector
