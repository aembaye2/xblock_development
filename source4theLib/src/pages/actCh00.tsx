//import React, { useEffect } from "react"
import React from "react"
import QuestionsComponent from "../components/QuestionsComponent"
import { quiz } from "./data" // Import the quiz data from data2.ts

const quizName = "ActCh00" // Name of the quiz

const user = {
  data: {
    user: {
      id: "1345",
    },
  },
}

const Act00Comp = () => {
  const isAvailable = true
  //const questions = quiz.questions // Get questions from the imported quiz data, is a
  const questions = quiz.questions.filter((q) => q !== undefined) // Filter out undefined elementslist
  const userId = user?.data.user.id

  if (!isAvailable) {
    return (
      <div className="container">
        <h1>Quiz is temporarely not available yet</h1>
      </div>
    )
  } else {
    return (
      <>
        {/* <Quiz questions={questions} userId={userId} quizName={quizName} /> */}
        <QuestionsComponent
          questions={questions}
          userId={userId}
          quizName={quizName}
        />
      </>
    )
  }
}

export default Act00Comp
