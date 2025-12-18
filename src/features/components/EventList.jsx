import { useState, useEffect } from "react";
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { arrayMove, SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import {SortableEventItem} from "./SortableEventItem.jsx";

// Ersätt propsen med de du faktiskt har i din kod
export default function EventList({ eventsArray, parentCategory, type, isEventOnCalendar, onEditClick, onRemoveClick }) {
    const [items, setItems] = useState(eventsArray);

    // Uppdatera state om prop ändras utifrån
    useEffect(() => {
        setItems(eventsArray);
    }, [eventsArray]);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            // Kräver att man drar 5px innan det räknas, förhindrar att man råkar dra när man klickar
            activationConstraint: { distance: 5 },
        })
    );

    const handleDragEnd = (event) => {
        const { active, over } = event;

        if (active.id !== over.id) {
            setItems((prev) => {
                const oldIndex = prev.findIndex((item) => item.id === active.id);
                const newIndex = prev.findIndex((item) => item.id === over.id);

                const newOrder = arrayMove(prev, oldIndex, newIndex);

                // TODO: Här bör du anropa en funktion för att spara nya ordningen till databasen/API
                // onOrderChange(newOrder);

                return newOrder;
            });
        }
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
                    items={items.map(item => item.id)}
                    strategy={verticalListSortingStrategy}
                >
                    {items.map((event, index) => (
                        <SortableEventItem
                            key={event.id}
                            event={event}
                            index={index}
                            parentCategory={parentCategory}
                            type={type}
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