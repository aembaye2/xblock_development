////////////////////////////////////////////////////////////////////////////////
// Remember: changes in this file will only take effect when you run          //
// npm run build       or      npm run watch                                  //
////////////////////////////////////////////////////////////////////////////////
import React from 'react';
import { fabric } from 'fabric'
import { FormattedMessage } from 'react-intl';
import { DrawingApp, modes } from "ae-drawable-canvas"

interface Props {
  initialCount?: number;
}

const StudentView: React.FC<Props> = ({ initialCount = 0 }) => {
  const currentQuestionIndex = 0;
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
        <div>
          <DrawingApp
            index={currentQuestionIndex}
            AssessName={quizName || ""}
            canvasWidth={canvasWidth}
            canvasHeight={canvasHeight}
            nextButtonClicked={nextButtonClicked}
            //bgnumber={bgnumber}
            modes={modes}
          />
        </div>
      </div>
    </>
  );
}

export default StudentView;
