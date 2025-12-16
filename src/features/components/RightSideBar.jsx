import React, {useState} from "react";
import {formatDate} from "@fullcalendar/core";
import useGetCourses,{ useGetHolidays} from "../hooks.js";

export default function RightSideBar({
    currentEvents, setCurrentEvents, weekendsVisible, handleWeekendsToggle
                                     }) {

    //Hämta från leftSideBar sedan när det är refaktorerat
    const { data: listOfCourses, loading: loadingCourses, err: coursesGetErr } = useGetCourses();

    const [selectedVal, setSelectedVal] = useState('');
const { data: holidays = [] } = useGetHolidays();
    /*
    const filteredList = !selectedVal
        ? currentEvents // Om inget valt: Visa alla
        : currentEvents.filter(event => event.courseId === selectedVal);
    */

    function SidebarEvent({ event }) {
        return (
            <>
                <li className="text-xs text-gray-600 bg-gray-100 p-2 rounded">
                    <b>{formatDate(event.start, { year: 'numeric', month: 'short', day: 'numeric' })}</b>
                    <span className="block italic">{event.title}</span>
                </li>
            </>
        )
    }

    return (
        <div className='w-96 bg-slate-50 border-l border-gray-200 p-6 flex flex-col h-full overflow-y-auto'>
            <div className='demo-app-sidebar-section mb-6 pt-6 border-t border-gray-200'>
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

            <div>
                <select
                    id="courseSelector"
                    name="courseSelector"
                    value={selectedVal}
                    onChange={(e) => setSelectedVal(e.target.value)}
                    className="block w-full rounded-md border-0 py-2.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6 shadow-sm"
                >
                    <option value="" disabled>Välj filtrerings alternativ...</option>
                    {listOfCourses.map((course) => (
                        <option key={course.id} value={course.id}>{course.name}</option>
                    ))}
                </select>
            </div>

            <div className='demo-app-sidebar-section'>
                <h2 className="text-lg font-bold mb-3 text-gray-700">Aktiva i kalendern ({currentEvents.length-holidays.length})</h2>
                <ul className="space-y-2">
                    {currentEvents
  .filter((event) => !event.extendedProps?.wrapText) 
  .map((event) => (
    <SidebarEvent key={event.id} event={event} />
  ))}

                </ul>
            </div>
        </div>
    )
}