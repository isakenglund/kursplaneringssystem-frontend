import React, {useEffect, useState} from "react";
import EditEventModal from "./EditEventModal.jsx";
import EditCategoryModal from "./EditCategoryModal.jsx";
import TeacherPicker from "./TeacherPicker.jsx";
import { alertCustom } from "../functions/alertFunctions.jsx";
import useGetCourses, {
    useDeleteCourseEvent,
    useSaveCourseEvent,
    useGetMiscs,
    useSaveMiscEvent,
    useDeleteMiscEvent,
    useDeleteCourse,
    useDeleteMisc,
    useUpdateCourse,
    useUpdateMisc
} from "../hooks.js";

export default function CreateEvent({
    draggableContainerRef,
    currentEvents,
    openModal,
    closeModal,
    isModalOpen,
    setCourses,
    courses,
    miscs,
    setMiscs,
                                        selectedCategories
                                    }) {
    const {data: fetchedCourses} = useGetCourses();
    const {data: fetchedMiscs} = useGetMiscs();


    const {remove: deleteCourse} = useDeleteCourse();
    const {remove: deleteMisc} = useDeleteMisc();

    const { remove: deleteCourseEvent } = useDeleteCourseEvent();
    const { remove: deleteMiscEvent } = useDeleteMiscEvent();

    const { update: updateCourse } = useUpdateCourse();
    const { update: updateMisc } = useUpdateMisc();

    const { save: saveCourseEvent } = useSaveCourseEvent();
    const { save: saveMiscEvent } = useSaveMiscEvent();

    const [categoryId, setCategoryId] = useState("");
    const [categoryType, setCategoryType] = useState("COURSE");
    const [categoryName, setCategoryName] = useState("");

    const [selectedTeachers, setSelectedTeachers] = useState([]);
    const [description, setDescription] = useState("");
    const [endDate, setEndDate] = useState(new Date());
    const [name, setName] = useState("");
    const [id, setId] = useState("");
    const [startDate, setStartDate] = useState(new Date());
    const [courseId, setCourseId] = useState("");

    const [editEventData, setEditEventData] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);

    const [editingCategory, setEditingCategory] = useState(null);
    const [showEditCategoryModal, setShowEditCategoryModal] = useState(false);

    const [showExpandedEvents, setShowExpandedEvents] = useState({});

    const [openTeachers, setOpenTeachers] = useState({});

    const toggleTeachers = (eventId) => {
        setOpenTeachers(prev => ({ ...prev, [eventId]: !prev[eventId]}));
    };

    const toggleEventSection = (sectionId) => {
        setShowExpandedEvents(prev => ({
            ...prev,
            [sectionId]: !prev[sectionId]
        }));
    };

    const isEventOnCalendar = (eventId) => {
        return currentEvents.some((ce) => String(ce.id) === String(eventId));
    };

    const isEventFiltered = (parentCategoryId) => {
        if (!selectedCategories || selectedCategories.length === 0) return false;
        return !selectedCategories.some((c) => String(c.value) === String(parentCategoryId));
    };


    async function handleRemoveEvent(parentId, eventId, type) {

        if (type === "COURSE") {
            const previous = courses;
            setCourses(prev => prev.map(c => c.id === parentId ? {
                ...c,
                event: c.event.filter(e => e.id !== eventId)
            } : c));
            try {
                await deleteCourseEvent(eventId);
            } catch (error) {
                console.error("Failed to delete course event", error);
                setCourses(previous);
            }
        } else {
            const previous = miscs;
            setMiscs(prev => prev.map(m => m.id === parentId ? {
                ...m,
                event: m.event.filter(e => e.id !== eventId)
            } : m));
            try {
                await deleteMiscEvent(eventId);
            } catch (error) {
                console.error("Failed to delete misc event", error);
                setMiscs(previous);
            }
        }
    }

    async function handleRemoveCategory(id, type) {
        if (!confirm("Är du säker på att du vill ta bort denna kategori och alla dess event?")) {
            return;
        }

        try {
            if (type === "COURSE") {
                await deleteCourse(id);
                setCourses(prev => prev.filter(c => c.id !== id));
            } else {
                await deleteMisc(id);
                setMiscs(prev => prev.filter(m => m.id !== id));
            }
        } catch (error) {
            console.error("Kunde inte ta bort kategorin", error);
            alert("Fel vid borttagning");
        }
    }

    async function handleUpdateCategory(updatedData) {
        try {
            const isCourse = (updatedData.type || "").toUpperCase() === "COURSE";

            if (isCourse) {
                await updateCourse(updatedData);

                setCourses(prev => prev.map(c =>
                c.id === updatedData.id
                    ? { ...c, ...updatedData }
                    : c
                ));
            } else {
                await updateMisc(updatedData);

                setMiscs(prev => prev.map(m =>
                    m.id === updatedData.id
                        ? { ...m, ...updatedData }
                        : m
                ));
            }

            setShowEditCategoryModal(false);
            setEditEventData(null);
        } catch (error) {
            console.error("Fel vid uppdatering av kategori: ", error);
            alert("Det gick inte att spara ändringarna.");
        }
    }

    async function handleFormSubmit(e) {
        e.preventDefault();

        if (!name) {
            await alertCustom("Vänligen fyll i namn på eventet");
            return;
        }

        try {
            if (categoryType === "COURSE") {
                const payload = {
                    name,
                    description,
                    startTime: startDate,
                    endTime: endDate,
                    courseId: categoryId,
                    teachers: selectedTeachers
                };

                const savedEvent = await saveCourseEvent(payload);
                setCourses((prev) =>
                    prev.map((c) =>
                        c.id === categoryId ? { ...c, event: [...c.event, savedEvent] } : c
                    )
                );
            } else {
                const payload = {
                    name,
                    description,
                    startTime: startDate,
                    endTime: endDate,
                    miscId: categoryId,
                }

                const savedEvent = await saveMiscEvent(payload);

                setMiscs((prev) =>
                    prev.map((m) =>
                        m.id === categoryId ? { ...m, event: [...m.event, savedEvent] } : m
                    )
                );
            }

            setName("");
            setDescription("");
            setSelectedTeachers([]);
            setStartDate(new Date());
            setEndDate(new Date());
            closeModal();

        } catch (error) {
            console.error("DEBUG-FEL:", error);
            await alertCustom(`Fel: ${error.message}`)
        }
    }

    // ------------------------------------------------------------
    // Unified event renderer (edit + delete + drag + disabled)
    // ------------------------------------------------------------
    function renderEvents(eventsArray, parentCategory, type) {
        if (!eventsArray || eventsArray.length === 0)
            return <p className="text-sm text-gray-400 italic">Inga händelser.</p>;
        return (
            <div className="space-y-1">
                {eventsArray.map((event, index) => {
                    const disabled = isEventOnCalendar(event.id);
                    const filtered = isEventFiltered(parentCategory.id)

                    const isDraggable = !disabled && !filtered;

                    return (
                        <div
                            key={event.id}
                            {...(!disabled && {
                                "data-event": JSON.stringify({
                                    id: event.id,
                                    title: event.name,
                                    start: event.startDate || event.startTime,
                                    end: event.endDate || event.endTime,
                                    courseId: type === "COURSE" ? parentCategory.id : undefined,
                                    miscId: type !== "COURSE" ? parentCategory.id : undefined,
                                    color: parentCategory.colorHex || "#3b82f6",
                                    teachers: event.teachers,
                                })
                            })}
                            style={{borderLeft: `4px solid ${parentCategory.colorHex || "#3b82f6"}`}}
                            className={`p-3 rounded border shadow-sm text-sm font-medium flex justify-between items-center transition
                                ${isDraggable ? "fc-event-external" : ""}
                                ${
                                disabled || filtered
                                    ? "bg-gray-200 text-gray-400 cursor-not-allowed pointer-events-none"
                                    : "bg-white border-gray-200 hover:bg-blue-50 border-l-4 border-l-blue-500 text-gray-700 cursor-move"
                            }`}
                        >
                            <div className="flex items-center w-full">
                                <div className="min-w-0 flex-1">
                                    <span className="block truncate text-sm font-bold text-black-600" title={event.name}>
                                        {index + 1}. {event.name}
                                    </span>
                                </div>

                                {!disabled && (
                                    <div className="flex gap-2 flex-shrink-0 ml-auto">
                                        {/* EDIT */}
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setEditEventData({ ...event, categoryId: parentCategory, type: type });
                                                setShowEditModal(true);
                                            }}
                                            className="w-5 h-5 text-gray-700 hover:text-green-500"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none"
                                                viewBox="0 0 24 24" strokeWidth={1.5}
                                                stroke="currentColor" className="w-full h-full">
                                                <path strokeLinecap="round" strokeLinejoin="round"
                                                    d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Z" />
                                                <path strokeLinecap="round" strokeLinejoin="round"
                                                    d="M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                                            </svg>
                                        </button>

                                        {/* DELETE */}
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleRemoveEvent(parentCategory.id, event.id, type);
                                            }}
                                            className="w-5 h-5 text-gray-700 hover:text-red-500"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none"
                                                viewBox="0 0 24 24" strokeWidth={1.5}
                                                stroke="currentColor" className="w-full h-full">
                                                <path strokeLinecap="round" strokeLinejoin="round"
                                                    d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                                            </svg>
                                        </button>
                                    </div>
                                )}
                            </div>
                            <div>

                                {event.teachers?.length > 0 && (
                                    <div className="pt-2 text-xs text-gray-500 pl-2">
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                toggleTeachers(event.id);
                                            }}
                                            className="font-bold flex items-center gap-1"
                                        >
                                            Lärare
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                viewBox="0 0 20 20"
                                                fill="currentColor"
                                                className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${openTeachers[event.id] ? "rotate-90" : ""}`}
                                            >
                                                <path fillRule="evenodd"
                                                    d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
                                                    clipRule="evenodd" />
                                            </svg>
                                        </button>

                                        {openTeachers[event.id] && (
                                            <div className="mt-1 flex flex-col">
                                                {event.teachers.map(t => (
                                                    <div key={t.id} className="pl-6">
                                                        {t.firstName} {t.lastName}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}

                            </div>

                        </div>
                    );
                })}
            </div>
        );
    }

    return (
        <div>
            {/* CREATE MODAL */}
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
                                    className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm"
                                    placeholder="T.ex. Föreläsning"
                                    autoFocus
                                />

                                <label className="block text-sm font-medium text-gray-700 mt-2">Beskrivning</label>
                                <input
                                    type="text"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm"
                                    placeholder="T.ex. Föreläsning om..."
                                />
                            </div>

                            <div className="flex justify-end gap-2 mt-4">
                                {categoryType === "COURSE" && (
                                    <div className="mt-2">
                                        <TeacherPicker
                                            selectedTeachers={selectedTeachers}
                                            setSelectedTeachers={setSelectedTeachers}
                                        />
                                    </div>
                                )}

                                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">
                                    Spara
                                </button>

                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="px-4 py-2 bg-gray-200 rounded"
                                >
                                    Avbryt
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* EDIT MODAL */}
            {showEditModal && (
                <EditEventModal
                    selectedTeachers={selectedTeachers}
                    event={editEventData}
                    onClose={() => setShowEditModal(false)}
                    onSaved={(updatedEvent) => {
                        const courseId = editEventData.categoryId;


                        setCourses(prev =>
                            prev.map(course =>
                                String(course.id) === String(courseId)
                                    ? {
                                        ...course,
                                        event: course.event.map(ev =>
                                            ev.id === updatedEvent.id ? {...ev, ...updatedEvent} : ev
                                        ),
                                    }
                                    : course
                            )
                        );
                    }}

                />
            )}

            {showEditCategoryModal && editingCategory && (
                <EditCategoryModal
                    categoryToEdit={editingCategory}
                    onClose={() => {
                        setShowEditCategoryModal(false);
                        setEditingCategory(null);
                    }}
                    onSaved={handleUpdateCategory}
                />
            )}

            <div className="mb-2 mt-2">
                <div id="external-events" ref={draggableContainerRef} className="space-y-2">

                    {courses.length > 0 &&
                        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2 mt-4">Kurser</h3>}
                    <div className="space-y-4">
                        {courses.map((course) => {
                            const toggleEventsId = `course-${course.id}`;
                            const isOpen = showExpandedEvents[toggleEventsId];

                            return (
                                <div key={course.id}
                                    className="border border-gray-300 rounded-lg bg-gray-50 transition-all flex-col">
                                    <div
                                        className="flex items-center p-3 cursor-pointer hover:bg-gray-100 rounded-lg select-none "
                                        onClick={() => toggleEventSection(toggleEventsId)}
                                    >
                                        <div className="flex items-center gap-2 mr-auto">
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                viewBox="0 0 20 20"
                                                fill="currentColor"
                                                className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${isOpen ? 'rotate-90' : ''}`}
                                            >
                                                <path fillRule="evenodd"
                                                    d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
                                                    clipRule="evenodd" />
                                            </svg>

                                            <h2 className="text-base font-bold text-gray-700">{course.name}</h2>
                                        </div>

                                        <div className="flex items-center gap-2">

                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setEditingCategory({...course, type:"COURSE"});
                                                    setShowEditCategoryModal(true);
                                                }}
                                                className="w-5 h-5 text-gray-700 hover:text-green-500"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none"
                                                     viewBox="0 0 24 24" strokeWidth={1.5}
                                                     stroke="currentColor" className="w-full h-full">
                                                    <path strokeLinecap="round" strokeLinejoin="round"
                                                          d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Z"/>
                                                    <path strokeLinecap="round" strokeLinejoin="round"
                                                          d="M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"/>
                                                </svg>
                                            </button>

                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleRemoveCategory(course.id, "COURSE");
                                                }}
                                                className="w-5 h-5 text-gray-700 hover:text-red-500"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none"
                                                     viewBox="0 0 24 24" strokeWidth={1.5}
                                                     stroke="currentColor" className="w-full h-full">
                                                    <path strokeLinecap="round" strokeLinejoin="round"
                                                          d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"/>
                                                </svg>
                                            </button>

                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setCategoryId(course.id);
                                                    setCategoryName(course.name);
                                                    setCategoryType("COURSE");
                                                    setCourseId(course.courseId);
                                                    openModal();
                                                }}
                                                className="bg-blue-600 text-white font-bold px-3 py-1 rounded hover:bg-blue-700 text-sm"
                                            >
                                                +
                                            </button>
                                        </div>
                                    </div>
                                    <h3 className="flex justify-center text-sm font-bold text-gray-500">Antal Studenter: {course.numOfStudents}</h3>
                                    {isOpen && (
                                        <div className="p-3 border-t border-gray-200 mt-2">
                                            {renderEvents(course.event, course, "COURSE")}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {miscs.length > 0 &&
                        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2 mt-6">Övrigt</h3>}
                    <div className="space-y-4">
                        {miscs.map((misc) => {
                            const toggleEventsId = `misc-${misc.id}`;
                            const isOpen = showExpandedEvents[toggleEventsId];

                            return (
                                <div key={misc.id}
                                    className="border border-gray-300 rounded-lg bg-gray-50 transition-all">
                                    <div
                                        className="flex items-center justify-between p-3 cursor-pointer hover:bg-gray-100 rounded-lg select-none"
                                        onClick={() => toggleEventSection(toggleEventsId)}
                                    >
                                        <div className="flex items-center gap-2">
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                viewBox="0 0 20 20"
                                                fill="currentColor"
                                                className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${isOpen ? 'rotate-90' : ''}`}
                                            >
                                                <path fillRule="evenodd"
                                                    d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
                                                    clipRule="evenodd" />
                                            </svg>

                                            <h2 className="text-base font-bold text-gray-700">{misc.name}</h2>
                                        </div>

                                        <div className="flex items-center gap-2">

                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setEditingCategory({...misc, type:"MISC"});
                                                    setShowEditCategoryModal(true);
                                                }}
                                                className="w-5 h-5 text-gray-700 hover:text-green-500"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none"
                                                     viewBox="0 0 24 24" strokeWidth={1.5}
                                                     stroke="currentColor" className="w-full h-full">
                                                    <path strokeLinecap="round" strokeLinejoin="round"
                                                          d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Z"/>
                                                    <path strokeLinecap="round" strokeLinejoin="round"
                                                          d="M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"/>
                                                </svg>
                                            </button>

                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleRemoveCategory(misc.id, "MISC");
                                                }}
                                                className="w-5 h-5 text-gray-700 hover:text-red-500"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none"
                                                     viewBox="0 0 24 24" strokeWidth={1.5}
                                                     stroke="currentColor" className="w-full h-full">
                                                    <path strokeLinecap="round" strokeLinejoin="round"
                                                          d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"/>
                                                </svg>
                                            </button>

                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setCategoryId(misc.id);
                                                    setCategoryName(misc.name);
                                                    setCategoryType("MISC");
                                                    openModal();
                                                }}
                                                className="bg-blue-600 text-white font-bold px-3 py-1 rounded"
                                            >
                                                +
                                            </button>
                                        </div>
                                    </div>

                                    {isOpen && (
                                        <div className="p-3 border-t border-gray-200 mt-2">
                                            {renderEvents(misc.event, misc, "MISC")}
                                        </div>
                                    )}

                                </div>
                            );
                        })}
                    </div>


                </div>
            </div>
        </div>

    );
}
