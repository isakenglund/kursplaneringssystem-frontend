import React, { useState } from "react";
import { formatDate } from "@fullcalendar/core";
import Select from "react-select";
import makeAnimated from 'react-select/animated'
import { useGetHolidays, useGetVacation } from "../hooks.js";
import { useGetMiscs } from "../hooks.js";

export default function RightSideBar({
    currentEvents,
    weekendsVisible,
    handleWeekendsToggle,
    selectedCourses,
    setSelectedCourses,
    listOfCourses,
    loadingCourses,
    holidayEvents,
    showRightSidebar,
}) {

    const animatedComponents = makeAnimated();

    const { data: fetchedMiscs } = useGetMiscs();
    const filteredEvents = currentEvents.filter(event => {
        if (selectedCourses.length === 0) return true;
        const eventCourseId = event.extendedProps?.courseId;
        return selectedCourses.some(choice => choice.value === eventCourseId);
    }).sort((a, b) => {
        return new Date(a.start) - new Date(b.start);
    });


    const [selectedVal, setSelectedVal] = useState('');
    const { data: holidays = [] } = useGetHolidays();
    const { data: vacation = [] } = useGetVacation();

    const totalCount = listOfCourses.reduce((sum, course) => sum + course.event.length, 0) + fetchedMiscs.reduce((sum, misc) => sum + misc.event.length, 0);

    const activeCount =
        (currentEvents?.length || 0) -
        (vacation?.length || 0) -
        (holidayEvents?.length || 0);

    function SidebarEvent({ event }) {
        return (
            <>
                <li className="text-xs text-gray-600 p-2 rounded border-l-4"
                    style={{ borderLeftColor: event.backgroundColor }}>
                    <b>{formatDate(event.start, { year: 'numeric', month: 'short', day: 'numeric' })}</b>
                    <span className="block italic">{event.title}</span>
                </li>
            </>
        )
    }

    return (
        <div
            className={`w-80 bg-slate-50 border-l border-gray-200 p-6 flex flex-col h-full overflow-y-auto transition-transform duration-300 ${showRightSidebar ? "translate-x-0" : "translate-x-full"
                }`}
        >
            <div className='demo-app-sidebar-section pt-6 border-t border-gray-200'>
                <label className="flex items-center gap-3 cursor-pointer select-none">
                    <input
                        type='checkbox'
                        checked={weekendsVisible}
                        onChange={handleWeekendsToggle}
                        className="
                            h-5 w-5 rounded-md
                             h-5 w-5 rounded-md
    border border-gray-400
    accent-blue-600
                            flex items-center justify-center
                            "
                    ></input>
                    <span className="text-lg font-bold text-gray-600">Visa helger</span>
                </label>
            </div>

            <div className='pt-6 border-t border-gray-200'>
                <Select
                    closeMenyOnSelect={false}
                    components={animatedComponents}
                    isMulti
                    isLoading={loadingCourses}
                    onChange={(selectedOptions) => setSelectedCourses(selectedOptions)}
                    options={listOfCourses.map(category => ({ value: category.id, label: category.name }))}
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
                        <SidebarEvent key={event.id} event={event} />
                    ))}
                </ul>
            </div>
        </div>
    )
}