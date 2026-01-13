import { useUpdateCourseEvent, useUpdateMiscEvent } from "../hooks.js";
import React, { useEffect, useState } from "react";
import TeacherPicker from "./TeacherPicker.jsx";
import { alertCustom, confirmCustom } from "../functions/alertFunctions.jsx";
import { useGetTeachers, useDeleteTeacher } from "../hooks.js";
import CreateTeacherModal from "./CreateTeacherModal.jsx";

export default function EditEventModal({ selectedTeachers, setSelectedTeachers, event, onClose, onSaved,
    teachers, loading, err, refetch
}) {

    const {save: saveCourse } = useUpdateCourseEvent();
    const {save: saveMisc } = useUpdateMiscEvent();
    const [name, setName] = useState("");
    const [description, setDescription] = useState("")
    //const [selectedTeachers, setSelectedTeachers] = useState([]);
    //const {teachers, loading, err, refetch} = useGetTeachers();
    const { remove: removeTeacher } = useDeleteTeacher();
    const [isCreateTeacherModalOpen, setIsCreateTeacherModalOpen] = useState(false);

    const isCourseEvent = event && event.categoryId && event.categoryId.type === "COURSE";
    const isMiscEvent = event && event.categoryId && event.categoryId.type === "MISC";

    const handleDeleteTeacher = async (teacherToDelete) => {

        const confirmDelete = await confirmCustom(
            `Är du säker på att du vill radera ${teacherToDelete.firstName} ${teacherToDelete.lastName} permanent?`
        );


        if (!confirmDelete) return;

        try {
            await removeTeacher(teacherToDelete.id);

            setSelectedTeachers((prev) => prev.filter(t => t.id !== teacherToDelete.id));

            await refetch();

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

    useEffect(() => {
        if (event) {
            //console.log("event", event);
            setName(event.name ?? "");
            setDescription(event.description ?? "");

            if (event.teachers && Array.isArray(event.teachers)) {
                setSelectedTeachers(event.teachers);
            } else {
                setSelectedTeachers([]);
            }
        }
    }, [event]);


    async function handleFormSubmit(e) {
        e.preventDefault();

        let payload;



        try {
            if (isCourseEvent) {
            payload = {
                id: event.id,
                name,
                description,
                startTime: event.startTime ?? event.startDate,
                endTime: event.endTime ?? event.endDate,
                courseId: event.categoryId?.id,
                teachers: selectedTeachers,
            };
             const updatedEvent = await saveCourse(payload);
            onSaved?.(updatedEvent);
            onClose();
        }else if (isMiscEvent) {

            payload = {
                id: event.id,
                name,
                description,
                startTime: event.startTime ?? event.startDate,
                endTime: event.endTime ?? event.endDate,
                miscId: event.categoryId?.id,
            };

            const updatedEvent = await saveMisc(payload);
            onSaved?.(updatedEvent);
            onClose();
        } else {
            await alertCustom("Okänd eventtyp");
            return;
        }

        } catch (err) {
            console.error("Kunde inte spara eventet:", err);
            await alertCustom("Ett fel inträffade vid sparande");
        }
        refetch();
    }


    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex justify-center items-center">
            <div className="bg-white p-6 rounded-lg shadow-xl w-96">
                <h3 className="text-xl font-bold mb-4">Redigera event: {event.name}</h3>
                <form onSubmit={handleFormSubmit} className="flex flex-col gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Titel</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                            autoFocus
                        />
                        <label className="block text-sm font-medium text-gray-700">Beskrivning</label>
                        <input
                            type="text"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        />
                        <div className="flex justify-end gap-2 mt-4">
                        {isCourseEvent &&
                            <div className="mr-auto">
                                <TeacherPicker
                                    teachers={teachers}
                                    loading={loading}
                                    err={err}
                                    selectedTeachers={selectedTeachers}
                                    setSelectedTeachers={setSelectedTeachers}
                                    onCreate={() => setIsCreateTeacherModalOpen(true)}
                                    onDelete={handleDeleteTeacher}
                                />
                            </div>
                            }

                            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition">
                                Spara
                            </button>
                            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition">
                                Avbryt
                            </button>
                        </div>
                    </div>
                </form>
            </div>
            {isCreateTeacherModalOpen && (
                <CreateTeacherModal
                    onClose={() => setIsCreateTeacherModalOpen(false)}
                    onSaved={handleTeacherCreated}
                />
            )}
        </div>
    );
}
