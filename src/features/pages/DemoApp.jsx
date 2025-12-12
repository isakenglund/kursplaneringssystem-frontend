import React, { useState, useRef } from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import multiMonthPlugin from '@fullcalendar/multimonth'
import svLocale from "@fullcalendar/core/locales/sv"
import interactionPlugin from '@fullcalendar/interaction'
import { INITIAL_EVENTS} from '../../event-utils.js'
import Sidebar from "../components/Sidebar.jsx";
import useGetCourses, { useGetHolidays } from '../hooks.js'
import '../Calendar.css'

export default function DemoApp() {
    const [weekendsVisible, setWeekendsVisible] = useState(true)
    const [currentEvents, setCurrentEvents] = useState([])

    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    const todayDate = `${yyyy}-${mm}-${dd}`;

    const [dateRange, setDateRange] = useState({
        start: todayDate,
        end: todayDate,
    })
    const [showDateInputs, setShowDateInputs] = useState(false);

    const handleDatesSet = (dateInfo) => {
        if (dateInfo.view.type === 'customInterval') {
            setShowDateInputs(true);
        } else {
            setShowDateInputs(false);
        }
    }

    const handleCustomDateChange = (direction) =>{

        const calendarApi = calendarRef.current.getApi();

        if(calendarApi.view.type === 'customInterval') {
            const newStart = new Date(dateRange.start)
            const newEnd = new Date(dateRange.end)

            const diffTime = Math.abs(newEnd.getTime() - newStart.getTime())
            const diffDays = Math.ceil(diffTime / (1000*60*60*24)+1);

            const sign = direction === 'next' ? 1 : -1;

            newStart.setDate(newStart.getDate() + diffDays * sign);
            newEnd.setDate(newEnd.getDate() + diffDays * sign);

            setDateRange({start: newStart.toISOString().split('T')[0], end: newEnd.toISOString().split('T')[0]});
        }
        else{
            calendarApi[direction]();
        }

    }

    const updateDateRange = (e) => {
        setDateRange({...dateRange, [e.target.name]: e.target.value});
    }

    const calendarRef = useRef(null)

    const { data: listOfCourses, loading: loadingCourses} = useGetCourses();
    const { data: holidays = [] } = useGetHolidays();

    function handleWeekendsToggle() {
        setWeekendsVisible(!weekendsVisible)
    }

    function handleRemoveEventFromSidebar(eventId) {

    }

    function validateEventDrop(info) {
        if(!info.event.extendedProps || !info.event.extendedProps.courseId ) {
            return true;
        }
        const movedEventId = parseInt(info.event.id, 10);
        console.log("Flyttar ID:", movedEventId);
        const courseId = parseInt(info.event.extendedProps.courseId, 10);
        const course = listOfCourses.find(c => c.id === courseId);

        if (!course) { console.log("Hittade ingen kurs"); return true; }

        const courseEvents = course.event;
        const currentIndex = courseEvents.findIndex(e => e.id === movedEventId);
        console.log("Index i listan:", currentIndex);
        if(currentIndex === -1) {
            console.log("Hittade inte eventet i kurslistan. Avbryter validering.");
            return true;
        }

        const calendar = info.view.calendar;
        const movedEventStart = info.event.start;
        const movedEventEnd = info.event.end || new Date(movedEventStart.getTime() + (info.event.allDay ? 24 : 1) * 60 * 60 * 1000);

        for (let i = 0; i < currentIndex; i++) {
            const earlierEventData = courseEvents[i];
            const earlierEventOnCalendar = calendar.getEventById(String(earlierEventData.id));

            if (earlierEventOnCalendar) {
                const earlierEventEnd = earlierEventOnCalendar.end || earlierEventOnCalendar.start;

                if (movedEventStart < earlierEventEnd) {
                    console.log("Ogiltig ordning")
                    info.revert();
                    return false;
                }
            }
        }

        for (let i = currentIndex + 1; i < courseEvents.length; i++) {
            const laterEventData = courseEvents[i];
            const laterEventOnCalendar = calendar.getEventById(String(laterEventData.id));

            if(laterEventOnCalendar) {
                const laterEventStart = laterEventOnCalendar.start;

                if(movedEventEnd > laterEventStart) {
                    console.log("Ogiltig ordning")
                    info.revert();
                    return false;
                }
            }
        }

        return true;
    }

    function checkForHoliday(info) {
        const eventDate = info.event.start;
        const eventMonth = eventDate.getMonth() + 1;
        const eventDay = eventDate.getDate();

        const matchingHoliday = holidays.find(
            h => h.month === eventMonth && h.day === eventDay
        );

        if (matchingHoliday) {
            const holidayName = matchingHoliday.name;
            alert(`You cannot drop events on a holiday: ${holidayName}`);
            info.revert();
            return true;
        }

        return false;
    }

    function handleEventReceive(info) {
        const isValidEventPlacement = validateEventDrop(info);
        const isHoliday = checkForHoliday(info);

        if(isHoliday) {
            return;
        }

        if (!isValidEventPlacement) {
            return;
        }
    }

    function handleEventDrop(info) {
        validateEventDrop(info);
        if(checkForHoliday(info)) return;
    }

    function handleEventClick(clickInfo) {
        if (confirm(`Är du säker på att du vill ta bort händelsen '${clickInfo.event.title}'?`)) {
            clickInfo.event.remove();
        }
    }

    function handleEvents(events) {
        setCurrentEvents(events)
    }

    return (
        <div className='demo-app relative h-screen flex'>

            <Sidebar
                weekendsVisible={weekendsVisible}
                handleWeekendsToggle={handleWeekendsToggle}
                currentEvents={currentEvents}
                listOfCourses={listOfCourses || []}
                loadingCourses={loadingCourses}
                onRemoveEvent={handleRemoveEventFromSidebar}
            />

            <div className='demo-app-main flex-grow p-4'>
                <div class="fc">
                    {showDateInputs && (
                    <div className="flex ml-auto">
                        <input
                            className="mb-1 block w-39 rounded-md border border-gray-300 p-2 shadow-sm
                            focus:ring-blue-500 focus:border-blue-500"
                            type="date"
                            name="start"
                            value={dateRange.start}
                            onChange={updateDateRange}
                        />
                        <input
                            className="mb-1 block w-39 rounded-md border border-gray-300 p-2 shadow-sm
                            focus:ring-blue-500 focus:border-blue-500"
                            type="date"
                            name="end"
                            value={dateRange.end}
                            onChange={updateDateRange}
                        />
                    </div>
                        )}
                </div>


                <FullCalendar
                    ref={calendarRef}
                    plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, multiMonthPlugin]}
                    views={{
                        customTwoWeeks: {
                            type: 'timeGrid',
                            duration: { weeks: 2 },
                            buttonText: '2 Veckor',
                        },
                        customInterval: {
                            type: 'timeGrid',
                            buttonText: 'Intervall',
                        },
                        customMultiMonth: {
                            type: 'multiMonthYear',
                            buttonText: 'Months',
                        }
                    }}

                    customButtons={{
                        smartPrev: {
                            icon: 'chevron-left',
                            click: () => handleCustomDateChange('prev')
                        },
                        smartNext: {
                            icon: 'chevron-right',
                            click: () => handleCustomDateChange('next')
                        }
                    }}
                    dayHeaderFormat={{
                        weekday: 'short',
                        day: 'numeric',
                        month: 'numeric',
                        omitCommas: true
                    }}
                    headerToolbar={{
                        left: 'smartPrev,smartNext,today',
                        center: 'title',
                        right: 'customInterval,customMultiMonth,customTwoWeeks,timeGridWeek,timeGridDay'
                    }}
                    height="100%"

                    datesSet={handleDatesSet}

                    initialView='multiMonthYear'
                    multiMonthMaxColumns={1}

                    visibleRange={showDateInputs
                        ? { start: dateRange.start, end: new Date(dateRange.end) }
                        : undefined}

                    slotMinTime={'06:00:00'}
                    slotMaxTime={'18:00:00'}

                    editable={true}
                    firstDay={1}
                    selectable={true}
                    selectMirror={true}
                    dayMaxEvents={true}
                    weekends={weekendsVisible}
                    initialEvents={INITIAL_EVENTS}
                    locale={svLocale}
                    droppable={true}
                    eventReceive={handleEventReceive}
                    eventDrop={handleEventDrop}
                    eventContent={renderEventContent}
                    eventClick={handleEventClick}
                    eventsSet={handleEvents}
                    eventColor={function (info) {
                        return info.event.extendedProps.color; // use the color you passed
                    }}
                />
            </div>
        </div>
    )
}

function renderEventContent(eventInfo) {
    return (
        <>
            <b>{eventInfo.timeText}</b>
            <i className="ml-1">{eventInfo.event.title}</i>
        </>
    )
}

