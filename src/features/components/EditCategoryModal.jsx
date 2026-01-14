import React, {useState, useEffect} from "react";
import ColorPicker from "./ColorPicker.jsx";

/**
 * Modal dialog for editing an existing category (course or misc).
 * Initializes form state from the selected category, validates updates, and returns
 * the updated payload to the parent via callbacks for persistence.
 */
export default function EditCategoryModal({categoryToEdit, onClose, onSaved}) {

    const isCourse = (categoryToEdit.type || "").toUpperCase() === "COURSE";

    const [name, setName] = useState("");
    const [colorHex, setColorHex] = useState("#0077ff");

    const [numOfStudents, setNumOfStudents] = useState(0);
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    useEffect(() => {
        if(categoryToEdit){
            setName(categoryToEdit.name ?? "");
            setColorHex(categoryToEdit.colorHex ?? "#0077ff");

            if(isCourse) {
                setNumOfStudents(categoryToEdit.numOfStudents ?? 0);

                const start = categoryToEdit.startDate
                    ? String(categoryToEdit.startDate).split('T')[0]
                    : "";
                const end = categoryToEdit.endDate
                    ? String(categoryToEdit.endDate).split('T')[0]
                    : "";

                setStartDate(start);
                setEndDate(end);
            }
        }
    }, [categoryToEdit, isCourse]);

    const handleColorHex = (color) => {
        setColorHex(color);
    }

    function handleFormSubmit(e) {
        e.preventDefault();
        e.stopPropagation();

        if(!name.trim()){
            alert("Kategorin måste ha ett namn!");
            return;
        }

        const updateData = {
            ...categoryToEdit,
            name: name,
            colorHex: colorHex,
        }

        if(isCourse){
            if (new Date(startDate) > new Date(endDate)) {
                alert("Startdatum kan inte vara efter slutdatum!")
                return;
            }
            updateData.numOfStudents = parseInt(numOfStudents);
            updateData.startDate = startDate;
            updateData.endDate = endDate;
        }

        onSaved(updateData);
    }

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex justify-center items-center">
            <div className="bg-white p-6 rounded-lg shadow-xl w-96 gap-y-4 max-h-[90vh] overflow-y-auto">
                <h3 className="text-xl font-bold mb-4">
                    Redigera {isCourse ? "kurs" : "kategori"}: {categoryToEdit.name}
                </h3>

                <form onSubmit={handleFormSubmit} className="space-y-4">
                    {/* Gemensamt fält: Namn */}
                    <div className="space-y-1">
                        <label className="block text-sm font-medium text-gray-700">Namn:</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                            autoFocus
                        />
                    </div>

                    <div>
                        <ColorPicker
                            handleColorHex={handleColorHex}
                            categoryToEdit={categoryToEdit}
                        />
                    </div>

                    {/* Kurs-specifika fält */}
                    {isCourse && (
                        <div className="space-y-3 pt-2 border-t border-gray-100">

                            {/* Antal studenter */}
                            <div className="space-y-1">
                                <label className="block text-sm font-medium text-gray-700">Antal studenter:</label>
                                <input
                                    type="text"
                                    inputMode="numeric"
                                    value={numOfStudents}
                                    className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                    onChange={(e) => {
                                        const max = 1000;
                                        let value = e.target.value.replace(/[^0-9]/g, "");
                                        if (value === "") {
                                            setNumOfStudents("");
                                            return;
                                        }
                                        let numberValue = parseInt(value);
                                        if (numberValue > max) numberValue = max;
                                        setNumOfStudents(numberValue);
                                    }}
                                    onBlur={() => {
                                        if (String(numOfStudents).trim() === "") setNumOfStudents(0);
                                    }}
                                />
                            </div>

                            {/* Datum */}
                            <div className="space-y-1">
                                <label className="block text-sm font-medium text-gray-700">Startdatum:</label>
                                <input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="block text-sm font-medium text-gray-700">Slutdatum:</label>
                                <input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>

                            {/* Varningar */}
                            {startDate && endDate && new Date(startDate) > new Date(endDate) && (
                                <p className="text-red-600 text-sm">⚠️ Startdatum är efter slutdatum</p>
                            )}
                        </div>
                    )}

                    <div className="flex justify-end gap-2 mt-6 pt-2 border-t border-gray-200">
                        <button
                            type="submit"
                            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                        >
                            Spara
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition"
                        >
                            Avbryt
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );

}