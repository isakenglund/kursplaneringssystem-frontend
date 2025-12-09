import React, {useState} from "react";
import ColorPicker from "./ColorPicker.jsx";
import {useSaveCourse} from "../hooks.js";

export default function CreateCategory({setIsCategoryModalOpen, closeModal}) {


    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0"); // month is 0-indexed
    const dd = String(today.getDate()).padStart(2, "0");
    const todayDate = `${yyyy}-${mm}-${dd}`;


    const [name, setName] = useState("");
    const [colorHex, setColorHex] = useState("");
    const [categoryType, setCategoryType] = useState("course")
    const [hp, setHp] = useState(0);
    const [numOfStudents, setNumOfStudents] = useState(0);
    const [startDate, setStartDate] = useState(todayDate);
    const [endDate, setEndDate] = useState(todayDate);

    const course = {
        type: categoryType,
        name: name,
        colorHex: colorHex,
        hp: hp,
        numOfStudents: numOfStudents,
        startDate: startDate,
        endDate: endDate
    }

    const {data: savedCourse, loading: savingCourse, err: courseSaveErr, save} = useSaveCourse();

    const handleColorHex = (colorHex) => {
        setColorHex((colorHex));
    }

    async function handleCreateClick() {
        try {
            await save(course);
            setIsCategoryModalOpen(false);
        } catch (e) {
            console.error("Kunde inte spara", e);
        }
    }


    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex justify-center items-center">
            <div className="bg-white p-6 rounded-lg shadow-xl w-96 gap-y-4">
                <h3 className="text-xl font-bold mb-4">Skapa category</h3>
                {/* Kategorinamn */}
                <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700">Namn på kategorin:</label>
                    <input
                        type="text"
                        value={name}
                        className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        placeholder="T.ex Datasystem, Matematik"
                        onChange={(t) => {
                            setName(t.target.value)
                        }}
                    />
                </div>
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
                </div>

                <ColorPicker onCallback={handleColorHex}/>

                {/* Extra fält för kurs */}
                {categoryType === "course" && (
                    <div className="space-y-3">
                        {/* HP */}
                        <div className="space-y-1">
                            <label className="block text-sm font-medium text-gray-700">HP:</label>
                                <input
                                    type="number"
                                    value={hp}
                                    onChange={(e) => setHp(parseFloat(e.target.value))}
                                    min={0}    // min HP
                                    max={180}   // max HP
                                    step={0.5} // increment
                                    className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm
                                   focus:ring-blue-500 focus:border-blue-500"
                                />
                        </div>
                        {/* Antal studenter */}
                        <div className="space-y-1">
                            <label className="block text-sm font-medium text-gray-700">Antal studenter:</label>
                            <input
                                type="number"
                                value={numOfStudents}
                                min={0}
                                max={1000}
                                step={1}
                                onChange={(e) => setNumOfStudents(parseFloat(e.target.value))}
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
