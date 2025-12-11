import React, {useState} from "react";
import {formatDate} from "@fullcalendar/core";
import TeacherPicker from "./TeacherPicker.jsx";
import useGetCourses, {useSaveCourseEvent} from "../hooks.js";
import { useState } from "react";
import { createEventId } from "../../event-utils.js";
import { formatDate } from "@fullcalendar/core";
import useGetCourses, { useSaveCourse, useSaveCourseEvent } from "../hooks.js";


export default function CreateEvent({
    draggableContainerRef,
    currentEvents,
    externalEvents,
    openModal,
    closeModal,
    isModalOpen,
    removeExternalEvent,
    addExternalEvent,
}) {

    const [categoryId, setCategoryId] = useState('')
    const [categoryName, setCategoryName] = useState('')
    const { data: listOfCourses, loading: loadingCourses, err: coursesGetErr } = useGetCourses();
    const { data: savedCourse, loading: savingCourse, err: courseSaveErr, save } = useSaveCourseEvent();

    const [description, setDescription] = useState('')
    const [endDate, setEndDate] = useState(new DateTime())
    const [name, setName] = useState('')
    const [startDate, setStartDate] = useState(new DateTime())
    const [courseId, setCourseId] = useState('')
    const [selectedTeachers, setSelectedTeachers] = useState([])

  function SidebarEvent({ event }) {
        return (
            <>
            <li className="text-xs text-gray-600 bg-gray-100 p-2 rounded">
                <b>{formatDate(event.start, { year: 'numeric', month: 'short', day: 'numeric' })}</b>
                <span className="block italic">{event.title}</span>
            </li>
            </>
        )
    }

    async function handleFormSubmit(e) {
        e.preventDefault();

        if (!name) {
            alert('Vänligen fyll i en titel');
            return;
        }

        const courseEvent = {
            name: name,
            description: description,
            startDate: startDate,
            endDate: endDate,
            courseId: courseId,
        }

        try {
            await save(courseEvent);

            closeModal();
            setName('');
            setDescription('');

        } catch (e) {
            console.error("Kunde inte spara eventet:", e);
            alert("Ett fel inträffade vid sparande.");
        }
    }

    return (
        <div>
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex justify-center items-center">
                    <div className="bg-white p-6 rounded-lg shadow-xl w-96">
                        <h3 className="text-xl font-bold mb-4">Skapa event för {categoryName}</h3>
                        <form onSubmit={handleFormSubmit} className="flex flex-col gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Titel</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="T.ex. Föreläsning"
                                    autoFocus
                                />
                                <label className="block text-sm font-medium text-gray-700">Beskrivning</label>
                                <input
                                    type="text"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="T.ex. Föreläsning om "
                                    autoFocus
                                />
                            </div>
                            <div className="flex justify-end gap-2 mt-4">
                                <div className='mr-auto'>
                                    <TeacherPicker
                                        selectedTeachers={selectedTeachers}
                                        setSelectedTeachers={setSelectedTeachers}
                                    />
                                </div>
                                <button type="submit"
                                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                                >
                                    Lägg till händelse
                                </button>
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition"
                                >
                                    Avbryt
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}


            <div className='mb-2 mt-2'>
                <div id="external-events" ref={draggableContainerRef} className="space-y-2">
                    {listOfCourses.map(course => (

                        <div key={course.id}>
                            <div className="flex items-center justify-between mb-2">
                                <h2 className="text-base font-bold">{course.name}</h2>

                                    <button
                                        onClick={() => {
                                            setCategoryId(course.id);
                                            setCategoryName(course.name);
                                            setCourseId(course.id);
                                            openModal();
                                        }}
                                        className="bg-blue-600 text-white font-bold px-3 py-1 rounded shadow hover:bg-blue-700 transition"
                                    >
                                        +
                                    </button>


                            </div>

                            {course.event && course.event.length > 0 ? (
                                <div>
                                    {course.event.map(event => (
                                        <div
                                            key={event.id}
                                            data-event={JSON.stringify({
                                                id: event.id,
                                                title: event.name,
                                                start: event.startDate,
                                                end: event.endDate,
                                                courseId: course.id,
                                                color: course.colorHex || "#3b82f6",
                                            })}
                                            style={{ borderLeft: `4px solid ${course.colorHex || "#3b82f6"}` }} // fallback to Tailwind blue-500
                                            className={`mb-1 fc-event-external p-3 rounded border shadow-sm text-sm font-medium transition flex justify-between items-center
                                            ${event.disabled
                                                    ? "bg-gray-200 text-gray-400 cursor-not-allowed pointer-events-none"
                                                    : "bg-white border-gray-200 hover:bg-blue-50 border-l-4 border-l-blue-500 text-gray-700 cursor-move"
                                                }`}
                                        >
                                            <span className="text-sm">{course.event.indexOf(event)} {event.name}</span>

                                                {!event.disabled && (
                                                    <button
                                                        style={{cursor: "pointer"}}
                                                        onClick={() => removeExternalEvent(event.id)}
                                                        className="flex items-center justify-center w-5 h-5 text-sm text-gray-700 hover:text-red-500"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                                                             strokeWidth={1.5} stroke="currentColor" className="w-full h-full">
                                                            <path strokeLinecap="round" strokeLinejoin="round"
                                                                  d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"/>
                                                        </svg>
                                                    </button>
                                                )}
                                            </div>

                                        ))}
                                    </div>
                                ) : (
                                    <p>No events</p>
                                )}
                            </div>
                        )
                    )

                    }

                    {/*
                    {externalEvents.length === 0 &&
                        <p className="text-sm text-gray-400 italic">Inga oplanerade events.</p>}

                    {externalEvents.map((event) => (
                        <div
                            key={event.id}
                            data-id={event.id}
                            className={`fc-event-external p-3 rounded border shadow-sm text-sm font-medium transition flex justify-between items-center
                            ${event.disabled
                                ? "bg-gray-200 text-gray-400 cursor-not-allowed pointer-events-none"
                                : "bg-white border-gray-200 hover:bg-blue-50 border-l-4 border-l-blue-500 text-gray-700 cursor-move"
                            }`}
                        >
                            <span className="text-sm">{externalEvents.indexOf(event)} {event.title}</span>

                            {!event.disabled && (
                                <button
                                    style={{cursor: "pointer"}}
                                    onClick={() => removeExternalEvent(event.id)} // <-- tar bort eventet
                                    className="flex items-center justify-center w-5 h-5 text-sm text-gray-700 hover:text-red-500"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                                         strokeWidth={1.5} stroke="currentColor" className="w-full h-full">
                                        <path strokeLinecap="round" strokeLinejoin="round"
                                              d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"/>
                                    </svg>
                                </button>
                            )}

                        </div>

                    ))}
                    */}

                </div>
            </div>

            <div className='demo-app-sidebar-section'>
                <h2 className="text-lg font-bold mb-3 text-gray-700">Aktiva i kalendern ({currentEvents.length})</h2>
                <ul className="space-y-2">
                    {currentEvents.map((event) => (
                        <SidebarEvent key={event.id} event={event} />
                    ))}
                </ul>
            </div>

        </div>
    )
}