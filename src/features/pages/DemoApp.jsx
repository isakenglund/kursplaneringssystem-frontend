import React, {useState, useRef} from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import svLocale from "@fullcalendar/core/locales/sv"
import interactionPlugin from '@fullcalendar/interaction'
import {INITIAL_EVENTS, createEventId} from '../../event-utils.js'
import Sidebar from "../components/Sidebar.jsx";
import { useGetHolidays } from '../hooks.js'

export default function DemoApp() {
    const [weekendsVisible, setWeekendsVisible] = useState(true)
    const [currentEvents, setCurrentEvents] = useState([])
    const [externalEvents, setExternalEvents] = useState([
        {id: createEventId(), title: 'Oplanerat uppdrag 1'},
        {id: createEventId(), title: 'Oplanerat uppdrag 2'}
    ])
    const calendarRef = useRef(null)
    const { data: holidays = [] } = useGetHolidays();


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
    const eventDate = info.event.start; // JS Date object
    const eventMonth = eventDate.getMonth() + 1; // JS months are 0-indexed
    const eventDay = eventDate.getDate();

    // Check if the date is a holiday
     const isHoliday = holidays.some(h => {
        const match = h.month === eventMonth && h.day === eventDay;
        return match;
    });


    if (isHoliday) {
        alert("You cannot drop events on a holiday!");
        info.revert(); // Undo the drop in FullCalendar
        return;
    }

    console.log("Dropped date: ", eventDate.toLocaleString());

    // Disable the event in externalEvents
    setExternalEvents(prev =>
        prev.map(e =>
            e.id === droppedEventId ? { ...e, disabled: true } : e
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

