//npm install ae-drawable-canvas
import { DrawingApp, modes } from "ae-drawable-canvas" // if this is uncommented, the above two must be commented

const App = () => {
  const currentQuestionIndex = 0
  const quizName = "quiz1"
  const nextButtonClicked = false
  const canvasWidth = 500
  const canvasHeight = 400
  return (
    <>     
      <div>
          <DrawingApp
            index={currentQuestionIndex}
            AssessName={quizName || ""}
            canvasWidth={canvasWidth}
            canvasHeight={canvasHeight}
            nextButtonClicked={nextButtonClicked}
            modes={modes}
          />

      </div>
    </>
  )
}

export default App


