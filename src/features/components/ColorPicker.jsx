import React, { useState, useRef, useEffect } from "react";
import { HexColorPicker } from "react-colorful";

export default function ColorPicker({ handleColorHex }) {
  const [color, setColor] = useState("#0077ff");
  const [showPicker, setShowPicker] = useState(false);

  const pickerRef = useRef(null);
  const boxRef = useRef(null);
  const inputRef = useRef(null);

  const sendColorHex = (value) => {
    handleColorHex(value);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      // If click is inside any of these, do NOT close
      if (
        pickerRef.current?.contains(event.target) ||
        boxRef.current?.contains(event.target) ||
        inputRef.current?.contains(event.target)
      ) {
        return;
      }

      // Click is outside all three → close
      setShowPicker(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="flex flex-col  gap-4">
      <div className="flex gap-4 justify-start">
        <label className="block text-sm font-medium text-gray-600">Färg</label>
        <br></br>
        {/* Color Box */}
        <div
          onClick={() => setShowPicker(!showPicker)}
          className="w-10 h-10 border-2 border-gray-300 rounded cursor-pointer"
          style={{ backgroundColor: color }}
        ></div>

        {/* Input Field */}
        <input
          type="text"
          value={color}
          onChange={(c) => {
            setColor(c.target.value);
            sendColorHex(c.target.value);
          }}
          className="w-24 p-2 border border-gray-300 rounded font-mono"
        />
      </div>
      {/* Color Picker */}
      <div
        ref={pickerRef}
        className="absolute mt-12 ms-15"
      >
        {showPicker && (
          <HexColorPicker
            color={color}
            onChange={(value) => {
              setColor(value);
              sendColorHex(value);
            }}
          />
        )}
      </div>
    </div>
  );
}