import React, { useState } from "react";
import {useSaveTeacher} from "../hooks.js";

/**
 * Modal dialog for creating a new teacher/person.
 * Collects teacher details and persists them via a hook.
 * Notifies the parent when the teacher is created so the UI can refresh and/or auto-select them.
 */
export default function CreateTeacherModal({ onClose, onSaved }) {
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const { save } = useSaveTeacher();


    const handleFormSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const newTeacherData = {
            firstName: firstName,
            lastName: lastName,
            email: email,
        };

        try {
            const savedTeacher = await save(newTeacherData);

            console.log("Sparad lärare:", savedTeacher);

            if (onSaved) {
                onSaved(savedTeacher);
            }
        } catch (error) {
            console.error("Fel vid skapande av lärare", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-[60] flex justify-center items-center">
            <div className="bg-white p-6 rounded-lg shadow-xl w-96">
                <h3 className="text-xl font-bold mb-4">Skapa ny lärare</h3>

                <form onSubmit={handleFormSubmit} className="flex flex-col gap-4">
                    <div>
                        {/* FÖRNAMN */}
                        <label className="block text-sm font-medium text-gray-700">Förnamn</label>
                        <input
                            type="text"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                            placeholder="T.ex. Anna"
                            autoFocus
                            required
                        />

                        {/* EFTERNAMN */}
                        <label className="block text-sm font-medium text-gray-700 mt-2">Efternamn</label>
                        <input
                            type="text"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                            placeholder="T.ex. Andersson"
                            required
                        />

                        {/* EMAIL */}
                        <label className="block text-sm font-medium text-gray-700 mt-2">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                            placeholder="anna.andersson@skola.se"
                        />
                    </div>

                    <div className="flex justify-end gap-2 mt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition disabled:bg-blue-300"
                        >
                            {loading ? "Sparar..." : "Spara"}
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