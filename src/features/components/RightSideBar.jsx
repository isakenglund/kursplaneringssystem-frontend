import React from "react";
import { formatDate } from "@fullcalendar/core";
import Select from "react-select";
import makeAnimated from 'react-select/animated'

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
                <li className="text-xs text-gray-600 p-2 rounded border-l-4"
                    style={{ borderLeftColor: event.backgroundColor }}>
                    <b>{formatDate(event.start, {year: 'numeric', month: 'short', day: 'numeric'})}</b>
                    <span className="block italic">{event.title}</span>
                </li>
            </>
        )
    }

    if(!showRightSidebar){return null}

    return (
        <div className={`h-full overflow-hidden transition-[width] duration-300 ${showRightSidebar ? "w-96" : "w-0"} p-4`} >


            <div>
                <Select
                    closeMenyOnSelect={false}
                    components={animatedComponents}
                    isMulti
                    isLoading={loadingCourses}
                    onChange={(selectedOptions) => setSelectedCategories(selectedOptions)}
                    options={listOfCategories.map(category => ({value: category.id, label: category.name}))}
                    placeholder="Filtrera på kategorier..."
                />
            </div>

                <div className='demo-app-sidebar-section'>
                    <h2
                        className={`text-lg font-bold mb-3 ${Number(activeCount) === Number(totalCount) ? "text-green-600" : "text-gray-700"
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