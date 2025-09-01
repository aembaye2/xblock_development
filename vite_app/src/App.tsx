import React, { useState } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

// Initial list of countries
const initialCountries = ["Brazil", "Argentina", "Canada", "Denmark"];

const App = () => {
  // State to manage the list of countries
  const [countries, setCountries] = useState(initialCountries);
  const [result, setResult] = useState(null);  // Store result after submission

  // Function to handle the drag-and-drop reordering
  const onDragEnd = (result) => {
    const { destination, source } = result;

    // If the item was dropped outside the list, do nothing
    if (!destination) return;

    // If the item is dropped in the same position, do nothing
    if (destination.index === source.index) return;

    const newCountries = Array.from(countries);
    // Move the item in the list
    const [removed] = newCountries.splice(source.index, 1);
    newCountries.splice(destination.index, 0, removed);

    setCountries(newCountries);
  };

  // Function to check if the order is correct
  const checkAnswer = () => {
    const correctOrder = [...countries].sort();
    if (JSON.stringify(countries) === JSON.stringify(correctOrder)) {
      setResult("Correct! 🎉 You arranged the countries in alphabetical order.");
    } else {
      setResult("Oops! 😞 The countries are not in the correct order.");
    }
  };

  return (
    <div className="App">
      <h2>Arrange the countries in alphabetical order:</h2>
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="droppable">
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              style={{ width: 300, margin: "auto" }}
            >
              {countries.map((country, index) => (
                <Draggable key={country} draggableId={country} index={index}>
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      style={{
                        ...provided.draggableProps.style,
                        padding: 10,
                        margin: 10,
                        backgroundColor: "#f4f4f4",
                        borderRadius: 5,
                        border: "1px solid #ccc",
                        cursor: "move",
                      }}
                    >
                      {country}
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      <div style={{ marginTop: 20 }}>
        <button onClick={checkAnswer}>Submit</button>
      </div>

      {result && (
        <div
          style={{
            marginTop: 20,
            padding: "10px 20px",
            backgroundColor: result.startsWith("Correct") ? "#4CAF50" : "#f44336",
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

