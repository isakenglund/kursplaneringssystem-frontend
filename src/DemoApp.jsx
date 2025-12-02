import React, { useState, useRef, useEffect } from 'react'
import { formatDate } from '@fullcalendar/core'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import svLocale from "@fullcalendar/core/locales/sv"
import interactionPlugin, { Draggable } from '@fullcalendar/interaction'
import { INITIAL_EVENTS, createEventId } from './event-utils'
import ColorPicker from './colorPicker'

export default function DemoApp() {
    const [weekendsVisible, setWeekendsVisible] = useState(true)
    const [currentEvents, setCurrentEvents] = useState([])
    const counter = 0;

    const [externalEvents, setExternalEvents] = useState([
        { id: createEventId(), title: 'Oplanerat uppdrag 1' },
        { id: createEventId(), title: 'Oplanerat uppdrag 2' }
    ])
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [newEventTitle, setNewEventTitle] = useState('')

    const calendarRef = useRef(null)

    function removeExternalEvent(eventId) {
        if (confirm(`Are you sure you want to delete the event`)) {
        setExternalEvents(prev => prev.filter(e => e.id !== eventId));
        }
    }



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

        console.log("Släppt datum: " , info.event.start.toLocaleTimeString());

        //if(droppedEventId.)
        // Ta bort eventet från externalEvents-staten
        //setExternalEvents((prev) => prev.filter(e => e.id !== droppedEventId))

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
                    e.id === removedEventId ? { ...e, disabled: false } : e
                )
            );
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
                                    placeholder="T.ex. Föreläsning
                                   "
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
                externalEvents={externalEvents}
                openModal={() => setIsModalOpen(true)}
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

// -- UPPDATERAD SIDEBAR MED DRAGGABLE LOGIK --
function Sidebar({ weekendsVisible, handleWeekendsToggle, currentEvents, externalEvents, openModal, removeExternalEvent }) {
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

    const [showCreateCatagory, setShowCreateCatagory] = useState(false);

  return (
    <div className='demo-app-sidebarw-80 bg-slate-50 border-r border-gray-200 p-6 flex flex-col h-full overflow-y-auto'>

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
                            className={`fc-event-external p-3 rounded border shadow-sm text-sm font-medium transition flex justify-between items-center
        ${event.disabled
                                ? "bg-gray-200 text-gray-400 cursor-not-allowed pointer-events-none"
                                : "bg-white border-gray-200 hover:bg-blue-50 border-l-4 border-l-blue-500 text-gray-700 cursor-move"
                            }`}
                        >
                            {/* Text */}
                            <span className="text-sm">{externalEvents.indexOf(event)} {event.title}</span>

                            {/* SVG-knapp */}
                            {!event.disabled && (
                                <button
                                    style={{ cursor: "pointer" }}
                                    onClick={() => removeExternalEvent(event.id)} // <-- tar bort eventet
                                    className="flex items-center justify-center w-5 h-5 text-sm text-gray-700 hover:text-red-500"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-full h-full">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                                    </svg>
                                </button>
                            )}

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
      <button onClick={() => setShowCreateCatagory(!showCreateCatagory)}>Create category</button>
      {showCreateCatagory && <ShowCategoryInput setShowCreateCatagory={setShowCreateCatagory}/>}

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

function ShowCategoryInput({setShowCreateCatagory}) {

  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, "0"); // month is 0-indexed
  const dd = String(today.getDate()).padStart(2, "0");
  const todayDate = `${yyyy}-${mm}-${dd}`;


  const [categoryType, setCategoryType] = useState("course")
  const [hp, setHp] = useState(null);
  const [studentNum, setStudentNum] = useState(null);
  const [startDate, setStartDate] = useState(todayDate);
  const [endDate, setEndDate] = useState(todayDate);
  return (
    <div>
      <label style={{ fontWeight: 600 }}>Namn på kategorin</label>
      <br></br>
      <input
        type="text"
        placeholder="T.ex Datasystem, Matematik"
      />
      <br></br>
      <label>
        <input
          type='radio'
          name='categoryType'
          value='course'
          checked={categoryType === "course"}
          onChange={(e) => {
            setCategoryType(e.target.value);
            setStartDate(todayDate);
            setEndDate(todayDate);
          }}
        /> Kurs
      </label>
      <label>
        <input
          type='radio'
          name='categoryType'
          value='misc'
          checked={categoryType === "misc"}
          onChange={(e) => {
            setCategoryType(e.target.value);
            setStartDate(todayDate);
            setEndDate(todayDate)}}
        /> Övrigt
      </label>
      <br></br>
      <ColorPicker />
      {categoryType === "course" && (
        <div>
          <label>
            HP:
            <input
              type="number"
              value={hp}
              onChange={(e) => setHp(parseFloat(e.target.value))}
              min={0}    // min HP
              max={180}   // max HP
              step={0.5} // increment
            />
          </label>
          <br></br>
          <label>
            Antal studenter:
            <input
              type="number"
              value={studentNum}
              onChange={(e) => setStudentNum(parseFloat(e.target.value))}
              min={0}    // min HP
              max={1000}   // max HP
              step={1} // increment
            />
          </label>
          <br></br>
          <label>
            Start Datum:
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </label>
          <br></br>
          <label>
            Slut Datum:
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </label>
            {new Date(startDate) > new Date(endDate) && (
            <p style={{ color: "red", marginTop: "0.5rem" }}>
              ⚠️ Start datum är nu EFTER slut datum
            </p>
          )}
          {new Date(startDate) < new Date(todayDate) && (
            <p style={{ color: "red", marginTop: "0.5rem" }}>
              ⚠️ Start datum är nu FÖRE dagens datum
            </p>
          )}
        </div>
      )}
      <button style={{ color: "blue"}}>Skapa</button>
      <button onClick={() => setShowCreateCatagory(false)}>avbryt</button>
    </div>
  )
}

function SidebarEvent({ event }) {
    return (
        <li className="text-xs text-gray-600 bg-gray-100 p-2 rounded">
            <b>{formatDate(event.start, { year: 'numeric', month: 'short', day: 'numeric' })}</b>
            <span className="block italic">{event.title}</span>
        </li>
    )
}