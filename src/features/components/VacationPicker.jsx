import React, { useEffect, useState } from "react";

/**
 * Vacation date picker input.
 * Simple controlled component for selecting a vacation date and reporting it back to the parent state.
 */
export default function VacationPicker({setVacationDate, vacationDate}) {
  return (
    <div className="flex gap-x-4">
      <label >Välj datum:</label>
      <input 
        type="date"
        value={vacationDate}
        onChange={(e) => setVacationDate(e.target.value)}
      />
    </div>
  );
}