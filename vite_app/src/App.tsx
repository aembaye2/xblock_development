import React, { useState } from "react";
import { DndContext, closestCenter } from "@dnd-kit/core";
import type { DragEndEvent } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

// Multiple questions (each question has a title and an initial list)
const questions = [
  {
    id: "q1",
    title: "Arrange the countries in alphabetical order:",
    items: ["Brazil", "Argentina", "Canada", "Denmark"],
  },
  {
    id: "q2",
    title: "Arrange the fruits in alphabetical order:",
    items: ["Orange", "Apple", "Banana", "Grape"],
  },
  {
    id: "q3",
    title: "Arrange the colors in alphabetical order:",
    items: ["Red", "Blue", "Green", "Yellow"],
  },
];

function SortableItem({
  id,
  children,
}: {
  id: string;
  children: React.ReactNode;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={{
        ...style,
        padding: 10,
        margin: 10,
        backgroundColor: "#f4f4f4",
        borderRadius: 5,
        border: "1px solid #ccc",
        cursor: "move",
      }}
      {...attributes}
      {...listeners}
    >
      {children}
    </div>
  );
}

const App = () => {
  // State to manage multiple questions and current question index
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<string[][]>(
    questions.map((q) => [...q.items])
  );
  const [result, setResult] = useState<string | null>(null); // Store result after submission

  // Function to handle the drag-and-drop reordering
  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setAnswers((prev) => {
        const copy = prev.map((a) => [...a]);
        const items = copy[currentQuestion];
        const oldIndex = items.indexOf(active.id as string);
        const newIndex = items.indexOf(over.id as string);

        copy[currentQuestion] = arrayMove(items, oldIndex, newIndex);
        return copy;
      });
    }
  };

  // Function to check if the order is correct
  const checkAnswer = () => {
    const countries = answers[currentQuestion];
    const correctOrder = [...countries].slice().sort();
    if (JSON.stringify(countries) === JSON.stringify(correctOrder)) {
      setResult(
        "Correct! 🎉 You arranged the countries in alphabetical order."
      );
    } else {
      setResult("Oops! 😞 The countries are not in the correct order.");
    }
  };

  const goNext = () => {
    setResult(null);
    setCurrentQuestion((i) => Math.min(i + 1, questions.length - 1));
  };

  const goPrev = () => {
    setResult(null);
    setCurrentQuestion((i) => Math.max(i - 1, 0));
  };

  return (
    <div className="App">
      <h2>Arrange the countries in alphabetical order:</h2>
      <h3>{questions[currentQuestion].title}</h3>
      <DndContext collisionDetection={closestCenter} onDragEnd={onDragEnd}>
        <SortableContext
          items={answers[currentQuestion]}
          strategy={verticalListSortingStrategy}
        >
          <div style={{ width: 300, margin: "auto" }}>
            {answers[currentQuestion].map((country) => (
              <SortableItem key={country} id={country}>
                {country}
              </SortableItem>
            ))}
          </div>
        </SortableContext>
      </DndContext>

      <div
        style={{
          marginTop: 20,
          display: "flex",
          gap: 8,
          justifyContent: "center",
        }}
      >
        <button onClick={goPrev} disabled={currentQuestion === 0}>
          Prev
        </button>
        <button onClick={checkAnswer}>Submit</button>
        <button
          onClick={goNext}
          disabled={currentQuestion === questions.length - 1}
        >
          Next
        </button>
      </div>

      {result && (
        <div
          style={{
            marginTop: 20,
            padding: "10px 20px",
            backgroundColor: result.startsWith("Correct")
              ? "#4CAF50"
              : "#f44336",
            color: "white",
            borderRadius: 5,
            textAlign: "center",
          }}
        >
          {result}
        </div>
      )}
    </div>
  );
};

export default App;

