import React, { useState } from "react";
import { HexColorPicker } from "react-colorful";

export default function ColorPicker() {
const [color, setColor] = useState("#0077ffff");
const [showPicker, setShowPicker] = useState(false);

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
      <label style={{ fontWeight: 600 }}>Färg</label>
      <br></br>
      <div
        onClick={() => setShowPicker(!showPicker)}
        style={{
          width: "40px",
          height: "40px",
          backgroundColor: color,
          border: "2px solid #ccc",
          borderRadius: "4px",
          cursor: "pointer",
        }}
      ></div>
      {/* Color Picker */}
       {showPicker && (
        <div
          style={{
            position: "absolute",
            top: "50px",
            left: "0",
            zIndex: 10,
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
          }}
        >
          <HexColorPicker color={color} onChange={setColor} />
        </div>
      )}

      {/* Input Field */}
      <input
        type="text"
        value={color}
        onChange={(e) => setColor(e.target.value)}
        style={{
          width: "100px",
          padding: "0.5rem",
          border: "1px solid #ccc",
          borderRadius: "4px",
          fontFamily: "monospace",
        }}
      />
    </div>
  );
}