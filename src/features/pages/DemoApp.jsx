import React, {useState, useRef} from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import multiMonthPlugin from '@fullcalendar/multimonth'
import svLocale from "@fullcalendar/core/locales/sv"
import interactionPlugin from '@fullcalendar/interaction'
import {INITIAL_EVENTS, createEventId} from '../../event-utils.js'
import Sidebar from "../components/Sidebar.jsx";
import '../Calenda.css'

export default function DemoApp() {
    const [weekendsVisible, setWeekendsVisible] = useState(true)
    const [currentEvents, setCurrentEvents] = useState([])

    const [dateRange, setDateRange] = useState({
        start: '2020-01-01',
        end: '2020-01-16'
    })

    const [externalEvents, setExternalEvents] = useState([
        {id: createEventId(), title: 'Oplanerat uppdrag 1'},
        {id: createEventId(), title: 'Oplanerat uppdrag 2'}
    ])
    const calendarRef = useRef(null)

    function handleWeekendsToggle() {
        setWeekendsVisible(!weekendsVisible)
    }

    function removeExternalEvent(eventId) {
        if (confirm(`Are you sure you want to delete the event`)) {
            setExternalEvents(prev => prev.filter(e => e.id !== eventId));
        }
    }


    function handleEventReceive(info) {
        const droppedEventId = info.event.id;

        console.log("Släppt datum: ", info.event.start.toLocaleTimeString());

        setExternalEvents(prev =>
            prev.map(e =>
                e.id === droppedEventId ? {...e, disabled: true} : e
            )
        );

    }

    function handleEventClick(clickInfo) {
        if (confirm(`Are you sure you want to delete the event '${clickInfo.event.title}'?`)) {
            const removedEventId = clickInfo.event.id;

            // Ta bort från kalendern
            clickInfo.event.remove();

            // Uppdatera currentEvents så Sidebar renderas om
            setCurrentEvents(prev => prev.filter(event => event.id !== removedEventId));

            // Om eventet fanns i externalEvents, återaktivera det
            setExternalEvents(prev =>
                prev.map(e =>
                    e.id === removedEventId ? {...e, disabled: false} : e
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
                <input
                    type="date"
                    value={dateRange.start}
                    onChange={(e) => setDateRange(e.target.value)}
                    className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm
            focus:ring-blue-500 focus:border-blue-500"/>
                <FullCalendar
                    ref={calendarRef}
                    plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, multiMonthPlugin]}
                    views={{
                        customTwoWeeks: {
                            type: 'timeGrid',
                            duration: { weeks: 2 },
                            buttonText: '2 Veckor'
                        },
                        customInterval: {
                            type: 'timeGrid',
                            buttonText: 'Intervall'
                        }
                    }}
                    headerToolbar={{
                        left: 'prev,next,today',
                        center: 'title',
                        right: 'customInterval,dayGridMonth,customTwoWeeks,timeGridWeek,timeGridDay'
                    }}
                    height="100%"

                    initialView='multiMonthYear'
                    multiMonthMaxColumns={1}

                    visibleRange={dateRange}

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

                    eventContent={renderEventContent}
                    eventClick={handleEventClick}
                    eventsSet={handleEvents}
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

