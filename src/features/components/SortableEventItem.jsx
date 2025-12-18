import React from 'react';
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

// En enkel ikon för handtaget
const DragHandleIcon = () => (
    <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
    </svg>
);

export function SortableEventItem({ event, parentCategory, type, index, isEventOnCalendar, onEdit, onRemove }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: event.id });

    // CSS för rörelsen
    const style = {
        transform: CSS.Translate.toString(transform),
        transition,
        zIndex: isDragging ? 50 : "auto",
        opacity: isDragging ? 0.5 : 1,
        // Vi sätter border direkt här
        borderLeft: `4px solid ${parentCategory.colorHex || "#3b82f6"}`
    };

    const disabled = isEventOnCalendar(event.id);

    return (
        <div
            ref={setNodeRef}
            style={style}
            // fc-event-external behövs för att FullCalendar ska hitta elementet
            className={`flex items-center mb-1 rounded border shadow-sm bg-white fc-event-external
                ${disabled ? "opacity-50 cursor-not-allowed pointer-events-none" : "hover:bg-blue-50"}`}

            // FullCalendar data-attributen ligger på huvud-diven
            data-event={JSON.stringify({
                id: event.id,
                title: event.name,
                start: event.startDate || event.startTime,
                end: event.endDate || event.endTime,
                courseId: parentCategory.id,
                miscId: parentCategory.id,
                color: parentCategory.colorHex || "#3b82f6",
                teachers: event.teachers,
            })}
        >
            {/* --- 1. DRAG HANDLE (För sortering) --- */}
            {/* Vi gömmer handtaget om eventet är inaktiverat */}
            {!disabled && (
                <div
                    {...attributes}
                    {...listeners}
                    className="p-2 cursor-grab active:cursor-grabbing hover:text-gray-600 border-r border-gray-100 touch-none"
                    title="Dra för att sortera ordning"
                >
                    <DragHandleIcon />
                </div>
            )}

            {/* --- 2. MAIN CONTENT (För FullCalendar dragning) --- */}
            <div className={`flex-1 p-2 min-w-0 flex justify-between items-center ${!disabled ? "cursor-move" : ""}`}>
                <div className="min-w-0 flex-1 mr-2">
                    <span className="block truncate text-sm font-medium text-gray-700" title={event.name}>
                        {index + 1}. {event.teachers} {event.name}
                    </span>
                </div>

                {!disabled && (
                    <div className="flex gap-1 flex-shrink-0">
                        {/* EDIT */}
                        <button
                            className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                            onPointerDown={(e) => e.stopPropagation()} // Stoppa drag-konflikter
                            onClick={(e) => {
                                e.stopPropagation();
                                onEdit(event);
                            }}
                        >
                            {/* Ersätt med din ButtonEdit */}
                            ✏️
                        </button>

                        {/* DELETE */}
                        <button
                            className="p-1 text-red-600 hover:bg-red-100 rounded"
                            onPointerDown={(e) => e.stopPropagation()}
                            onClick={(e) => {
                                e.stopPropagation();
                                onRemove(event);
                            }}
                        >
                            {/* Ersätt med din ButtonRemove */}
                            🗑️
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}