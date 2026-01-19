import { useState, useEffect } from "react";
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { arrayMove, SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { SortableEventItem } from "./SortableEventItem.jsx";

/**
 * Event list component.
 * Renders a list of events (often grouped by category) and delegates actions such as
 * select, edit, delete, and drag handles to child components or callbacks.
 */
export default function EventList({ eventsArray, parentCategory, type, isEventOnCalendar, isEventFiltered, onEditClick, onRemoveClick, onOrderChange }) {
    const [items, setItems] = useState([]);

    useEffect(() => {
        if (eventsArray) {
            const sortedEvents = [...eventsArray].sort((a, b) =>
                (a.displayIndex || 0) - (b.displayIndex || 0)
            );
            setItems(sortedEvents);
        }
    }, [eventsArray]);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: { distance: 5 },
        })
    );

    const handleDragEnd = (event) => {
        const { active, over } = event;

        if (!over || active.id === over.id) {
            return;
        }

        setItems((prev) => {
            const oldIndex = prev.findIndex((item) => `${type}-${item.id}` === active.id);
            const newIndex = prev.findIndex((item) => `${type}-${item.id}` === over.id);

            const reorderedList = arrayMove(prev, oldIndex, newIndex);

            const updatedItems = reorderedList.map((item, index) => ({
                ...item,
                displayIndex: index
            }));

            if (onOrderChange) {
                onOrderChange(updatedItems);
            }


            return updatedItems;
        });
    };

    if (!items || items.length === 0)
        return <p className="text-sm text-gray-400 italic">Inga händelser.</p>;

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
        >
            <div className="space-y-1">
                <SortableContext
                    items={items.map(item => `${type}-${item.id}`)}
                    strategy={verticalListSortingStrategy}
                >
                    {items.map((event) => (
                        <SortableEventItem
                            key={`${type}-${event.id}`}
                            id={`${type}-${event.id}`}
                            event={event}
                            parentCategory={parentCategory}
                            type={type}
                            isEventFiltered={isEventFiltered}
                            isEventOnCalendar={isEventOnCalendar}
                            onEdit={onEditClick}
                            onRemove={onRemoveClick}
                        />
                    ))}
                </SortableContext>
            </div>
        </DndContext>
    );
}