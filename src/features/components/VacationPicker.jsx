import React, { useEffect, useState } from "react";

import useGetCourses, { useSaveVacation, useDeleteVacation } from "../hooks.js";

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