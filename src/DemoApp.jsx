import React, { useState, useRef, useEffect } from 'react'
import { formatDate } from '@fullcalendar/core'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import svLocale from "@fullcalendar/core/locales/sv"
import interactionPlugin, { Draggable } from '@fullcalendar/interaction'
import { INITIAL_EVENTS, createEventId } from './event-utils'

export default function DemoApp() {
    const [weekendsVisible, setWeekendsVisible] = useState(true)
    const [currentEvents, setCurrentEvents] = useState([])

    const [externalEvents, setExternalEvents] = useState([
        { id: createEventId(), title: 'Oplanerat uppdrag 1' },
        { id: createEventId(), title: 'Oplanerat uppdrag 2' }
    ])
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [newEventTitle, setNewEventTitle] = useState('')

    const calendarRef = useRef(null)

    function handleWeekendsToggle() {
        setWeekendsVisible(!weekendsVisible)
    }

    // -- ÄNDRAD: Skapar eventet i "externa listan" istället för direkt i kalendern --
    function handleFormSubmit(e) {
        e.preventDefault()

        if (newEventTitle) {
            const newExternalEvent = {
                id: createEventId(),
                title: newEventTitle
            }

            // Lägg till i listan för oplanerade events
            setExternalEvents([...externalEvents, newExternalEvent])

            // Stäng modal och rensa
            setIsModalOpen(false)
            setNewEventTitle('')
        } else {
            alert('Vänligen fyll i en titel')
        }
    }

    // -- NYTT: När ett event släpps PÅ kalendern --
    // Vi vill ta bort det från "Oplanerade listan" eftersom det nu ligger i kalendern
    function handleEventReceive(info) {
        const droppedEventId = info.event.id;

        // Ta bort eventet från externalEvents-staten
        setExternalEvents((prev) => prev.filter(e => e.id !== droppedEventId))
    }

    function handleEventClick(clickInfo) {
        if (confirm(`Are you sure you want to delete the event '${clickInfo.event.title}'`)) {
            clickInfo.event.remove()
        }
    }

    function handleEvents(events) {
        setCurrentEvents(events)
    }

    return (
        <div className='demo-app relative h-screen flex'>

            {/* -- MODAL (Bara titel nu) -- */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex justify-center items-center">
                    <div className="bg-white p-6 rounded-lg shadow-xl w-96">
                        <h3 className="text-xl font-bold mb-4">Skapa oplanerat event</h3>
                        <form onSubmit={handleFormSubmit} className="flex flex-col gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Titel</label>
                                <input
                                    type="text"
                                    value={newEventTitle}
                                    onChange={(e) => setNewEventTitle(e.target.value)}
                                    className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="T.ex. Kundbesök..."
                                    autoFocus
                                />
                            </div>
                            <div className="flex justify-end gap-2 mt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition"
                                >
                                    Avbryt
                                </button>
                                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition">
                                    Lägg i lista
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <Sidebar
                weekendsVisible={weekendsVisible}
                handleWeekendsToggle={handleWeekendsToggle}
                currentEvents={currentEvents}
                externalEvents={externalEvents} // Skickar ner listan
                openModal={() => setIsModalOpen(true)}
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
                    selectable={true}
                    selectMirror={true}
                    dayMaxEvents={true}
                    weekends={weekendsVisible}
                    initialEvents={INITIAL_EVENTS}
                    locale={svLocale}

                    // -- VIKTIGA TILLÄGG --
                    droppable={true} // Tillåter att man släpper saker på kalendern
                    eventReceive={handleEventReceive} // Körs när ett externt event släpps här
                    // ---------------------

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

// -- UPPDATERAD SIDEBAR MED DRAGGABLE LOGIK --
function Sidebar({ weekendsVisible, handleWeekendsToggle, currentEvents, externalEvents, openModal }) {
    const draggableContainerRef = useRef(null);

    // Initiera Draggable funktionaliteten på containern
    useEffect(() => {
        let draggable = null;

        if (draggableContainerRef.current) {
            draggable = new Draggable(draggableContainerRef.current, {
                itemSelector: '.fc-event-external', // Klassen på elementen som ska gå att dra
                eventData: function(eventEl) {
                    return {
                        title: eventEl.innerText,
                        id: eventEl.getAttribute('data-id'),
                        // Du kan lägga till färg eller annat här om du vill
                    };
                }
            });
        }

        // Cleanup när komponenten avmonteras
        return () => {
            if (draggable) draggable.destroy();
        }
    }, []); // Körs bara en gång vid mount

    return (
        <div className='demo-app-sidebar w-80 bg-slate-50 border-r border-gray-200 p-6 flex flex-col h-full overflow-y-auto'>

            <div className='demo-app-sidebar-section mb-8'>
                <button
                    onClick={openModal}
                    className="w-full bg-blue-600 text-white font-bold py-2 px-4 rounded shadow hover:bg-blue-700 transition"
                >
                    + Nytt oplanerat event
                </button>
            </div>

            {/* -- HÄR ÄR LISTAN MED OPLANERADE EVENTS -- */}
            <div className='mb-8'>
                <h2 className="text-lg font-bold mb-3 text-gray-700">Dra till kalendern</h2>

                {/* Ref kopplas till denna container */}
                <div id="external-events" ref={draggableContainerRef} className="space-y-2">
                    {externalEvents.length === 0 && <p className="text-sm text-gray-400 italic">Inga oplanerade events.</p>}

                    {externalEvents.map((event) => (
                        <div
                            key={event.id}
                            data-id={event.id}
                            className="fc-event-external bg-white p-3 rounded border border-gray-200 shadow-sm cursor-move hover:bg-blue-50 transition border-l-4 border-l-blue-500 text-sm font-medium text-gray-700"
                        >
                            {event.title}
                        </div>
                    ))}
                </div>
            </div>
            {/* ----------------------------------------- */}

            <div className='demo-app-sidebar-section mb-6 pt-6 border-t border-gray-200'>
                <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                        type='checkbox'
                        checked={weekendsVisible}
                        onChange={handleWeekendsToggle}
                        className="rounded text-blue-600 focus:ring-blue-500"
                    ></input>
                    <span className="text-gray-600">Visa helger</span>
                </label>
            </div>

            <div className='demo-app-sidebar-section'>
                <h2 className="text-lg font-bold mb-3 text-gray-700">Aktiva i kalendern ({currentEvents.length})</h2>
                <ul className="space-y-2">
                    {currentEvents.map((event) => (
                        <SidebarEvent key={event.id} event={event} />
                    ))}
                </ul>
            </div>
        </div>
    )
}

function SidebarEvent({ event }) {
    return (
        <li className="text-xs text-gray-600 bg-gray-100 p-2 rounded">
            <b>{formatDate(event.start, {year: 'numeric', month: 'short', day: 'numeric'})}</b>
            <span className="block italic">{event.title}</span>
        </li>
    )
}