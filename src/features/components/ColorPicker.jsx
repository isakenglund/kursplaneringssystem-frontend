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
    <div className="flex items-centered gap-4">

      <label className="block text-sm font-medium text-gray-600">Färg</label>
      <br></br>
      {/* Color Box */}
      <div
        ref={boxRef}
        onClick={() => setShowPicker(!showPicker)}
        className="w-10 h-10 border-2 border-gray-300 rounded cursor-pointer"
        style={{ backgroundColor: color }}
      ></div>

      {/* Input Field */}
      <input
        ref={inputRef}
        type="text"
        value={color}
        onChange={(c) => {
          let value = c.target.value;

          if (!value.startsWith("#")) {
            value = "#" + value;
          }
          if (value.length > 7) {
            value = value.slice(0, 7);
          }
          if (!/^#[0-9A-Fa-f]{6}$/.test(value)) {
            value = value.replace(/[^#0-9A-Fa-f]/g, "");
          }
          setColor(value);
          sendColorHex(value);
        }}
        onBlur={() => {
          if (color.length<4 || color.trim() === "") {
            setColor("#0077ff");
            sendColorHex("#0077ff");
          }
        }}
        className="w-24 p-2 border border-gray-300 rounded font-mono"
      />

      {/* Color Picker */}

      {showPicker && (
        <div ref={pickerRef} className="absolute mt-12 ms-15">
          <HexColorPicker
            color={color}
            onChange={(value) => {
              setColor(value);
              sendColorHex(value);
            }}
          />
        </div>
      )}
    </div>
  );
}