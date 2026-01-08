import React, { useEffect, useRef, useState } from "react";
import { Draggable } from "@fullcalendar/interaction";
import CreateCategory from "./CreateCategory.jsx";
import CreateEvent from "./CreateEvent.jsx";
import useGetCourses, { useGetMiscs, } from '../hooks.js'
import { set } from "date-fns";

export default function LeftSidebar({
    currentEvents,
    removeExternalEvent,
    setVacationDate,
    vacationDate,
    showLeftSidebar,
}) {
    const draggableContainerRef = useRef(null);
    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false)
    const [isModalOpen, setIsModalOpen] = useState(false)
    // const { data: courses = [], isLoading: loadingCourses, refetch: refetchCourses, } = ;
    //const { data: miscs = [], isLoading: loadingMiscs, refetch: refetchMiscs, } = ;

    const { data: coursesData, refetch: refetchCourses } = useGetCourses();
    const { data: miscsData, refetch: refetchMiscs } = useGetMiscs();

    const [courses, setCourses] = useState([]);
    const [miscs, setMiscs] = useState([]);

    useEffect(() => {
        if (coursesData) setCourses(coursesData);
    }, [coursesData]);

    useEffect(() => {
        if (miscsData) setMiscs(miscsData);
    }, [miscsData]);

    function fetchCategories() {
        refetchCourses();
        refetchMiscs();
    }


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
            className={`h-full overflow-hidden transition-[width] duration-300 ${showLeftSidebar ? "w-96" : "w-0"}`}
        >
            

                {isCategoryModalOpen && (
                    <CreateCategory
                        setIsCategoryModalOpen={setIsCategoryModalOpen}
                        setVacationDate={setVacationDate}
                        vacationDate={vacationDate}
                        onCreated={fetchCategories} />
                )}

                <div className='demo-app-sidebar-section mb-8'>
                    <button
                        className="w-full bg-blue-600 text-white font-bold py-2 px-4 rounded shadow hover:bg-blue-700 transition"
                        onClick={() => setIsCategoryModalOpen(true)}>Skapa kategori
                    </button>

                    <CreateEvent
                        draggableContainerRef={draggableContainerRef}
                        currentEvents={currentEvents}
                        openModal={() => setIsModalOpen(true)}
                        closeModal={() => setIsModalOpen(false)}
                        isModalOpen={isModalOpen}
                        removeExternalEvent={removeExternalEvent}
                        courses={courses}
                        miscs={miscs}
                        setCourses={setCourses}
                        setMiscs={setMiscs}
                        refetchMiscs={refetchMiscs}
                        refetchCourses={refetchCourses}
                    />

                </div>
                <div
                className={`w-96 h-full bg-slate-50 border-r border-gray-200 p-0 flex flex-col overflow-y-auto transition-transform duration-300 ${showLeftSidebar ? "translate-x-0" : "-translate-x-full"
                    }`}
            >
            </div>
        </div>
    )
}
