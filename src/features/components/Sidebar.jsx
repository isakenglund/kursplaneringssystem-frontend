import React, { useEffect, useRef, useState } from "react";
import { Draggable } from "@fullcalendar/interaction";
import CreateCategory from "./CreateCategory.jsx";
import CreateEvent from "./CreateEvent.jsx";
import TeacherPicker from "./TeacherPicker.jsx";
import useGetCourses, { useSaveCourse } from "../hooks.js";


export default function Sidebar({
    weekendsVisible,
    handleWeekendsToggle,
    currentEvents,
    externalEvents,
    addExternalEvent,
    removeExternalEvent,

}) {
    const draggableContainerRef = useRef(null);
    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false)
    const [isModalOpen, setIsModalOpen] = useState(false)


    useEffect(() => {
        let draggable = null;

        if (draggableContainerRef.current) {
            draggable = new Draggable(draggableContainerRef.current, {
                itemSelector: '.fc-event-external',
                eventData: function (eventEl) {
                    return JSON.parse(eventEl.dataset.event);
                }
            });
        }

        return () => {
            if (draggable) draggable.destroy();
        }
    }, []);




    return (
        <div
            className='demo-app-sidebarw-80 bg-slate-50 border-r border-gray-200 p-6 flex flex-col h-full overflow-y-auto'>

            {isCategoryModalOpen && (
                <CreateCategory setIsCategoryModalOpen={setIsCategoryModalOpen} />
            )}

            <div className='demo-app-sidebar-section mb-8'>
                <button
                    className="w-full bg-blue-600 text-white font-bold py-2 px-4 rounded shadow hover:bg-blue-700 transition"
                    onClick={() => setIsCategoryModalOpen(true)}>Create category
                </button>

                <CreateEvent
                    draggableContainerRef={draggableContainerRef}
                    currentEvents={currentEvents}
                    openModal={() => setIsModalOpen(true)}
                    closeModal={() => setIsModalOpen(false)}
                    isModalOpen={isModalOpen}
                    removeExternalEvent={removeExternalEvent}
                />
                {/*
                <span>
                  <ul>
                    {listOfCourses.map(course => (
                        <>

                            <li key={course.id}>
                                <h2>{course.name}</h2>
                                {course.event && course.event.length > 0 ? (
                                    <ul>
                                        {course.event.map(ev => (
                                            <li key={ev.id}>
                                                <strong>{ev.name}</strong>
                                                <div>Start: {new Date(ev.startTime).toLocaleString()}</div>
                                                <div>End: {new Date(ev.endTime).toLocaleString()}</div>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p>No events</p>
                                )}
                            </li>

                        </>


                    ))}
                  </ul>
                </span>
                */}


            </div>

            <div className='demo-app-sidebar-section mb-6 pt-6 border-t border-gray-200'>
                <label className="flex items-center gap-3 cursor-pointer select-none">
                    <input
                        type='checkbox'
                        checked={weekendsVisible}
                        onChange={handleWeekendsToggle}
                        className="
                            h-5 w-5 rounded-md
                            appearance-none
                            border border-gray-400
                            checked:bg-blue-600
                            checked:border-blue-600
                            flex items-center justify-center
                            "
                    ></input>
                    <span className="text-lg font-bold text-gray-600">Visa helger</span>
                </label>
            </div>





        </div>
    )
}
