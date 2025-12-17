import React, { useEffect, useState } from "react";
import EditEventModal from "./EditEventModal.jsx";
import TeacherPicker from "./TeacherPicker.jsx";
import useGetCourses, { useDeleteCourseEvent, useSaveCourseEvent } from "../hooks.js";

export default function CreateEvent({
    draggableContainerRef,
    currentEvents,
    openModal,
    closeModal,
    isModalOpen,
}) {
    const [categoryName, setCategoryName] = useState("");
    const { data: fetchedCourses } = useGetCourses();
    const { remove: deleteEvent } = useDeleteCourseEvent();

    const [selectedTeachers, setSelectedTeachers] = useState([]);
    const [description, setDescription] = useState("");
    const [endDate, setEndDate] = useState(new Date());
    const [name, setName] = useState("");
    const [id, setId] = useState("");
    const [startDate, setStartDate] = useState(new Date());
    const [courseId, setCourseId] = useState("");
    const [courses, setCourses] = useState([]);

    // NEW – used by the edit button
    const [editEventData, setEditEventData] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);

    const { save } = useSaveCourseEvent();

    // Load courses
    useEffect(() => {
        if (fetchedCourses) setCourses(fetchedCourses);
    }, [fetchedCourses]);

    const isEventOnCalendar = (eventId) => {
        return currentEvents.some((ce) => String(ce.id) === String(eventId));
    };

    // Remove event from a course (optimistic update)
    async function removeCourseEvent(courseId, eventId) {
        const previous = courses;

        setCourses((prev) =>
            prev.map((course) =>
                course.id === courseId
                    ? { ...course, event: course.event.filter((ev) => ev.id !== eventId) }
                    : course
            )
        );

        try {
            await deleteEvent(eventId);
        } catch (err) {
            console.error("Failed to delete event:", err);
            alert("Kunde inte ta bort eventet från servern.");
            setCourses(previous);
        }
    }

    // Save new event
    async function handleFormSubmit(e) {
        e.preventDefault();

        if (!name) {
            alert("Vänligen fyll i en titel");
            return;
        }

        const courseEvent = {
            id,
            name,
            description,
            startTime: startDate,
            endTime: endDate,
            courseId,
            teachers: selectedTeachers.map((t) => t.id),
        };

        try {
            const savedEvent = await save(courseEvent);
            setCourses((prev) =>
                prev.map((c) =>
                    c.id === courseId ? { ...c, event: [...c.event, savedEvent] } : c
                )
            );

            // Reset form
            setName("");
            setDescription("");
            setSelectedTeachers([]);
            setStartDate(new Date());
            setEndDate(new Date());

            closeModal();
        } catch (err) {
            console.error("Kunde inte spara eventet:", err);
            alert("Ett fel inträffade vid sparande.");
        }
    }

    // ------------------------------------------------------------
    // Unified event renderer (edit + delete + drag + disabled)
    // ------------------------------------------------------------
    function renderCourseEvents(eventsArray, course) {
        if (!eventsArray || eventsArray.length === 0)
            return <p className="text-sm text-gray-400 italic">Inga events.</p>;

        return (
            <div className="space-y-1">
                {eventsArray.map((event, index) => {
                    const disabled = isEventOnCalendar(event.id);
                    return (
                        <div
                            key={event.id}
                            data-event={JSON.stringify({
                                id: event.id,
                                title: event.name,
                                start: event.startDate || event.startTime,
                                end: event.endDate || event.endTime,
                                courseId: course.id,
                                color: course.colorHex || "#3b82f6",
                                teachers: event.teachers,
                            })}
                            style={{ borderLeft: `4px solid ${course.colorHex || "#3b82f6"}` }}
                            className={`p-3 rounded border shadow-sm text-sm font-medium flex justify-between items-center transition fc-event-external
                                ${
                                    disabled
                                        ? "bg-gray-200 text-gray-400 cursor-not-allowed pointer-events-none"
                                        : "bg-white border-gray-200 hover:bg-blue-50 border-l-4 border-l-blue-500 text-gray-700 cursor-move"
                                }`}
                        >
                            <span className="text-sm">{index + 1}.{event.teachers} {event.name}</span>

                            {!disabled && (
                                <div className="flex gap-2">
                                    {/* EDIT */}
                                    <button
                                        onClick={() => {
                                            setEditEventData({
                                                ...event,
                                                courseId: course.id, // ← explicit här
                                            });
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
                                        onClick={() => removeCourseEvent(course.id, event.id)}
                                        className="w-5 h-5 text-gray-700 hover:text-red-500"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none"
                                             viewBox="0 0 24 24" strokeWidth={1.5}
                                             stroke="currentColor" className="w-full h-full">
                                            <path strokeLinecap="round" strokeLinejoin="round"
                                                  d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"/>
                                        </svg>
                                    </button>
                                </div>
                            )}
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
                                <div className="mr-auto">
                                    <TeacherPicker
                                        selectedTeachers={selectedTeachers}
                                        setSelectedTeachers={setSelectedTeachers}
                                    />
                                </div>

                                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">
                                    Lägg till händelse
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
                    selectedTeachers = {selectedTeachers}
                    event={editEventData}
                    onClose={() => setShowEditModal(false)}
                    onSaved={(updatedEvent) => {
                        const courseId = updatedEvent.courseId ?? editEventData.courseId;

                        setCourses(prev =>
                            prev.map(course =>
                                String(course.id) === String(courseId)
                                    ? {
                                        ...course,
                                        event: course.event.map(ev =>
                                            ev.id === updatedEvent.id ? { ...ev, ...updatedEvent } : ev
                                        ),
                                    }
                                    : course
                            )
                        );
                    }}

                />
            )}

            {/* COURSE LIST */}
            <div className="mb-2 mt-2">
                <div id="external-events" ref={draggableContainerRef} className="space-y-2">

                    {courses.map((course) => (
                        <div key={course.id} className="border border-gray-300 rounded-lg p-3 bg-gray-50">
                            <div className="flex items-center justify-between mb-2">
                                <h2 className="text-base font-bold">{course.name}</h2>

                                <button
                                    onClick={() => {
                                        setId(course.id);
                                        setCategoryName(course.name);
                                        setCourseId(course.courseId);
                                        openModal();
                                    }}
                                    className="bg-blue-600 text-white font-bold px-3 py-1 rounded"
                                >
                                    +
                                </button>
                            </div>

                            {/* Unified event renderer */}
                            {renderCourseEvents(course.event, course)}
                        </div>
                    ))}

                </div>
            </div>
        </div>
    );
}
