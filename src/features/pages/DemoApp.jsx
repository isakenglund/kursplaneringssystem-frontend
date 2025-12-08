import React, {useState, useRef} from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
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
        if (confirm(`Vill du ta bort eventet?`)) {
            setExternalEvents(prev => prev.filter(e => e.id !== eventId));
        }
    }

    function handleEventReceive(info) {
        const droppedEventId = info.event.id;
        const droppedEventStart = info.event.start;

        const externalIndex = externalEvents.findIndex(e => e.id === droppedEventId);

        if (externalIndex > 0) {

            const previousEvent = externalEvents[externalIndex - 1];
            const previousEventId = previousEvent.id;

            const calendar = info.view.calendar;
            const previousEventOnCalendar = calendar.getEventById(previousEventId);

            if (previousEventOnCalendar) {
                const prevEnd = previousEventOnCalendar.end || previousEventOnCalendar.start;

                if (droppedEventStart < prevEnd) {

                    if(confirm(`Det är inte en giltig tid för det eventet.`)) {
                        info.revert();
                        return;
                    }
                }
            }
        }


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
                <FullCalendar
                    ref={calendarRef}
                    plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                    headerToolbar={{
                        left: 'prev,next today',
                        center: 'title',
                        right: 'dayGridMonth,timeGridWeek,timeGridDay'
                    }}
                    initialView='timeGridWeek'
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

