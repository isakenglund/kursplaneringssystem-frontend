import React, { useState, useRef } from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import svLocale from "@fullcalendar/core/locales/sv"
import interactionPlugin from '@fullcalendar/interaction'
import { INITIAL_EVENTS} from '../../event-utils.js'
import Sidebar from "../components/Sidebar.jsx";
import useGetCourses, { useGetHolidays } from '../hooks.js'

export default function DemoApp() {
    const [weekendsVisible, setWeekendsVisible] = useState(true)
    const [currentEvents, setCurrentEvents] = useState([])
    const calendarRef = useRef(null)

    const { data: listOfCourses, loading: loadingCourses} = useGetCourses();
    const { data: holidays = [] } = useGetHolidays();

    function handleWeekendsToggle() {
        setWeekendsVisible(!weekendsVisible)
    }

    function handleRemoveEventFromSidebar(eventId) {

    }

    function validateEventDrop(info) {
        const movedEventId = parseInt(info.event.id, 10);
        const courseId = parseInt(info.event.extendedProps.courseId, 10);
        const course = listOfCourses.find(c => c.id === courseId);

        if(!course || !course.event) return true;

        const courseEvents = course.event;
        const index = courseEvents.findIndex(e => e.id === movedEventId);

        if(index === -1) return true;

        const calendar = info.view.calendar;
        const movedEventStart = info.event.start;
        const movedEventEnd = info.event.end || new Date(movedEventStart.getTime() + 60 * 60 * 1000);


        if (index > 0) {
            const prevEventData = courseEvents[index - 1];
            const prevEventOnCalendar = calendar.getEventById(String(prevEventData.id));

            if (prevEventOnCalendar) {
                const prevEventEndTime = prevEventOnCalendar.end || prevEventOnCalendar.start;
                if (movedEventStart < prevEventEndTime) {
                    alert(`Ogiltig placering! Måste ligga EFTER ${prevEventData.name}.`);
                    info.revert();
                    return false;
                }
            }
        }
        if (index < courseEvents.length - 1) {
            const nextEventData = courseEvents[index + 1];
            const nextEventOnCalendar = calendar.getEventById(String(nextEventData.id));

            if (nextEventOnCalendar) {
                const nextEventStartTime = nextEventOnCalendar.start;
                if (movedEventEnd > nextEventStartTime) {
                    alert(`Ogiltig placering! Måste ligga FÖRE ${nextEventData.name}.`);
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

