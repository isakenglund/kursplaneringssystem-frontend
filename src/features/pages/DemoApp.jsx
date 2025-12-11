import React, {useState, useRef} from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import multiMonthPlugin from '@fullcalendar/multimonth'
import svLocale from "@fullcalendar/core/locales/sv"
import interactionPlugin from '@fullcalendar/interaction'
import {INITIAL_EVENTS, createEventId} from '../../event-utils.js'
import Sidebar from "../components/Sidebar.jsx";
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

