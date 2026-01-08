import React, {useEffect, useState} from "react";
import EditEventModal from "./EditEventModal.jsx";
import TeacherPicker from "./TeacherPicker.jsx";
import { alertCustom } from "../functions/alertFunctions.jsx";
import useGetCourses, {
    useDeleteCourseEvent,
    useSaveCourseEvent,
    useGetMiscs,
    useSaveMiscEvent,
    useDeleteMiscEvent
} from "../hooks.js";
import ButtonEdit from "./ButtonEdit.jsx"
import ButtonRemove from "./ButtonRemove.jsx";
import EventList from "./EventList.jsx";
import { useReorderCourseEvents } from "../hooks.js";



export default function CreateEvent({
                                        draggableContainerRef,
                                        currentEvents,
                                        openModal,
                                        closeModal,
                                        isModalOpen
                                    }) {
    const {data: fetchedCourses} = useGetCourses();
    const {data: fetchedMiscs} = useGetMiscs();
    const {remove: deleteCourseEvent} = useDeleteCourseEvent();
    const {remove: deleteMiscEvent} = useDeleteMiscEvent();
    const {save: saveCourseEvent} = useSaveCourseEvent();
    const {save: saveMiscEvent} = useSaveMiscEvent();
    const [courses, setCourses] = useState([]);
    const [miscs, setMiscs] = useState([]);
    const [categoryId, setCategoryId] = useState("");
    const [categoryType, setCategoryType] = useState("COURSE");
    const [categoryName, setCategoryName] = useState("");
    const [selectedTeachers, setSelectedTeachers] = useState([]);
    const [description, setDescription] = useState("");
    const [endDate, setEndDate] = useState(new Date());
    const [name, setName] = useState("");
    const [startDate, setStartDate] = useState(new Date());
    const [editEventData, setEditEventData] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showExpandedEvents, setShowExpandedEvents] = useState({});

    // Load courses
    useEffect(() => {
        if (fetchedCourses) setCourses(fetchedCourses);
    }, [fetchedCourses, fetchedMiscs]);

    useEffect(() => {
        const defaultOpen = {};
        fetchedCourses.forEach(course => {
            defaultOpen[`course-${course.id}`] = true;
        });

        setShowExpandedEvents(prev => ({ ...prev, ...defaultOpen }));
    }, [fetchedCourses]);

    useEffect(() => {
        if (fetchedMiscs) setMiscs(fetchedMiscs);

        const defaultOpen = {};
        fetchedMiscs.forEach(misc => {
            defaultOpen[`misc-${misc.id}`] = true;
        });

        setShowExpandedEvents(prev => ({ ...prev, ...defaultOpen }));
    }, [fetchedMiscs]);

    const toggleEventSection = (sectionId) => {
        setShowExpandedEvents(prev => ({
            ...prev,
            [sectionId]: !prev[sectionId]
        }));
    };

    const isEventOnCalendar = (eventId) => {
        return currentEvents.some((ce) => String(ce.id) === String(eventId));
    };

    // Hämta save-funktionen från hooken
    const { saveOrder: saveCourseOrder } = useReorderCourseEvents();

    // Funktion som hanterar när sorteringen är klar i listan
    const handleOrderChange = async (newEventsArray, parentId, type) => {

        // 1. Extrahera ID:n i rätt ordning för att skicka till backend
        const orderedIds = newEventsArray.map(e => e.id);

        try {
            if (type === "COURSE") {
                // 2. Uppdatera UI:t (state) direkt så det inte "hoppar tillbaka"
                // Vi måste uppdatera 'courses' statet med den nya ordningen
                setCourses(prev => prev.map(c =>
                    c.id === parentId ? { ...c, event: newEventsArray } : c
                ));

                // 3. Skicka till backend
                await saveCourseOrder(parentId, orderedIds);
            }
            else if (type === "MISC") {
                // Samma logik för Misc...
                setMiscs(prev => prev.map(m =>
                    m.id === parentId ? { ...m, event: newEventsArray } : m
                ));
                // await saveMiscOrder(parentId, orderedIds);
            }
        } catch (error) {
            console.error("Kunde inte spara ordning:", error);
            // Här kan man lägga till logik för att återställa ordningen vid fel (valfritt)
        }
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
                        c.id === categoryId ? {...c, event: [...c.event, savedEvent]} : c
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
                        m.id === categoryId ? {...m, event: [...m.event, savedEvent]} : m
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

    function renderEvents(eventsArray, parentCategory, type) {
        if (!eventsArray || eventsArray.length === 0)
            return <p className="text-sm text-gray-400 italic">Inga händelser.</p>;

        return (
            <EventList
                eventsArray={eventsArray}
                parentCategory={parentCategory}
                type={type}
                isEventOnCalendar={isEventOnCalendar}
                onEditClick={(event) => {
                    setEditEventData({...event, type: type});
                    setShowEditModal(true);
                }}
                onRemoveClick={(event) => {
                    handleRemoveEvent(parentCategory.id, event.id, type);
                }}
                // HÄR KOPPLAR VI IN DET:
                onOrderChange={(newOrder) => handleOrderChange(newOrder, parentCategory.id, type)}
            />
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
                                                      clipRule="evenodd"/>
                                            </svg>

                                            <h2 className="text-base font-bold text-gray-700">{course.name}</h2>
                                        </div>

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
                                                      clipRule="evenodd"/>
                                            </svg>

                                            <h2 className="text-base font-bold text-gray-700">{misc.name}</h2>
                                        </div>
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
