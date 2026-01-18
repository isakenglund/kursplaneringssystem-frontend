import React, { useState } from "react";
import EditEventModal from "./EditEventModal.jsx";
import EditCategoryModal from "./EditCategoryModal.jsx";
import TeacherPicker from "./TeacherPicker.jsx";
import CreateTeacherModal from "./CreateTeacherModal.jsx";
import { confirmCustom, alertCustom } from "../functions/alertFunctions.jsx";
import EventList from "./EventList.jsx";
import {
    useDeleteCourseEvent,
    useSaveCourseEvent,
    useDeleteTeacher,
    useSaveMiscEvent,
    useDeleteMiscEvent,
    useDeleteCourse,
    useDeleteMisc,
    useUpdateCourse,
    useUpdateMisc,
    useReorderCourseEvents,
    useReorderMiscEvents
} from "../hooks.js";

/**
 * Sidebar event/category browser and event creation launcher.
 * Displays categories (courses/miscs) with their events and provides controls to:
 * - expand/collapse category event lists
 * - open create/edit dialogs
 * - expose external draggable event templates for the calendar
 */
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
                                        selectedCategories,
                                        refetchCourses,
                                        refetchMiscs,
                                        onCategoryUpdate,
                                        onCategoryDelete,
                                        teachers,
                                        loading,
                                        err,
                                        refetch
                                    }) {
    const [isCreateTeacherModalOpen, setIsCreateTeacherModalOpen] = useState(false);
    const { remove: removeTeacher } = useDeleteTeacher();
    const { remove: deleteCourse } = useDeleteCourse();
    const { remove: deleteMisc } = useDeleteMisc();

    const { remove: deleteCourseEvent } = useDeleteCourseEvent();
    const { remove: deleteMiscEvent } = useDeleteMiscEvent();

    const { update: updateCourse } = useUpdateCourse();
    const { update: updateMisc } = useUpdateMisc();

    const {save: saveCourseEvent} = useSaveCourseEvent();
    const {save: saveMiscEvent} = useSaveMiscEvent();

    const [categoryId, setCategoryId] = useState("");
    const [categoryType, setCategoryType] = useState("COURSE");
    const [categoryName, setCategoryName] = useState("");
    const [selectedTeachers, setSelectedTeachers] = useState([]);
    const [description, setDescription] = useState("");
    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(new Date());
    const [name, setName] = useState("");
    const [courseId, setCourseId] = useState("");

    const [editEventData, setEditEventData] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);

    const [editingCategory, setEditingCategory] = useState(null);
    const [showEditCategoryModal, setShowEditCategoryModal] = useState(false);

    const [showExpandedEvents, setShowExpandedEvents] = useState({});

    const openEventSection = (sectionId) => {
        setShowExpandedEvents(prev => {
            if (prev[sectionId]) return prev; // already open -> do nothing
            return { ...prev, [sectionId]: true };
        });
    };

    const toggleEventSection = (sectionId) => {
        setShowExpandedEvents(prev => ({
            ...prev,
            [sectionId]: !prev[sectionId]
        }));
    };

    const isEventOnCalendar = (eventId, type) => {
        return currentEvents.some((ce) => {
            const calendarId = parseInt(ce.id, 10);

            if (calendarId !== parseInt(eventId, 10)) return false;

            const isCourseOnCalendar = !!ce.extendedProps?.courseId;
            const isMiscOnCalendar = !!ce.extendedProps?.miscId;

            if (type === "COURSE" && isCourseOnCalendar) return true;
            if (type === "MISC" && isMiscOnCalendar) return true;

            return false;
        });
    };

    const { saveOrder: saveCourseOrder } = useReorderCourseEvents();
    const { saveOrder: saveMiscOrder } = useReorderMiscEvents();

    const handleOrderChange = async (newEventsArray, parentId, type) => {
        const orderedIds = newEventsArray.map(e => {
            if (typeof e.id === 'string' && (e.id.includes('_') || e.id.includes('-'))) {
                const match = e.id.match(/\d+/);
                return match ? parseInt(match[0], 10) : e.id;
            }
            return e.id;
        });

        try {
            if (type === "COURSE") {
                setCourses(prev => prev.map(c =>
                    c.id === parentId ? { ...c, event: newEventsArray } : c
                ));

                await saveCourseOrder(parentId, orderedIds);
            }
            else if (type === "MISC") {
                setMiscs(prev => prev.map(m =>
                    m.id === parentId ? { ...m, event: newEventsArray } : m
                ));

                await saveMiscOrder(parentId, orderedIds);
            }
        } catch (error) {
            console.error("Kunde inte spara ordning:", error);
        }
    };

    const isEventFiltered = (parentCategoryId, type) => {
        if (!selectedCategories || selectedCategories.length === 0) return false;

        const isSelected = selectedCategories.some((c) => {
            const sameId = String(c.value) === String(parentCategoryId);

            const sameType = (c.type || "").toUpperCase() === (type || "").toUpperCase();

            return sameId && sameType;
        });

        return !isSelected;
    };

    const handleDeleteTeacher = async (teacherToDelete) => {

        const confirmDelete = await confirmCustom(
            `Är du säker på att du vill radera ${teacherToDelete.firstName} ${teacherToDelete.lastName} permanent?`
        );

        if (!confirmDelete) return;

        try {
            await removeTeacher(teacherToDelete.id);

            setSelectedTeachers((prev) => prev.filter(t => t.id !== teacherToDelete.id));

            await refetch();
            await refetchCourses();

        } catch (error) {
            console.error("Kunde inte radera lärare:", error);
            await alertCustom("Kunde inte radera läraren.");
        }
    };

    const handleTeacherCreated = async (newTeacher) => {
        setSelectedTeachers((prev) => [...prev, newTeacher]);

        await refetch();

        setIsCreateTeacherModalOpen(false);
    };

    async function handleRemoveEvent(parentId, eventId, type) {
        const isConfirmed = await confirmCustom("Är du säker på att du vill ta bort detta event?")
        if (!isConfirmed) {
            return;
        }
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
        const isConfirmed = await confirmCustom("Är du säker på att du vill ta bort denna kategori och alla dess event?")
        if (!isConfirmed) {
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

            if (onCategoryDelete) {
                onCategoryDelete(id, type);
            }

        } catch (error) {
            console.error("Kunde inte ta bort kategorin", error);
            await alertCustom("Fel vid borttagning");
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

            if (onCategoryUpdate) {
                onCategoryUpdate(updatedData);
            }

            setShowEditCategoryModal(false);
            setEditEventData(null);
        } catch (error) {
            console.error("Fel vid uppdatering av kategori: ", error);
            await alertCustom("Det gick inte att spara ändringarna.");
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
                const course = courses.find(c => String(c.id) === String(categoryId));
                const existingEvents = Array.isArray(course?.event) ? course.event : [];
                const nextDisplayIndex = existingEvents.length;

                const payload = {
                    name,
                    description,
                    startTime: null,
                    endTime: null,
                    courseId: categoryId,
                    teachers: selectedTeachers,
                    displayIndex: nextDisplayIndex,
                };

                const savedEvent = await saveCourseEvent(payload);

                setCourses(prev =>
                    prev.map(c =>
                        Number(c.id) === Number(categoryId)
                            ? { ...c, event: [...(Array.isArray(c.event) ? c.event : []), savedEvent] }
                            : c
                    )
                );
                openEventSection(`course-${categoryId}`);

                await refetchCourses();

            } else {
                const misc = miscs.find(m => String(m.id) === String(categoryId));
                const existingEvents = Array.isArray(misc?.event) ? misc.event : [];
                const nextDisplayIndex = existingEvents.length;

                const payload = {
                    name,
                    description,
                    startTime: null,
                    endTime: null,
                    miscId: categoryId,
                    displayIndex: nextDisplayIndex,
                }

                const savedEvent = await saveMiscEvent(payload);

                setMiscs(prev =>
                    prev.map(m =>
                        Number(m.id) === Number(categoryId)
                            ? {
                                ...m,
                                event: [...(Array.isArray(m.event) ? m.event : []), savedEvent],
                            }
                            : m
                    )
                );
                openEventSection(`misc-${categoryId}`);

                await refetchMiscs();

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

    function renderEvents(eventsArray, parentCategory, type) {
        if (!eventsArray || eventsArray.length === 0)
            return <p className="text-sm text-gray-400 italic">Inga händelser.</p>;

        return (
            <div className="space-y-1">
                <EventList
                    eventsArray={eventsArray}
                    parentCategory={parentCategory}
                    type={type}
                    isEventOnCalendar={(eventId) => isEventOnCalendar(eventId, type)}
                    isEventFiltered={isEventFiltered}
                    onEditClick={(event) => {
                        setEditEventData({...event, categoryId: parentCategory,type: type});
                        setShowEditModal(true);
                    }}
                    onRemoveClick={(event) => {
                        handleRemoveEvent(parentCategory.id, event.id, type);
                    }}
                    onOrderChange={(newOrder) => handleOrderChange(newOrder, parentCategory.id, type)}
                />
            </div>
        );
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
                                    <div className="mr-auto">
                                        <TeacherPicker
                                            selectedTeachers={selectedTeachers}
                                            setSelectedTeachers={setSelectedTeachers}
                                            teachers={teachers}
                                            loading={loading}
                                            err={err}
                                            onCreate={() => setIsCreateTeacherModalOpen(true)}
                                            onDelete={handleDeleteTeacher}
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

            {showEditModal && (
                <EditEventModal
                    selectedTeachers={selectedTeachers}
                    setSelectedTeachers={setSelectedTeachers}
                    event={editEventData}
                    onClose={() => setShowEditModal(false)}
                    onSaved={(updatedEvent) => {
                        const courseId = editEventData.categoryId;
                        refetchMiscs();
                        refetchCourses();

                        setCourses(prev =>
                            prev.map(course =>
                                String(course.id) === String(courseId)
                                    ? {
                                        ...course,
                                        event: course.event.map(ev =>
                                            ev.id === updatedEvent.id ? { ...ev, ...updatedEvent, teachers: updatedEvent.teachers ?? [] } : ev
                                        ),
                                    }
                                    : course
                            )
                        );
                    }}
                    teachers={teachers}
                    loading={loading}
                    err={err}
                    refetch={refetch}
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
                                        className="flex items-center p-2 cursor-pointer hover:bg-gray-100 rounded-lg select-none "
                                        onClick={() => toggleEventSection(toggleEventsId)}
                                    >
                                        <div className="flex items-center gap-2 mr-auto min-w-0">
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

                                            <h2 className="text-base font-bold text-gray-700 flex-1 min-w-0 break-words [overflow-wrap:anywhere]">
                                                {course.name}
                                            </h2>
                                        </div>

                                        <div className="flex items-center gap-2">

                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setEditingCategory({ ...course, type: "COURSE" });
                                                    setShowEditCategoryModal(true);
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
                                                          d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
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
                                                    setSelectedTeachers([]);
                                                }}
                                                className="bg-blue-600 text-white font-bold px-3 py-1 rounded hover:bg-blue-700 text-sm"
                                            >
                                                +
                                            </button>
                                        </div>
                                    </div>
                                    <h3 className="flex justify-center text-sm font-bold text-gray-500">Antal Studenter: {course.numOfStudents}</h3>
                                    {isOpen && (
                                        <div className="p-2 border-t border-gray-200 mt-1">
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
                                                    setEditingCategory({ ...misc, type: "MISC" });
                                                    setShowEditCategoryModal(true);
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
                                                          d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
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

                    {isCreateTeacherModalOpen && (
                        <CreateTeacherModal
                            onClose={() => setIsCreateTeacherModalOpen(false)}
                            onSaved={handleTeacherCreated}
                        />
                    )}
                </div>
            </div>
        </div>

    );
}