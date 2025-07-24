import React, { useRef, useState } from "react";

const Test = () => {
  const draggableDiv = useRef(false);
  const [width, setWidth] = useState(300);
  const startDragging = (e) => {
    e.preventDefault();
    draggableDiv.current = true;
  };
  const stopDragging = () => {
    draggableDiv.current = false;
  };
  const handleDragging = (e) => {
    if (draggableDiv.current == true) {
      const newWidth = e.clientX;
      if (newWidth > 300 && newWidth < 600) {
        setWidth(newWidth);
      }
    }
  };
  return (
    <div className="flex"  onMouseMove={handleDragging}
      onMouseUp={stopDragging}>
      <div
        ref={draggableDiv}
        style={{ width: `${width}px` }}
        className="h-screen bg-black"
      >
        h
      </div>
      <div
        className="w-2 bg-blue-600 h-screen"
        onMouseDown={startDragging}
      ></div>
      <div className="bg-red-400 w-full h-screen">i</div>
    </div>
  );
};

export default Test;
