import React, {useState} from "react";
import {formatDate} from "@fullcalendar/core";
import useGetCourses from "../hooks.js";
import Select from "react-select";
import makeAnimated from 'react-select/animated'

export default function RightSideBar({
    currentEvents , weekendsVisible, handleWeekendsToggle,selectedCourses,
                                     setSelectedCourses,
                                     listOfCourses,
                                     loadingCourses
                                     }) {

    const animatedComponents = makeAnimated();

    const filteredEvents = currentEvents.filter(event => {

        if (selectedCourses.length === 0) return true;
        const eventCourseId = event.extendedProps?.courseId;
        return selectedCourses.some(choice => choice.value === eventCourseId);
    }).sort((a, b) => {
        return new Date(a.start) - new Date(b.start);
    });


    function SidebarEvent({ event }) {
        return (
            <>
                <li className="text-xs text-gray-600 p-2 rounded border-l-4"
                    style={{borderLeftColor: event.backgroundColor}}>
                    <b>{formatDate(event.start, { year: 'numeric', month: 'short', day: 'numeric' })}</b>
                    <span className="block italic">{event.title}</span>
                </li>
            </>
        )
    }

    return (
        <div className='demo-app-sidebarw-80 bg-slate-50 border-l border-gray-200 p-6 flex flex-col h-full overflow-y-auto'>
            <div className='demo-app-sidebar-section pt-6 border-t border-gray-200'>
                <label className="flex items-center gap-3 cursor-pointer select-none">
                    <input
                        type='checkbox'
                        checked={weekendsVisible}
                        onChange={handleWeekendsToggle}
                        className="
                            h-5 w-5 rounded-md
                            appearance-none
                            border border-gray-400
                            checked:bg-blue-600
                            checked:border-blue-600
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
                    options={listOfCourses.map(category => ({value: category.id, label: category.name}))}
                    placeholder = "Filtrera på kategorier..."
                    />
            </div>

            <div className='demo-app-sidebar-section'>
                <h2 className="text-lg font-bold mb-3 text-gray-700">Aktiva i kalendern ({currentEvents.length})</h2>
                <ul className="space-y-2 ">
                    {filteredEvents.map((event) => (
                        <SidebarEvent key={event.id} event={event} />
                    ))}
                </ul>
            </div>
        </div>
    )
}