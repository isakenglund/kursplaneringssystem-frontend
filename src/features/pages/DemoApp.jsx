import React, { useState, useRef } from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import multiMonthPlugin from '@fullcalendar/multimonth'
import svLocale from "@fullcalendar/core/locales/sv"
import interactionPlugin from '@fullcalendar/interaction'
import { INITIAL_EVENTS, createEventId } from '../../event-utils.js'
import Sidebar from "../components/Sidebar.jsx";
import { useGetHolidays } from '../hooks.js'
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

    const [externalEvents, setExternalEvents] = useState([
        { id: createEventId(), title: 'FL1' }
    ])
    const calendarRef = useRef(null)
    const { data: holidays = [] } = useGetHolidays();

    function handleWeekendsToggle() {
        setWeekendsVisible(!weekendsVisible)
    }

    function removeExternalEvent(eventId) {
        if (confirm(`Vill du ta bort eventet?`)) {
            setExternalEvents(prev => prev.filter(e => e.id !== eventId));
        }
    }

    function validateEventDrop(info, externalEvents) {
        const movedEventId = info.event.id;
        const movedEventStart = info.event.start;
        const movedEventEnd = info.event.end || new Date(movedEventStart.getTime() + 60 * 60 * 1000);
        const eventDate = info.event.start; // JS Date object
        const eventMonth = eventDate.getMonth() + 1; // JS months are 0-indexed
        const eventDay = eventDate.getDate();

        // Check if the date is a holiday
        // Find the holiday that matches the event date
        const matchingHoliday = holidays.find(
            h => h.month === eventMonth && h.day === eventDay
        );

        if (matchingHoliday) {
            const holidayName = matchingHoliday.name;
            alert(`You cannot drop events on a holiday: ${holidayName}`);
            info.revert(); // Undo the drop
            return;
        }

        const index = externalEvents.findIndex(e => e.id === movedEventId);
        const calendar = info.view.calendar;

        if (index > 0) {
            const prevEvent = externalEvents[index - 1];
            const prevEventOnCalendar = calendar.getEventById(prevEvent.id);

            if (prevEventOnCalendar) {
                const prevEventEndTime = prevEventOnCalendar.end || prevEventOnCalendar.start;
                if (movedEventStart < prevEventEndTime) {
                    alert(`Ogiltig placerin, eventet måste ligga EFTER ${prevEvent.title}.`);
                    info.revert();
                    return false;
                }
            }
        }
        if (index < externalEvents.length - 1) {
            const nextEvent = externalEvents[index + 1];
            const nextEventOnCalendar = calendar.getEventById(nextEvent.id);

            if (nextEventOnCalendar) {
                const nextEventStartTime = nextEventOnCalendar.start;
                if (movedEventEnd > nextEventStartTime) {
                    alert(`Ogiltig placering! Måste ligga FÖRE ${nextEvent.title}.`);
                    info.revert();
                    return false;
                }
            }
        }

        return true;
    }

    function handleEventReceive(info) {
        const isValidEventPlacement = validateEventDrop(info, externalEvents);

        if (!isValidEventPlacement) {
            return;
        }

        const droppedEventId = info.event.id;
        const eventDate = info.event.start; // JS Date object


        console.log("Dropped date: ", eventDate.toLocaleString());

        // Disable the event in externalEvents
        setExternalEvents(prev =>
            prev.map(e =>
                e.id === droppedEventId ? { ...e, disabled: true } : e
            )
        );

        setExternalEvents(prev =>
            prev.map(e =>
                e.id === droppedEventId ? { ...e, disabled: true } : e
            )
        );
    }

    function handleEventDrop(info) {
        validateEventDrop(info, externalEvents);
    }

    function handleEventClick(clickInfo) {
        if (confirm(`Are you sure you want to delete the event '${clickInfo.event.title}'?`)) {
            const removedEventId = clickInfo.event.id;

            clickInfo.event.remove();

            setCurrentEvents(prev => prev.filter(event => event.id !== removedEventId));

            setExternalEvents(prev =>
                prev.map(e =>
                    e.id === removedEventId ? { ...e, disabled: false } : e
                )
            );
        }
    }

    function handleEvents(events) {
        setCurrentEvents(events)
    }

    function addExternalEvent(newEvent) {
        setExternalEvents(prev => [...prev, newEvent]);
    }

    return (
        <div className='demo-app relative h-screen flex'>

            <Sidebar
                weekendsVisible={weekendsVisible}
                handleWeekendsToggle={handleWeekendsToggle}
                currentEvents={currentEvents}
                externalEvents={externalEvents}
                addExternalEvent={addExternalEvent}
                removeExternalEvent={removeExternalEvent} // <-- ny prop
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

