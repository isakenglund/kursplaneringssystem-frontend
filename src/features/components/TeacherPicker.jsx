import {useEffect, useRef, useState} from "react";
import {useGetTeachers} from "../hooks.js";
import { CheckIcon, UserPlusIcon } from "@heroicons/react/20/solid";


export default function TeacherPicker({
                                          selectedTeachers,
                                          setSelectedTeachers,
                                      }) {

    const {teachers, loading, err} = useGetTeachers();
    const [open, setOpen] = useState(false);
    const containerRef = useRef(null);
    const isSelected = (teacher) => selectedTeachers.some((t) => t.id === teacher.id);
    const toggleTeacher = (teacherToToggle) => {
        if (isSelected(teacherToToggle)) {
            setSelectedTeachers((prev) =>
                prev.filter((t) => t.id !== teacherToToggle.id)
            );
        } else {
            setSelectedTeachers((prev) => [...prev, teacherToToggle]);
        }
    };


    useEffect(() => {
        const handleClickOutside = (e) => {
            if (containerRef.current && !containerRef.current.contains(e.target)) {
                setOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);

    }, [containerRef]);

    const unSelectedTeachers = teachers ? teachers.filter(teacher => !isSelected(teacher)) : [];

    return (
        <div className="relative mb-6" >
            <button
                type={"button"}
                onClick={() => setOpen(prev => !prev)}
                className="p-2 rounded-full bg-white shadow-sm hover:bg-gray-50 transition duration-150 ease-in-out relative"
            >
                <UserPlusIcon className="h-6 w-6 text-gray-700" aria-hidden="true" />
                {selectedTeachers.length > 0 && (
                    <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
                        {selectedTeachers.length}
                    </span>
                )}
            </button>

            {open && (
                <div
                    ref={containerRef}
                    className="absolute z-20 mt-2 w-64 right-0 border border-gray-200 rounded-lg bg-white shadow-xl max-h-80 overflow-y-auto divide-y divide-gray-100">
                    {selectedTeachers.length > 0 && (
                        <div className="p-2 bg-gray-50">
                            <h3 className="text-xs font-medium text-gray-500 uppercase px-2 mb-1">Valda ({selectedTeachers.length})</h3>
                            {selectedTeachers.map((teacher) => (
                                <div
                                    key={teacher.id}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        toggleTeacher(teacher);
                                    }}
                                    className="flex items-center justify-between px-2 py-1 text-sm cursor-pointer select-none bg-blue-100 text-blue-900 rounded my-1 hover:bg-blue-200"
                                >
                                    <span>{teacher.firstName} {teacher.lastName}</span>
                                    <CheckIcon className="h-4 w-4 text-blue-600" aria-hidden="true"/>
                                </div>
                            ))}
                        </div>
                    )}
                    {loading ? (
                        <div className="px-3 py-2 text-gray-500">Laddar lärare...</div>
                    ) : err ? (
                        <div className="px-3 py-2 text-red-500">Kunde inte hämta lärare</div>
                    ) : (
                        <>
                            {selectedTeachers.length > 0 && unSelectedTeachers.length > 0 && (
                                <h3 className="text-xs font-medium text-gray-500 uppercase px-4 pt-2">Övriga</h3>
                            )}

                            {unSelectedTeachers.map((teacher) => (
                                <div
                                    key={teacher.id}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        toggleTeacher(teacher);
                                    }}
                                    className="flex items-center justify-between px-4 py-2 text-sm cursor-pointer select-none text-gray-900 hover:bg-gray-100"
                                >
                                    <span>{teacher.firstName} {teacher.lastName}</span>
                                </div>
                            ))}

                            {selectedTeachers.length === 0 && unSelectedTeachers.length === 0 && (
                                <div className="px-4 py-2 text-gray-500 text-sm">Inga lärare tillgängliga.</div>
                            )}
                        </>
                    )}

                </div>
            )}

        </div>
    )
}
