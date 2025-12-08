import {useEffect, useState} from "react";
import {useGetTeachers} from "../hooks.js";


export default function TeacherPicker({
                                          selectedTeachers,
                                          setSelectedTeachers,
                                      }) {

    const { teachers, loading, err } = useGetTeachers();
    const [open, setOpen] = useState(false);


    useEffect(() => {
        /*function handleCLickOutside(e) {

        }

        function toggleTeacher(teacher) {

        }*/
    })

    return (
        <div className="relative mb-6">
            <button
                type={"button"}
                onClick={() => setOpen(prev => !prev)}
                className="w-full border rounded-md px-3 py-2 text-left bg-white shadow-sm"
            >
                {open ? "Close" : "Open"}
            </button>

            {open && (
                <div className="absolute z-20 mt-2 w-full border rounded-md bg-white shadow-lg max-h-60 overflow-y-auto">
                    {loading ? (
                        <div className="px-3 py-2 text-gray-500">Laddar lärare...</div>
                    ) : err ? (
                        <div className="px-3 py-2 text-red-500">Kunde inte hämta lärare</div>
                    ) : (
                        teachers.map(teacher => (
                            <div
                                key={teacher.id}
                                className="px-3 py-2 cursor-pointer hover:bg-gray-100"
                            >
                                {teacher.name}
                            </div>
                        ))
                    )}
                </div>
            )}

        </div>
    )
}
