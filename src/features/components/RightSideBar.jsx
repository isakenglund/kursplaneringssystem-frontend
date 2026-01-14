import React from "react";
import { formatDate } from "@fullcalendar/core";
import Select from "react-select";
import makeAnimated from 'react-select/animated'

/**
 * Right sidebar panel.
 * Provides filtering (multi-select) by category and displays a sorted summary list of events currently in the calendar.
 * Also shows basic counts (active vs total) to give the user a quick overview.
 */
export default function RightSideBar({
                                         currentEvents,
                                         selectedCategories,
                                         setSelectedCategories,
                                         listOfCategories,
                                         loadingCourses,
                                         holidayEvents,
                                         showRightSidebar,
                                         vacation,
                                     }) {

    const animatedComponents = makeAnimated();

    const filteredEvents = currentEvents.filter(event => {
        if (selectedCategories.length === 0) return true;
        const eventCourseId = event.extendedProps?.courseId;
        const eventMiscId = event.extendedProps?.miscId;
        return selectedCategories.some(choice => choice.value === eventCourseId || choice.value === eventMiscId);
    }).sort((a, b) => {
        return new Date(a.start) - new Date(b.start);
    });

    const totalCount = listOfCategories.reduce((sum, course) => sum + course.event.length, 0);

    const activeCount =
        (currentEvents?.length || 0) -
        (vacation?.length || 0) -
        (holidayEvents?.length || 0);

    function SidebarEvent({event}) {
        return (
            <>
                <li className="text-gray-600 rounded border-l-4 border border-gray-200"
                    style={{ borderLeftColor: event.backgroundColor }}>
                    <b className="ml-3">{formatDate(event.start, {year: 'numeric', month: 'short', day: 'numeric'})}</b><span className="italic"> {event.title}</span>
                </li>
            </>
        )
    }

    if(!showRightSidebar){return null}

    return (
        <div className="w-96 h-full flex flex-col overflow-y-auto p-4" >

                <div className='demo-app-sidebar-section'>
                        <Select
                            closeMenyOnSelect={false}
                            components={animatedComponents}
                            isMulti
                            isLoading={loadingCourses}
                            onChange={(selectedOptions) => setSelectedCategories(selectedOptions)}
                            options={listOfCategories.map(category => ({value: category.id, label: category.name}))}
                            placeholder="Filtrera på kategorier..."
                        />

                    <h2
                        className={`text-lg font-bold pt-4 mb-2 ${Number(activeCount) === Number(totalCount) ? "text-green-600" : "text-gray-700"
                            }`}
                    >
                        Aktiva i kalendern {activeCount} / {totalCount}
                    </h2>

                <ul className="space-y-2">
                    {filteredEvents.filter((event) => !event.extendedProps?.wrapText).map((event) => (
                        <SidebarEvent key={event.id} event={event}/>
                    ))}
                </ul>
            </div>
        </div>
    )
}