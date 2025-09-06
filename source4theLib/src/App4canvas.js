// App.js
import React from "react"
//import { HelloWorld } from "@embaye/drawable-canvas"
import "./App.css"
import DrawingApp from "./components/canvas/DrawingApp"

function App() {
  const currentQuestionIndex = 0
  const quizName = "Drawing"
  const nextButtonClicked = false
  const canvasWidth = 500
  const canvasHeight = 400
  return (
    <>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          height: "10vh",
        }}
      >
        <h1>Library implementation</h1>
        <div>
          <DrawingApp
            index={currentQuestionIndex}
            AssessName={quizName || ""}
            canvasWidth={canvasWidth}
            canvasHeight={canvasHeight}
            nextButtonClicked={nextButtonClicked}
          />
        </div>
      </div>
    </>
  )
}

export default App
