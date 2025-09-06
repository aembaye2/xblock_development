//type of questions: "mc-quest", "float-num-quest" , "one-line-text-quest", "manylines-text-quest", "graphing-quest"

// import { saveAs } from "file-saver"
// import html2pdf from "html2pdf.js"
//import placeholderDrawing from "./public/placeholderImage"

export const handleGeneratePDF = async (
  e,
  questions,
  userAnswers,
  fullname,
  quizName
) => {
  e.preventDefault()

  const userInputData = questions.map((question, index) => ({
    ...question,
    "user-answer": userAnswers[index] || "",
  }))

  let htmlContent = `
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; }
          .question { margin-bottom: 20px; }
          .answer { margin-top: 10px; white-space: pre-wrap; }
          .manylines-text-quest { height: 200px; overflow: hidden; }
          .graphing-quest { margin-top: 10px; }
          .graphing-quest img { width: 200px; height: 175px; } /* Adjust the size of the embedded graph */
        </style>
      </head>
      <body>
       <h3 style="text-align: center;">Pdf Report for ${quizName}</h3>
        <h1>Full Name: ${fullname}</h1>
  `

  userInputData.forEach((question, index) => {
    htmlContent += `
      <div class="question">
        <p>${index + 1}. ${question.question}</p>
    `

    if (question.qtype === "mc-quest") {
      question.options.forEach((option) => {
        htmlContent += `<p>${option}</p>`
      })
    }

    if (question.qtype === "manylines-text-quest") {
      let answerText = `<strong>Answer:</strong> ${question["user-answer"]}`
      answerText = answerText.replace(/\s\s+/g, " ")

      if (answerText.length < 1000) {
        answerText = answerText.padEnd(1000, " ")
      } else if (answerText.length > 1000) {
        answerText = answerText.substring(0, 1000) + "..."
      }

      htmlContent += `<div class="answer manylines-text-quest">${answerText}</div>`
    } else if (question.qtype === "graphing-quest") {
      const combinedCanvasImage = localStorage.getItem(
        `${quizName}-canvasImage-${index}`
      )
      htmlContent += `<div ><strong>Answer:</strong></div>`
      if (combinedCanvasImage) {
        htmlContent += `<div class="answer graphing-quest"><img src="${combinedCanvasImage}" alt="Graphing Answer" /></div>`
      } else {
        htmlContent += `<div class="answer graphing-quest"><canvas></canvas></div>`
      }
    } else {
      htmlContent += `<div class="answer"> <strong>Answer:</strong> ${question["user-answer"]}</div>`
    }

    htmlContent += `</div>`
  })

  htmlContent += `
      </body>
    </html>
  `

  // Dynamically import html2pdf.js on the client side
  if (typeof window !== "undefined") {
    const html2pdf = (await import("html2pdf.js")).default

    // Convert HTML to PDF
    const opt = {
      margin: [1, 1, 0.5, 1], // top, right, bottom, left margins in inches
      filename: `MyPdfReport4${quizName}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: "in", format: "A4", orientation: "portrait" },
    }

    html2pdf().from(htmlContent).set(opt).save()
  }
}
