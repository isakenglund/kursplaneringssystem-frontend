import React, { useEffect, useRef, useState } from "react";
import { Draggable } from "@fullcalendar/interaction";
import CreateCategory from "./CreateCategory.jsx";
import CreateEvent from "./CreateEvent.jsx";



export default function LeftSidebar({
    currentEvents,
    removeExternalEvent,
    setVacationDate,
    vacationDate
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
            className='w-96 h-full bg-slate-50 border-r border-gray-200 p-0 flex flex-col overflow-y-auto'>

            {isCategoryModalOpen && (
                <CreateCategory 
                    setIsCategoryModalOpen={setIsCategoryModalOpen} 
                    setVacationDate={setVacationDate}
                    vacationDate={vacationDate}/>
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

            </div>
        </div>
    )
}
