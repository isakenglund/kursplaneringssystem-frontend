import React, {useState, useRef, useMemo} from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import multiMonthPlugin from '@fullcalendar/multimonth'
import svLocale from "@fullcalendar/core/locales/sv"
import interactionPlugin from '@fullcalendar/interaction'
import LeftSidebar from "../components/LeftSidebar.jsx";
import { INITIAL_EVENTS } from '../../event-utils.js'
import useGetCourses, {useGetAllEvents, useGetHolidays} from '../hooks.js'
import '../Calendar.css'
import RightSideBar from "../components/RightSideBar.jsx";
import {Snowfall} from "react-snowfall";

export default function DemoApp() {
    const [weekendsVisible, setWeekendsVisible] = useState(true)

    const [currentEvents, setCurrentEvents] = useState([])
    const [selectedCourses, setSelectedCourses] = useState([]);
    const {data: allEvents} = useGetAllEvents();

    const filteredCalendarEvents = useMemo(() => {
        if (selectedCourses.length === 0) return allEvents;

        return allEvents.filter(event => {
            const props = event.extendedProps || event;
            const courseId = props.courseId;
            return selectedCourses.some(choice => choice.value === courseId);
        });
    }, [allEvents, selectedCourses]);

    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    const todayDate = `${yyyy}-${mm}-${dd}`;
    const [visibleYears, setVisibleYears] = useState([new Date().getFullYear(), new Date().getFullYear()+1]);

    const { data: listOfCourses, loading: loadingCourses } = useGetCourses();
    const { data: holidays = [] } = useGetHolidays();
    const [dateRange, setDateRange] = useState({
        start: todayDate,
        end: todayDate,
    })
    const [showDateInputs, setShowDateInputs] = useState(false);


   const { holidayEvents, holidaySet } = useMemo(() => {
  if (!holidays || visibleYears.length === 0) return { holidayEvents: [], holidaySet: new Set() };

  const events = [];
  const set = new Set();

  visibleYears.forEach(year => {
    holidays.forEach(h => {
      const start = new Date(year, h.month - 1, h.day);

      events.push({
        id: `holiday-${h.id}-${year}`,
        title: h.name,
        start,
        end: new Date(start.getFullYear(), start.getMonth(), start.getDate() + 1),
        allDay: true,
        editable: false,
        selectable: false,
        extendedProps: { wrapText: true },
        color: "#ff83ae"
      });

      set.add(`${h.month}-${h.day}`);
    });
  });

  return { holidayEvents: events, holidaySet: set };
}, [holidays, visibleYears]);

    const handleDatesSet = (dateInfo) => {
        const startYear = dateInfo.start.getFullYear();
        const endYear = dateInfo.end.getFullYear();

        setVisibleYears([startYear, endYear]); // e.g., [2025, 2026]

        if (dateInfo.view.type === 'customInterval') {
            setShowDateInputs(true)
        } else {
            setShowDateInputs(false)
        }
        const year = dateInfo.start.getFullYear()
    }


    const handleCustomDateChange = (direction) => {

        const calendarApi = calendarRef.current.getApi();

        if (calendarApi.view.type === 'customInterval') {
            const newStart = new Date(dateRange.start)
            const newEnd = new Date(dateRange.end)

            const diffTime = Math.abs(newEnd.getTime() - newStart.getTime())
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24) + 1);

            const sign = direction === 'next' ? 1 : -1;

            newStart.setDate(newStart.getDate() + diffDays * sign);
            newEnd.setDate(newEnd.getDate() + diffDays * sign);

            setDateRange({ start: newStart.toISOString().split('T')[0], end: newEnd.toISOString().split('T')[0] });
        }
        else {
            calendarApi[direction]();
        }

    }

    const updateDateRange = (e) => {
        setDateRange({ ...dateRange, [e.target.name]: e.target.value });
    }

    const calendarRef = useRef(null)

    function handleWeekendsToggle() {
        setWeekendsVisible(!weekendsVisible)
    }

    function validateEventDrop(info) {
        if (!info.event.extendedProps || !info.event.extendedProps.courseId) {
            return true;
        }
        const movedEventId = parseInt(info.event.id, 10);
        const courseId = parseInt(info.event.extendedProps.courseId, 10);
        const course = listOfCourses.find(c => c.id === courseId);

        if (!course) { return true; }

        const courseEvents = course.event;
        const currentIndex = courseEvents.findIndex(e => e.id === movedEventId);
        if (currentIndex === -1) {
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
                    alert("ogiltig ordning")
                    console.log("Ogiltig ordning")
                    info.revert();
                    return false;
                }
            }
        }

        for (let i = currentIndex + 1; i < courseEvents.length; i++) {
            const laterEventData = courseEvents[i];
            const laterEventOnCalendar = calendar.getEventById(String(laterEventData.id));

            if (laterEventOnCalendar) {
                const laterEventStart = laterEventOnCalendar.start;

                if (movedEventEnd > laterEventStart) {
                    alert("ogiltig ordning")
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

        if (isHoliday) {
            return;
        }

        if (!isValidEventPlacement) {
            return;
        }
    }

    function handleEventDrop(info) {
        validateEventDrop(info);
        if (checkForHoliday(info)) return;
    }

    function handleEventClick(clickInfo) {
        if (!clickInfo.event.extendedProps?.wrapText) {if (confirm(`Är du säker på att du vill ta bort händelsen '${clickInfo.event.title}'?`)) {
            clickInfo.event.remove();
}
        }
    }

    function handleEvents(events) {
        setCurrentEvents(events)
    }

    return (
        <div className='demo-app relative h-screen flex'>
            <Snowfall snowflakeCount={400} radius={[0.5,4]}/>
            <LeftSidebar
                currentEvents={currentEvents}
                listOfCourses={listOfCourses || []}
                loadingCourses={loadingCourses}
            />

            <div className='demo-app-main flex-grow p-4'>
                <div className="fc">
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
                    //selectable={true}
                    selectMirror={true}
                    dayMaxEvents={true}
                    weekends={weekendsVisible}
                    //initialEvents={INITIAL_EVENTS}
                    events={[...INITIAL_EVENTS, ...holidayEvents]}
                    dayCellClassNames={(arg) => {
                        const day = arg.date.getDate();
                        const month = arg.date.getMonth() + 1;

                        const classes = [];
                        if (arg.date.getDay() === 0 || arg.date.getDay() === 6) {
                            classes.push('bg-[#EAF2FF]');
                        }
                        if (holidaySet.has(`${month}-${day}`)) {
                            classes.push('bg-[#FBE7EE]');
                        }
                        return classes;
                    }}
                    locale={svLocale}
                    droppable={true}
                    events={filteredCalendarEvents}
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

            <RightSideBar
                currentEvents={currentEvents}
                weekendsVisible={weekendsVisible}
            handleWeekendsToggle={handleWeekendsToggle}
            selectedCourses={selectedCourses}
            setSelectedCourses={setSelectedCourses}
            listOfCourses={listOfCourses}
            loadingCourses={loadingCourses}/>
        </div>
    )
}

function renderEventContent(eventInfo) {
    const isHoliday = eventInfo.event.extendedProps.wrapText;

    const titleClass = isHoliday
        ? 'ml-1 whitespace-normal break-words text-sm'
        : 'ml-1';

    return (
        <>
            <b>{eventInfo.timeText}</b>
            <i className={titleClass}>{eventInfo.event.title}</i>
        </>
    );
}


