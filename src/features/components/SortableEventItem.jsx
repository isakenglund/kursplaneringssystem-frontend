import React from 'react';
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import ButtonEdit from "./ButtonEdit.jsx";
import ButtonRemove from "./ButtonRemove.jsx";

// En enkel ikon för handtaget
const DragHandleIcon = () => (
    <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
    </svg>
);

export function SortableEventItem({ event, parentCategory, index, isEventOnCalendar, onEdit, onRemove }) {
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
        borderLeft: `4px solid ${parentCategory.colorHex || "#3b82f6"}`
    };

    const disabled = isEventOnCalendar(event.id);

    return (
        <div
            ref={setNodeRef}
            style={style}
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
                displayIndex: event.displayIndex,
            })}
        >
            {!disabled && (
                <div
                    {...attributes}
                    {...listeners}
                    className="p-2 cursor-grab active:cursor-grabbing hover:text-gray-600 border-r border-gray-100 touch-none"
                >
                    <DragHandleIcon />
                </div>
            )}
            <div className={`flex-1 p-2 min-w-0 flex justify-between items-center ${!disabled ? "cursor-move" : ""}`}>
                <div className="min-w-0 flex-1 mr-2">
                    <span className="block truncate text-sm font-medium text-gray-700">
                        {event.displayIndex}. {event.name}
                    </span>
                </div>

                {!disabled && (
                    <div className="flex gap-1 flex-shrink-0">
                        <ButtonEdit
                            onClick={(e) => {
                                e.stopPropagation();
                                onEdit(event);
                            }}
                            onPointerDown={(e) => e.stopPropagation()}
                        />

                        <ButtonRemove
                            onClick={(e) => {
                                e.stopPropagation();
                                onRemove(event);
                            }}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}