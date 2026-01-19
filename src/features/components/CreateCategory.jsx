import React, { useState } from "react";
import ColorPicker from "./ColorPicker.jsx";
import { useSaveCourse, useSaveVacation, useSaveMisc } from "../hooks.js";
import VacationPicker from "./VacationPicker.jsx";
import { alertCustom } from "../functions/alertFunctions.jsx";

/**
 * Category creation modal.
 * Handles creating new categories (e.g., course, misc, vacation) by collecting form input,
 * validating required fields, and calling parent callbacks to persist and refresh data.
 */
export default function CreateCategory({ setIsCategoryModalOpen, setVacationDate, vacationDate, onCreated, refetchVacation , refetchCourse, refetchMisc, refetchAllCategories}) {

    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0"); // month is 0-indexed
    const dd = String(today.getDate()).padStart(2, "0");
    const todayDate = `${yyyy}-${mm}-${dd}`;

    const [name, setName] = useState("");
    const [colorHex, setColorHex] = useState("#0077ff");
    const [categoryType, setCategoryType] = useState("course")
    const [numOfStudents, setNumOfStudents] = useState(0);
    const [startDate, setStartDate] = useState(todayDate);
    const [endDate, setEndDate] = useState(todayDate);

    const { save: saveMisc } = useSaveMisc();
    const { save: saveVacation } = useSaveVacation();
    const { save: saveCourse } = useSaveCourse();

    const startAfterEnd = new Date(startDate) > new Date(endDate);

    const handleColorHex = (colorHex) => {
        setColorHex(colorHex);
    }

    async function handleCreateClick() {
        if(!name.trim() && categoryType!=="vacation") {
            await alertCustom("Vänligen fyll i ett kategori namn.")
            return;

        }
        try {
            if (categoryType === "course") {
                const course = {
                    type: categoryType,
                    name: name,
                    colorHex: colorHex,
                    numOfStudents: numOfStudents,
                    startDate: startDate,
                    endDate: endDate
                }
                await saveCourse(course);
                await refetchCourse();
                await refetchAllCategories();
            } else if (categoryType === "vacation") {
                await saveVacation({ date: vacationDate });
                await refetchVacation();
            } else if (categoryType === "misc") {
                await saveMisc({ type: "MISC", name, colorHex });
                await refetchMisc();
                await refetchAllCategories();
            } else {
                console.warn("Unknown categoryType:", categoryType);
                return;
            }

            await onCreated?.();

            setIsCategoryModalOpen(false);
        } catch (e) {
            console.error("Kunde inte spara", e);
        }
    }

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex justify-center items-center">
            <div className="bg-white p-6 rounded-lg shadow-xl w-96 gap-y-4">
                <h3 className="text-xl font-bold mb-4">Skapa kategori</h3>
                {categoryType !== "vacation" && categoryType === "course" &&(
                    <div className="space-y-1">
                        <label className="block text-sm font-medium text-gray-700">Namn på kategorin:</label>
                        <input
                            type="text"
                            value={name}
                            className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                            placeholder="T.ex Datasystem"
                            maxLength={50}
                            onChange={(t) => {
                                setName(t.target.value)
                            }}
                        />
                        <p className={`${name.length === 50
                                        ? "text-xs text-red-500"
                                        : "text-xs text-gray-500 "
                                        }`}>
                            {name.length} / 50 
                            {name.length === 50 && (<span> Max längd nådd</span>)}
                        </p>
                    </div>
                )}
                 {categoryType !== "vacation" && categoryType === "misc" &&(
                    <div className="space-y-1">
                        <label className="block text-sm font-medium text-gray-700">Namn på kategorin:</label>
                        <input
                            type="text"
                            value={name}
                            className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                            placeholder="T.ex Utbildningsmöten"
                            onChange={(t) => {
                                setName(t.target.value)
                            }}
                        />
                    </div>
                )}
                {categoryType === "vacation" && (
                    <VacationPicker
                        setVacationDate={setVacationDate}
                        vacationDate={vacationDate}
                    />
                )}
                <div className="flex gap-6 items-center text-sm text-gray-700 my-3">
                    <label className="flex items-center gap-2">
                        <input
                            type='radio'
                            name='categoryType'
                            value='course'
                            checked={categoryType === "course"}
                            onChange={(e) => {
                                setCategoryType(e.target.value);
                                setStartDate(todayDate);
                                setEndDate(todayDate);
                            }}
                        /> Kurs
                    </label>
                    <label className="flex items-center gap-2">
                        <input
                            type='radio'
                            name='categoryType'
                            value='misc'
                            checked={categoryType === "misc"}
                            onChange={(e) => {
                                setCategoryType(e.target.value);
                                setStartDate(todayDate);
                                setEndDate(todayDate)
                            }}
                        /> Övrigt
                    </label>
                    <label className="flex items-center gap-2">
                        <input
                            type='radio'
                            name='categoryType'
                            value='vacation'
                            checked={categoryType === "vacation"}
                            onChange={(e) => {
                                setCategoryType(e.target.value);
                                setStartDate(todayDate);
                                setEndDate(todayDate)
                            }}
                        /> Semester
                    </label>
                </div>

                {categoryType !== "vacation" && (
                    <ColorPicker handleColorHex={handleColorHex} />
                )}

                {categoryType === "course" && (
                    <div className="space-y-3">
                        <div className="space-y-1">
                            <label className="block text-sm font-medium text-gray-700">Antal studenter:</label>
                            <input
                                type="text"
                                inputMode={"numeric"}
                                value={numOfStudents}
                                min={0}
                                max={1000}
                                step={1}
                                onFocus={(e) => {
                                    let value = e.target.value;
                                    let numberValue = parseInt(value);
                                    if(numberValue === 0) {
                                        numberValue = "";
                                    }
                                    setNumOfStudents(numberValue);
                                }}
                                onChange={(e) => {
                                    const max = 1000;
                                    let value = e.target.value;

                                    value = value.replace(/[^0-9]/g, "");

                                    if (value === "") {
                                        setNumOfStudents("");
                                        return;
                                    }
                                    const numberValue = parseInt(value);
                                    if (isNaN(numberValue)) return;
                                    if (numberValue > max) {
                                        setNumOfStudents(max);
                                        return;
                                    }
                                    setNumOfStudents(numberValue);
                                }}
                                onBlur={(e) => {
                                    if (e.target.value.trim() === "") {
                                        setNumOfStudents(0);
                                    }
                                }}

                                className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm
                                   focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="block text-sm font-medium text-gray-700">Startdatum:</label>
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm
                                   focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="block text-sm font-medium text-gray-700">Slutdatum</label>
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm
                                   focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                        {startAfterEnd && (
                            <p className="text-red-600 text-sm">⚠️ Error: Startdatum är efter slutdatum</p>
                        )}

                    </div>
                )}
                <div className="flex justify-end gap-2 mt-4">
                    <button 
                        className={`px-4 py-2 rounded text-white transition
                                        ${startAfterEnd
                                        ? "bg-red-600 cursor-not-allowed"
                                        : "bg-blue-600 hover:bg-blue-700"
                                        }`}
                        onClick={handleCreateClick}
                        disabled={startAfterEnd}>
                            Skapa
                    </button>
                    <button className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition"
                            onClick={() => setIsCategoryModalOpen(false)}>Avbryt
                    </button>
                </div>
            </div>
        </div>
    )
}
