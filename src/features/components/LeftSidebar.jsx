import React, { useEffect, useRef, useState } from "react";
import { Draggable } from "@fullcalendar/interaction";
import CreateCategory from "./CreateCategory.jsx";
import CreateEvent from "./CreateEvent.jsx";

export default function LeftSidebar({
    currentEvents,
    removeExternalEvent,
    setVacationDate,
    vacationDate,
    showLeftSidebar,
    selectedCategories,
    onCategoryUpdate,
    onCategoryDelete,
    teachers,
    loading,
    err,
    coursesData,
    miscsData,
    refetchCourses,
    refetchMiscs,
    refetchTeachers,
    refetchVacation,
}) {
    const draggableContainerRef = useRef(null);
    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false)
    const [isModalOpen, setIsModalOpen] = useState(false)
    // const { data: courses = [], isLoading: loadingCourses, refetch: refetchCourses, } = ;
    //const { data: miscs = [], isLoading: loadingMiscs, refetch: refetchMiscs, } = ;

    

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
        if (!showLeftSidebar) return;

        const el = draggableContainerRef.current;
        if (!el) return;

        const draggable = new Draggable(el, {
            itemSelector: ".fc-event-external",
            eventData: (eventEl) => JSON.parse(eventEl.dataset.event),
        });

        return () => draggable.destroy();
    }, [showLeftSidebar, courses, miscs]);


    if (!showLeftSidebar) { return null }


    return (
        <div className="w-96 h-full flex flex-col overflow-y-auto p-4">

            {isCategoryModalOpen && (
                <CreateCategory
                    setIsCategoryModalOpen={setIsCategoryModalOpen}
                    setVacationDate={setVacationDate}
                    vacationDate={vacationDate}
                    onCreated={fetchCategories} 
                    refetchVacation={refetchVacation}
                    refetchCourse={refetchCourses}
                    refetchMisc={refetchMiscs}/>
            )}

            <div className='demo-app-sidebar-section'>
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
                    selectedCategories={selectedCategories}
                    refetchMiscs={refetchMiscs}
                    refetchCourses={refetchCourses}
                    onCategoryUpdate={onCategoryUpdate}
                    onCategoryDelete={onCategoryDelete}
                    teachers={teachers}
                    loading={loading}
                    err={err}
                    refetch={refetchTeachers}
                />

            </div>
        </div>


    )
}