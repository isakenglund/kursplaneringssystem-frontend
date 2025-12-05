import React, {useState, useRef} from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import multiMonthPlugin from '@fullcalendar/multimonth'
import svLocale from "@fullcalendar/core/locales/sv"
import interactionPlugin from '@fullcalendar/interaction'
import {INITIAL_EVENTS, createEventId} from '../../event-utils.js'
import Sidebar from "../components/Sidebar.jsx";

export default function DemoApp() {
    const [weekendsVisible, setWeekendsVisible] = useState(true)
    const [currentEvents, setCurrentEvents] = useState([])

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

    // -- ÄNDRAD: Skapar eventet i "externa listan" istället för direkt i kalendern --

    // -- NYTT: När ett event släpps PÅ kalendern --
    // Vi vill ta bort det från "Oplanerade listan" eftersom det nu ligger i kalendern
    function handleEventReceive(info) {
        const droppedEventId = info.event.id;

        console.log("Släppt datum: ", info.event.start.toLocaleTimeString());

        //if(droppedEventId.)
        // Ta bort eventet från externalEvents-staten
        //setExternalEvents((prev) => prev.filter(e => e.id !== droppedEventId))

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

    const [scrollPosition,setScrollPosition] = useState(0);

    const handleScroll = (e) => {
        const {scrollTop, scrollHeight, clientHeight} = e.target;
        const position = Math.ceil(
            (scrollTop / (scrollHeight - clientHeight)) * 100
        );
        setScrollPosition(position);
        console.log("HEJASN")
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


            <div className='demo-app-main flex-grow p-4'
            onScroll={handleScroll}>
                <FullCalendar
                    ref={calendarRef}
                    plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, multiMonthPlugin]}
                    views={{
                        customThreeDay: {
                            type: 'timeGrid',
                            duration: { days: 3 },
                            buttonText: '3 Dagar'
                        },
                        customTwoWeeks: {
                            type: 'timeGrid',
                            duration: { weeks: 2 },
                            buttonText: '2 Veckor'
                        },
                        multiMonthFourMonth: {
                            type: 'multiMonth',
                            duration: { months: 4 }
                        }
                    }}
                    headerToolbar={{
                        left: 'prev,next,today',
                        center: 'title',
                        right: 'customThreeDay,customTwoWeeks,dayGridMonth,timeGridWeek,timeGridDay'
                    }}
                    height="100%"
                    //Hanterar scroll grejen
                    initialView='multiWeekMonth'
                    multiWeekMaxColumns={1}

                    editable={true}
                    firstDay={1}
                    selectable={true}
                    selectMirror={true}
                    dayMaxEvents={true}
                    weekends={weekendsVisible}
                    initialEvents={INITIAL_EVENTS}
                    locale={svLocale}

                    droppable={true} // Tillåter att man släpper saker på kalendern
                    eventReceive={handleEventReceive} // Körs när ett externt event släpps här

                    eventContent={renderEventContent}
                    eventClick={handleEventClick}
                    eventsSet={handleEvents}
                    updateSize={scrollPosition}
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

