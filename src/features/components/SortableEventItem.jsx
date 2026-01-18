import React, { useState } from 'react';
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import ButtonEdit from "./ButtonEdit.jsx";
import ButtonRemove from "./ButtonRemove.jsx";

/**
 * Sortable/draggable event list item.
 * Represents a single event entry in a list with drag affordances and action controls.
 * Used when events need to be reordered or dragged as templates.
 */

const DragHandleIcon = () => (
    <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
    </svg>
);
const DisabledDragHandleIcon = () => (
    <svg className="w-4 h-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
        />
    </svg>
);

export function SortableEventItem({ id, event, parentCategory, isEventOnCalendar, onEdit, onRemove, isEventFiltered, type }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: id });

    const style = {
        transform: CSS.Translate.toString(transform),
        transition,
        zIndex: isDragging ? 50 : "auto",
        opacity: isDragging ? 0.5 : 1,
        borderLeft: `4px solid ${parentCategory.colorHex || "#3b82f6"}`
    };

    const disabled = isEventOnCalendar(event.id);
    const filtered = isEventFiltered(parentCategory.id, type);
    const isDraggable = !disabled && !filtered;

    const [openTeachers, setOpenTeachers] = useState({});

    const toggleTeachers = (eventId) => {
        setOpenTeachers(prev => ({ ...prev, [eventId]: !prev[eventId] }));
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`rounded border shadow-sm text-sm font-medium flex flex-row items-stretch transition overflow-hidden
             ${isDraggable ? "fc-event-external cursor-move" : "cursor-not-allowed"}
               ${disabled || filtered
                ? "bg-gray-200 text-gray-400"
                : "bg-white border-gray-200 hover:bg-blue-50 border-l-4 border-l-blue-500 text-gray-700"
            }`}

            {...(isDraggable && {
                "data-event": JSON.stringify({
                    id: `${event.id}_${type === "COURSE" ? "course" : "misc"}`,
                    title: event.name,
                    start: event.startDate || event.startTime,
                    end: event.endDate || event.endTime,
                    duration: (!event.endDate && !event.endTime) ? "01:00" : undefined,
                    courseId: type === "COURSE" ? parentCategory.id : undefined,
                    miscId: type !== "COURSE" ? parentCategory.id : undefined,
                    description: event.description,
                    color: parentCategory.colorHex || "#3b82f6",
                    teachers: event.teachers,
                    displayIndex: event.displayIndex,
                }),
            })}
        >
            {!disabled ? (
                <div
                    {...attributes}
                    {...listeners}
                    className="w-10 flex items-center justify-center cursor-grab active:cursor-grabbing hover:bg-gray-100 touch-none flex-shrink-0"
                >
                    <DragHandleIcon />
                </div>
            ) : (
                <div className="w-10 flex items-center justify-center flex-shrink-0 cursor-not-allowed">
                    <DisabledDragHandleIcon />
                </div>
            )}

            <div className="flex-1 p-1 min-w-0 flex flex-col justify-center">

                <div className="min-w-0">
                <span
                    className="block truncate text-sm font-bold text-gray-700"
                    title={event.name}
                >
                    {event.name}
                </span>
                </div>

                {event.teachers?.length > 0 && (
                    <div className="mt-1 text-xs text-gray-500">
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                toggleTeachers(event.id);
                            }}
                            className="font-bold inline-flex items-center gap-1 hover:underline"
                        >
                            Lärare
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                                className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${openTeachers[event.id] ? "rotate-90" : ""}`}
                            >
                                <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                            </svg>
                        </button>

                        {openTeachers[event.id] && (
                            <div className="mt-1 flex flex-col">
                                {event.teachers.map((t) => (
                                    <div key={t.id} className="pl-4">
                                        {t.firstName} {t.lastName}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
            {!disabled && (
                <div className="flex items-center gap-1 pr-1 pl-1 flex-shrink-0">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onEdit(event);
                        }}
                        className="w-8 h-8 flex items-center justify-center text-gray-700 hover:text-green-600 hover:bg-green-50 rounded-full transition"
                        type="button"
                        title="Redigera"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                        </svg>
                    </button>

                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onRemove(event);
                        }}
                        className="w-8 h-8 flex items-center justify-center text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-full transition"
                        type="button"
                        title="Ta bort"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                        </svg>
                    </button>
                </div>
            )}
        </div>
    );
}