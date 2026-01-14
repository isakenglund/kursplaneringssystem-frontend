import { useState, useEffect } from "react";
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { arrayMove, SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { SortableEventItem } from "./SortableEventItem.jsx";

/**
 * Event list component.
 * Renders a list of events (often grouped by category) and delegates actions such as
 * select, edit, delete, and drag handles to child components or callbacks.
 */
// Lägg till onOrderChange i props
export default function EventList({ eventsArray, parentCategory, type, isEventOnCalendar, isEventFiltered, onEditClick, onRemoveClick, onOrderChange }) {
    const [items, setItems] = useState([]);

    // 1. SORTERA listan när vi får in ny data från props
    useEffect(() => {
        if (eventsArray) {
            // Skapa en kopia och sortera baserat på displayIndex
            // Vi använder (|| 0) för att hantera om displayIndex är null
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

        // Om vi inte drog objektet någonstans, eller släppte utanför
        if (!over || active.id === over.id) {
            return;
        }

        setItems((prev) => {
            const oldIndex = prev.findIndex((item) => item.id === active.id);
            const newIndex = prev.findIndex((item) => item.id === over.id);

            // Flytta objektet i arrayen
            const reorderedList = arrayMove(prev, oldIndex, newIndex);

            // 2. UPPDATERA displayIndex för alla objekt i listan
            // Detta säkerställer att frontend-datan stämmer direkt (Optimistic UI)
            const updatedItems = reorderedList.map((item, index) => ({
                ...item,
                displayIndex: index // Sätt nytt index: 0, 1, 2...
            }));

            // 3. Skicka den nya listan till föräldern för att spara till DB
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
                    items={items.map(item => item.id)}
                    strategy={verticalListSortingStrategy}
                >
                    {items.map((event) => (
                        <SortableEventItem
                            key={event.id}
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