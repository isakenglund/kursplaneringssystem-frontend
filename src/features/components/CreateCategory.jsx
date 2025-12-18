import React, { useState } from "react";
import ColorPicker from "./ColorPicker.jsx";
import { useSaveCourse, useSaveVacation, useSaveMisc } from "../hooks.js";
import VacationPicker from "./VacationPicker.jsx";

export default function CreateCategory({ setIsCategoryModalOpen, setVacationDate, vacationDate }) {

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

    const {data: savedMisc, loading: savingMisc, err: miscSaveErr, save: saveMisc} = useSaveMisc();
    const course = {
        type: categoryType,
        name: name,
        colorHex: colorHex,
        numOfStudents: numOfStudents,
        startDate: startDate,
        endDate: endDate
    }

    const { data: savedCourse, loading: savingCourse, err: courseSaveErr, save: saveVacation } = useSaveVacation();
    const { data: savedVacation, loading: savingVacation, err: vacationSaveErr, save: saveCourse } = useSaveCourse();

    const handleColorHex = (colorHex) => {
        setColorHex(colorHex);
    }

    async function handleCreateClick() {
        if(!name.trim() && categoryType!=="vacation") {
            alert("Vänligen fyll i ett kategori namn.")
            return;
        }
        switch (categoryType) {
            case "course":
                console.log(course);
                try {
                    await saveCourse(course);
                    setIsCategoryModalOpen(false);
                } catch (e) {
                    console.error("Kunde inte spara", e);
                }
                break;

            case "vacation":
                try {
                    await saveVacation({ date: vacationDate });
                    setIsCategoryModalOpen(false);
                } catch (e) {
                    console.error("Kunde inte spara", e);
                }
                break;

            case "misc":
                try {
                    const miscPayLoad = {
                        type: "MISC",
                        name: name,
                        colorHex: colorHex
                    }
                    console.log(miscPayLoad)
                    await saveMisc(miscPayLoad);

                setIsCategoryModalOpen(false);
                } catch (e) {
                    console.error("Kunde inte spara", e);
                }
                break;

            default:
                console.warn("Unknown categoryType:", categoryType);
        }
    }

    const isLoading = savingCourse || savingMisc;

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex justify-center items-center">
            <div className="bg-white p-6 rounded-lg shadow-xl w-96 gap-y-4">
                <h3 className="text-xl font-bold mb-4">Skapa category</h3>
                {/* Kategorinamn */}
                {categoryType !== "vacation" && (
                    <div className="space-y-1">
                        <label className="block text-sm font-medium text-gray-700">Namn på kategorin:</label>
                        <input
                            type="text"
                            value={name}
                            className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                            placeholder="T.ex Datas"
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
                {/* Radioknappar */}
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

                {/* Extra fält för kurs */}
                {categoryType === "course" && (
                    <div className="space-y-3">
                        {/* Antal studenter */}
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
                        {/* Startdatum */}
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
                        {/* Slutdatum */}
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
                        {/* Datum-varningar */}
                        {new Date(startDate) > new Date(endDate) && (
                            <p className="text-red-600 text-sm">⚠️ Startdatum är efter slutdatum</p>
                        )}

                        {new Date(startDate) < new Date(todayDate) && (
                            <p className="text-red-600 text-sm">⚠️ Startdatum är före dagens datum</p>
                        )}
                    </div>
                )}
                <div className="flex justify-end gap-2 mt-4">
                    <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                            onClick={handleCreateClick}>Skapa
                    </button>
                    <button className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition"
                            onClick={() => setIsCategoryModalOpen(false)}>Avbryt
                    </button>
                </div>
            </div>
        </div>
    )
}
