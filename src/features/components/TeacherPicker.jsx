import {useEffect, useRef, useState} from "react";

import { CheckIcon, UserPlusIcon, PlusIcon, TrashIcon } from "@heroicons/react/20/solid";


export default function TeacherPicker({
                             teachers,
                            loading,
                            err,
                                          selectedTeachers,
                                          setSelectedTeachers,
                                          onCreate,
                                          onDelete,
                                      }) {

    //console.log("teachers in TeacherPicker:", teachers);
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

    const handleDeleteClick = (e, teacher) => {
        e.stopPropagation();
        if (onDelete) {
            onDelete(teacher);
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
        <div className="relative mb-6 inline-block w-min" ref={containerRef}>
            <button
                type={"button"}
                onClick={() => setOpen(prev => !prev)}
                className="p-2 rounded-full bg-white shadow-sm hover:bg-gray-50 transition duration-150 ease-in-out relative"
            >
                <UserPlusIcon className="h-6 w-6 text-gray-700" aria-hidden="true"/>
                {selectedTeachers.length > 0 && (
                    <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
                        {selectedTeachers.length}
                    </span>
                )}
            </button>

            {open && (
                <div className="absolute z-20 mt-2 right-0 w-72 border border-gray-200 rounded-lg bg-white shadow-xl max-h-96 flex flex-col overflow-hidden">
                    <div className="overflow-y-auto flex-1 divide-y divide-gray-100">

                        {selectedTeachers.length > 0 && (
                            <div className="p-2 bg-gray-50">
                                <h3 className="text-xs font-medium text-gray-500 uppercase px-2 mb-1">
                                    Valda ({selectedTeachers.length})
                                </h3>
                                {selectedTeachers.map((teacher) => (
                                    <div
                                        key={teacher.id}
                                        onClick={() => toggleTeacher(teacher)}
                                        className="group flex items-center justify-between px-2 py-1 text-sm cursor-pointer select-none bg-blue-100 text-blue-900 rounded my-1 hover:bg-blue-200"
                                    >
                                        <div className="flex items-center gap-2">
                                            <span>{teacher.firstName} {teacher.lastName}</span>
                                            <CheckIcon className="h-4 w-4 text-blue-600" aria-hidden="true" />
                                        </div>
                                        <button
                                            onClick={(e) => handleDeleteClick(e, teacher)}
                                            className="hidden group-hover:block p-1 text-blue-400 hover:text-red-600 rounded"
                                            title="Radera lärare permanent"
                                        >
                                            <TrashIcon className="h-4 w-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        {loading ? (
                            <div className="px-3 py-4 text-center text-gray-500 text-sm">Laddar lärare...</div>
                        ) : err ? (
                            <div className="px-3 py-4 text-center text-red-500 text-sm">Kunde inte hämta lärare</div>
                        ) : (
                            <>
                                {selectedTeachers.length > 0 && unSelectedTeachers.length > 0 && (
                                    <h3 className="text-xs font-medium text-gray-500 uppercase px-4 pt-2 sticky top-0 bg-white">
                                        Övriga
                                    </h3>
                                )}

                                {unSelectedTeachers.map((teacher) => (
                                    <div
                                        key={teacher.id}
                                        onClick={() => toggleTeacher(teacher)}
                                        className="group flex items-center justify-between px-4 py-2 text-sm cursor-pointer select-none text-gray-900 hover:bg-gray-100"
                                    >
                                        <span>{teacher.firstName} {teacher.lastName}</span>

                                        <button
                                            onClick={(e) => handleDeleteClick(e, teacher)}
                                            className="text-gray-300 hover:text-red-500 p-1 rounded transition-colors"
                                            title="Radera lärare permanent"
                                        >
                                            <TrashIcon className="h-4 w-4" />
                                        </button>
                                    </div>
                                ))}
                            </>
                        )}
                    </div>

                    {onCreate && (
                        <button
                            type="button"
                            onClick={() => {
                                setOpen(false);
                                onCreate();
                            }}
                            className="flex items-center justify-start gap-2 w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 border-t border-gray-200 text-sm font-medium text-indigo-600 transition-colors"
                        >
                            <PlusIcon className="h-5 w-5 bg-indigo-100 text-indigo-600 rounded-full p-0.5" aria-hidden="true" />
                            <span>Lägg till ny lärare</span>
                        </button>
                    )}

                </div>
            )}

        </div>
    )
}
