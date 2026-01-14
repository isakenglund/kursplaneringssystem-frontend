import React, { useState, useRef, useMemo } from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import multiMonthPlugin from '@fullcalendar/multimonth'
import svLocale from "@fullcalendar/core/locales/sv"
import interactionPlugin from '@fullcalendar/interaction'
import LeftSidebar from "../components/LeftSidebar.jsx";
import useGetCourses, {
    useGetAllCategories,
    useGetHolidays,
    useGetVacation,
    useDeleteVacation,
    useUpdateCourseEventTime,
    useUpdateCourseEventEndTime,
    useGetMiscs,
    useUpdateMiscEventTime,
    useUpdateMiscEventEndTime,
    useGetTeachers
} from '../hooks.js'
import '../Calendar.css'
import RightSideBar from "../components/RightSideBar.jsx";
import { confirmCustom, alertCustom } from '../functions/alertFunctions.jsx'
import HoverModal from '../components/HoverModal.jsx'

/**
 * Main application page (orchestrator).
 * Owns the high-level UI state and composes the calendar view, sidebars, and modals.
 * Responsible for fetching data via hooks, transforming it into calendar events,
 * and wiring up FullCalendar interactions (click, drag/drop, resize, hover).
 */
export default function DemoApp() {
    const [weekendsVisible, setWeekendsVisible] = useState(true)
    const [currentEvents, setCurrentEvents] = useState([])
    const [selectedCategories, setSelectedCategories] = useState([]);
    const { data: allCategories } = useGetAllCategories();


    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    const todayDate = `${yyyy}-${mm}-${dd}`;
    const [visibleYears, setVisibleYears] = useState([new Date().getFullYear(), new Date().getFullYear() + 1]);
    const { remove: deleteVacation } = useDeleteVacation();

    const { data: listOfCourses, loading: loadingCourses, setData: setCourses, refetch: refetchCourses } = useGetCourses();
    const { data: listOfMiscs, loading: loadingMiscs, setData: setMiscs, refetch: refetchMiscs } = useGetMiscs();
    const { teachers, loading, err, refetch: refetchTeachers } = useGetTeachers();
    const { data: vacations = [], refetch: refetchVacation } = useGetVacation();
    const { data: holidays = [] } = useGetHolidays();
    const [dateRange, setDateRange] = useState({
        start: todayDate,
        end: todayDate,
    })
    const [showDateInputs, setShowDateInputs] = useState(false);
    const [vacationDate, setVacationDate] = useState(todayDate);
    const { update: updateCourseEventTime } = useUpdateCourseEventTime();
    const { update: updateCourseEventEndTime } = useUpdateCourseEventEndTime();
    const { update: updateMiscEventTime } = useUpdateMiscEventTime();
    const { update: updateMiscEventEndTime } = useUpdateMiscEventEndTime();

    const [showLeftSidebar, setShowLeftSidebar] = useState(true);
    const [showRightSidebar, setShowRightSidebar] = useState(true);

    const [hoverData, setHoverData] = useState(null);
    const sleep = (ms) => new Promise((r) => setTimeout(r, ms));


    const { holidayEvents, holidaySet } = useMemo(() => {
        if (!holidays || visibleYears.length === 0) return { holidayEvents: [], holidaySet: new Set() };

        const events = [];
        const set = new Set();
        const seenDates = new Set();

        visibleYears.forEach(year => {
            holidays.forEach(h => {
                const start = new Date(year, h.month - 1, h.day);
                const dateKey = start.toISOString().split('T')[0];

                if (seenDates.has(dateKey)) return; // skip duplicates
                seenDates.add(dateKey);

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

    const { vacationEvents, vacationSet } = useMemo(() => {
        if (!vacations || vacations.length === 0)
            return { vacationEvents: [], vacationSet: new Set() };
        const events = [];
        const set = new Set();

        vacations.forEach(v => {
            const start = new Date(v.date);
            events.push({
                id: `vacation-${v.id}`,
                title: "Semester",
                start,
                end: new Date(start.getFullYear(), start.getMonth(), start.getDate() + 1),
                allDay: true,
                selectable: false,
                extendedProps: { wrapText: true, type: "vacation" },
                color: "#6df18aff"
            });

            const month = start.getMonth() + 1;
            const day = start.getDate();
            set.add(`${month}-${day}`); // for CSS highlighting
        });

        return { vacationEvents: events, vacationSet: set };
    }, [vacations]);

    const listOfPersistantEvents = useMemo(() => {
        // Flatten course events
        const courseEvents = listOfCourses.flatMap(course =>
            course.event
                .filter(event => event.startTime)
                .map(event => ({
                    id: event.id,
                    title: event.name,
                    start: event.startTime,
                    end: event.endTime || undefined,
                    color: course.colorHex || '#3788d8',
                    extendedProps: {
                        courseId: course.id,
                        description: event.description || '',
                        teachers: event.teachers,
                        forceColor: course.colorHex || '#ff83ae',
                    },
                }))
        );

        // Flatten misc events
        const miscEvents = listOfMiscs.flatMap(misc =>
            misc.event
                .filter(event => event.startTime)
                .map(event => ({
                    id: event.id,
                    title: event.name || misc.name,
                    start: event.startTime,
                    end: event.endTime || undefined,
                    color: misc.colorHex || '#3788d8',
                    extendedProps: {
                        miscId: misc.id,
                        description: event.description || '',
                        forceColor: misc.colorHex || '#ff83ae',
                    },
                }))
        );

        // Combine both
        return [...courseEvents, ...miscEvents];
    }, [listOfCourses, listOfMiscs]);

    const filteredPersistantEvents = useMemo(() => {
        if (!selectedCategories || selectedCategories.length === 0) return listOfPersistantEvents;

        const selectedIds = new Set(selectedCategories.map(c => c.value));
        return listOfPersistantEvents.filter(e => {
            const courseId = e.extendedProps?.courseId;
            const miscId = e.extendedProps?.miscId;
            return selectedIds.has(courseId) || selectedIds.has(miscId);
        });
    }, [listOfPersistantEvents, selectedCategories]);

    const calendarRef = useRef(null)

    const eventsForCalendar = useMemo(() => {
        return [
            ...filteredPersistantEvents,
            ...vacationEvents,
            ...holidayEvents,
        ];
    }, [filteredPersistantEvents, vacationEvents, holidayEvents]);

    const handleDatesSet = (dateInfo) => {
        const startYear = dateInfo.start.getFullYear();
        const endYear = dateInfo.end.getFullYear();

        setVisibleYears((prevYears) => {
            // Om gamla statet redan innehåller samma år, gör ingenting
            if (prevYears[0] === startYear && prevYears[1] === endYear) {
                return prevYears;
            }
            return [startYear, endYear];
        });

        if (dateInfo.view.type === 'customInterval') {
            setShowDateInputs(true)
        } else {
            setShowDateInputs(false)
        }
    }

    const handleCategoryUpdate = (updatedCategory) => {
        const type = (updatedCategory.type || "").toUpperCase();

        if (type === "COURSE") {
            setCourses(prev => prev.map(c =>
                c.id === updatedCategory.id ? { ...c, ...updatedCategory } : c
            ));
        } else {
            setMiscs(prev => prev.map(m =>
                m.id === updatedCategory.id ? { ...m, ...updatedCategory } : m
            ));
        }
    };

    const handleCleanupEvents = (deletedId, type) => {
        if (type === "COURSE") {
            setCourses(prev => prev.filter(c => c.id !== deletedId));
        } else {
            setMiscs(prev => prev.filter(m => m.id !== deletedId));
        }
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
        } else {
            calendarApi[direction]();
        }

    }

    const updateDateRange = (e) => {
        setDateRange({ ...dateRange, [e.target.name]: e.target.value });
    }

    function handleWeekendsToggle() {
        setWeekendsVisible(!weekendsVisible)
    }

    async function validateEventDrop(info) {
        if (!info.event.extendedProps) return true;


        const movedEventId = parseInt(info.event.id, 10);
        const isCourseEvent = !!info.event.extendedProps.courseId;
        const isMiscEvent = !!info.event.extendedProps.miscId;


        let eventList, currentIndex;

        const calendar = info.view.calendar;
        const movedEventStart = info.event.start;
        const movedEventEnd = info.event.end || new Date(movedEventStart.getTime() + (info.event.allDay ? 24 : 1) * 60 * 60 * 1000);
        if (!info.event.end) {
            info.event.setEnd(movedEventEnd);
        }


        if (isCourseEvent) {
            const courseId = parseInt(info.event.extendedProps.courseId, 10);
            const course = listOfCourses.find(c => c.id === courseId);

            if (!course) return true;

            if (new Date(movedEventStart) < new Date(course.startDate)) {
                alertCustom("Eventet kan inte starta före kursens startdatum.");
                info.revert();
                return false;
            }
            if (new Date(movedEventEnd) > new Date(course.endDate)) {
                alertCustom("Eventet kan inte sluta efter kursens startdatum.");
                info.revert();
                return false;
            }

            eventList = course.event;
            currentIndex = eventList.findIndex(e => e.id === movedEventId);
            if (currentIndex === -1) return true;

        } else if (isMiscEvent) {
            const miscId = parseInt(info.event.extendedProps.miscId, 10);
            const misc = listOfMiscs.find(m => m.id === miscId);
            if (!misc) return true;

            eventList = misc.event;
            currentIndex = eventList.findIndex(e => e.id === movedEventId);
            if (currentIndex === -1) return true;

        } else {
            return true;
        }



        for (let i = 0; i < currentIndex; i++) {
            const earlierEventData = eventList[i];
            const earlierEventOnCalendar = calendar.getEventById(String(earlierEventData.id));
            if (earlierEventOnCalendar) {
                const earlierEventEnd = earlierEventOnCalendar.end || earlierEventOnCalendar.start;
                if (movedEventStart < earlierEventEnd) {
                    const message = `Ogiltig ordning. Vill du ändå lägga eventet här?`;

                    const override = await confirmCustom(message);

                    if (!override) {
                        info.revert();
                        return false;
                    }
                }

            }
        }
        for (let i = currentIndex + 1; i < eventList.length; i++) {
            const laterEventData = eventList[i];
            const laterEventOnCalendar = calendar.getEventById(String(laterEventData.id));
            if (laterEventOnCalendar) {
                const laterEventStart = laterEventOnCalendar.start;
                if (movedEventEnd > laterEventStart) {
                    const message = `Ogiltig ordning. Vill du ändå lägga eventet här?`;

                    const override = await confirmCustom(message);

                    if (!override) {
                        info.revert();
                        return false;
                    }
                }
            }
        }
        const currentTeachers = info.event.extendedProps.teachers || [];

        if (currentTeachers.length > 0) {
            const allEvents = calendar.getEvents();

            let crashedTeacherNames = [];

            const hasTeacherConflict = allEvents.some(otherEvent => {
                if (parseInt(otherEvent.id, 10) === movedEventId) return false;

                const otherStart = otherEvent.start;
                const otherEnd = otherEvent.end || new Date(otherStart.getTime() + (otherEvent.allDay ? 24 : 1) * 60 * 60 * 1000);

                const isTimeOverlapping = (movedEventStart < otherEnd && movedEventEnd > otherStart);
                if (!isTimeOverlapping) return false;

                const otherTeachers = otherEvent.extendedProps.teachers || [];

                const conflictsInThisEvent = currentTeachers.filter(current =>
                    otherTeachers.some(other => String(other.id) === String(current.id))
                );

                if (conflictsInThisEvent.length > 0) {
                    conflictsInThisEvent.forEach(t => crashedTeacherNames.push(t.firstName + " " + t.lastName));
                    return true;
                }
                return false;
            });

            if (hasTeacherConflict) {
                const uniqueNames = [...new Set(crashedTeacherNames)];
                const namesString = uniqueNames.join(", ");

                const message = `${namesString} är redan bokade under denna tid. Vill du ändå lägga eventet här?`;

                const override = await confirmCustom(message);

                if (!override) {
                    info.revert();
                    return false;
                }
            }
        }
        if (checkForHoliday(info)) return true;
        const dayOfWeek = movedEventStart.getDay();
        if (dayOfWeek === 0 || dayOfWeek === 6) {
            const override = await confirmCustom("Du håller på att sätta detta event på en helg, vill du fortsätta?");
            if (!override) {
                info.revert();
                return false;
            }
        }
        const month = movedEventStart.getMonth() + 1;
        const day = movedEventStart.getDate();
        if (vacationSet.has(`${month}-${day}`)) {
            const override = await confirmCustom("Du håller på att sätta detta event på en semesterdag, vill du fortsätta?");
            if (!override) {
                info.revert();
                return false;
            }
        }


        if (isCourseEvent) {
            await updateCourseEventTime(movedEventId, movedEventStart, movedEventEnd);

            // Give backend time to commit/propagate before reloading
            await sleep(250);
            console.log("validateEventDrop -> refetchCourses");
            refetchCourses();
        } else if (isMiscEvent) {
            await updateMiscEventTime(movedEventId, movedEventStart, movedEventEnd);

            await sleep(250);
            console.log("validateEventDrop -> refetchMiscs");
            refetchMiscs();
        } else {
            await alertCustom("Något blev fel");
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
            alertCustom(`Du kan inte lägga event på högtiden: ${holidayName}`);
            info.revert();
            return true;
        }

        return false;
    }

    async function handleEventReceive(info) {
        const ok = await validateEventDrop(info);
        if (!ok) return;
    }

    async function handleEventDrop(info) {
        const ok = await validateEventDrop(info);
        if (!ok) return;
    }

    async function handleEventResize(info) {
        const ok = await validateEventDrop(info);
        if (!ok) return;

        const event = info.event;
        const isCourseEvent = !!info.event.extendedProps.courseId;
        const isMiscEvent = !!info.event.extendedProps.miscId;

        if (isCourseEvent) {
            await updateCourseEventEndTime(event.id, event.end);

            await sleep(250);
            console.log("handleEventResize -> refetchCourses");
            refetchCourses();
        } else if (isMiscEvent) {
            await updateMiscEventEndTime(event.id, event.end);

            await sleep(250);
            console.log("handleEventResize -> refetchMiscs");
            refetchMiscs();
        } else {
            await alertCustom("Något blev fel");
        }
    }

    async function handleEventClick(clickInfo) {
        const { event } = clickInfo;

        const isHoliday =
            event.extendedProps?.wrapText &&
            event.id?.startsWith("holiday-");
        if (isHoliday) return;

        const isVacation =
            event.extendedProps?.wrapText &&
            event.id?.startsWith("vacation-");

        const confirmed = await confirmCustom(
            `Är du säker på att du vill ta bort händelsen '${event.title}'?`
        );
        if (!confirmed) return;

        try {
            if (isVacation) {
                const vacationId = event.id.replace("vacation-", "");
                await deleteVacation(vacationId);
                console.log("handleEventClick -> refetchVacation");
                await refetchVacation();
            } else {
                const eventId = parseInt(event.id, 10);

                const parent = [...listOfCourses, ...listOfMiscs].find(
                    p => p.event.some(e => e.id === eventId)
                );

                if (!parent) {
                    await alertCustom("Kunde inte ta bort händelsen förälder saknas");
                    return;
                }
                if (parent.type === "COURSE") {
                    await updateCourseEventTime(eventId, null, null);

                    await sleep(250);
                    console.log("handleEventClick -> refetchCourses");
                    refetchCourses();
                } else if (parent.type === "MISC" || parent.type === "MEETING") {
                    await updateMiscEventTime(eventId, null, null);

                    await sleep(250);
                    console.log("handleEventClick -> refetchMiscs");
                    refetchMiscs();
                } else {
                    await alertCustom("Kunde inte ta bort händelsen okänd typ");
                    return;
                }
            }

            event.remove();

        } catch (err) {
            console.error("Could not remove event:", err);
            alertCustom("Kunde inte ta bort händelsen");
        }
    }

    function handleEvents(events) {
        setCurrentEvents(events)
    }

    const handleEventMouseEnter = (info) => {
        const MODAL_WIDTH = 320;   // w-80
        const MODAL_HEIGHT = 180;  // adjust if your modal height differs
        const {innerWidth, innerHeight} = window;
        const {clientX, clientY} = info.jsEvent;
        let {xOffset, yOffset} = 0;

        const centerX = innerWidth / 2;
        const centerY = innerHeight / 2;

        if (clientX < centerX) {
            xOffset = MODAL_HEIGHT / 2
        } else {
            xOffset = -MODAL_HEIGHT / 2
        }

        if (clientY < centerY) {
            yOffset = MODAL_HEIGHT / 2
        } else {
            yOffset = -MODAL_HEIGHT / 2
        }


        setHoverData({
            event: info.event,
            x: clientX - MODAL_WIDTH / 2 + xOffset,
            y: clientY - MODAL_HEIGHT / 2 + yOffset,
        });
    };

    const handleEventMouseLeave = () => {
        setHoverData(null);
    };

    return (
        <div className='demo-app relative h-screen flex'>

            <LeftSidebar
                currentEvents={currentEvents}
                listOfCourses={listOfCourses || []}
                loadingCourses={loadingCourses}
                setVacationDate={setVacationDate}
                vacationDate={vacationDate}
                showLeftSidebar={showLeftSidebar}
                selectedCategories={selectedCategories}
                onCategoryUpdate={handleCategoryUpdate}
                onCategoryDelete={handleCleanupEvents}
                teachers={teachers}
                loading={loading}
                err={err}
                coursesData={listOfCourses}
                miscsData={listOfMiscs}
                refetchCourses={refetchCourses}
                refetchMiscs={refetchMiscs}
                refetchTeachers={refetchTeachers}
                refetchVacation={refetchVacation}
            />

            <div className='demo-app-main flex-1 min-w-0 min-h-0 p-4 flex flex-col'>

                <div className="flex justify-between mb-2 w-full">
                    <button
                        onClick={() => setShowLeftSidebar(prev => !prev)}
                        className="p-2 rounded-full border border-gray-300 hover:bg-gray-100 flex gap-4"
                    >

                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                            className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${showLeftSidebar ? "rotate-180" : ""
                                }`}
                        >
                            <path
                                fillRule="evenodd"
                                d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
                                clipRule="evenodd"
                            />
                        </svg>
                    </button>


                    <button
                        onClick={() => {
                            setShowRightSidebar(prev => !prev)
                        }}
                        className="p-2 rounded-full border border-gray-300 hover:bg-gray-100 flex gap-4"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                            className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${!showRightSidebar ? "rotate-180" : ""
                                }`}
                        >
                            <path
                                fillRule="evenodd"
                                d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
                                clipRule="evenodd"
                            />
                        </svg>
                    </button>
                </div>


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
                    defaultTimedEventDuration="01:00:00"
                    defaultAllDayEventDuration={{ days: 1 }}
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
                            buttonText: 'Månader',
                            eventDisplay: 'block'
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
                        },
                        smartWeekendsToggle: {
                            text: weekendsVisible ? 'Dölj helg' : 'Visa helg',
                            click: () => handleWeekendsToggle()
                        },

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
                        right: 'customInterval,customMultiMonth,customTwoWeeks,timeGridWeek,timeGridDay smartWeekendsToggle'
                    }}
                    height="100%"
                    expandRows={true}
                    datesSet={handleDatesSet}
                    initialView='timeGridWeek'
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
                    events={eventsForCalendar}
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
                        if (vacationSet.has(`${month}-${day}`)) {
                            classes.push('bg-[#a8ffbbff]');
                        }
                        return classes;
                    }}
                    locale={svLocale}
                    droppable={true}
                    eventReceive={handleEventReceive}
                    eventDrop={handleEventDrop}
                    eventContent={renderEventContent}
                    eventClick={handleEventClick}
                    eventsSet={handleEvents}
                    eventResize={handleEventResize}
                    eventColor={function (info) {
                        return info.event.extendedProps.color; // use the color you passed
                    }}
                    eventMouseEnter={handleEventMouseEnter}
                    eventMouseLeave={handleEventMouseLeave}
                />
                <HoverModal
                    hoverData={hoverData}
                    listOfCourses={listOfCourses}
                    listOfMiscs={listOfMiscs}
                />
            </div>

            <RightSideBar
                currentEvents={currentEvents}
                weekendsVisible={weekendsVisible}
                handleWeekendsToggle={handleWeekendsToggle}
                selectedCategories={selectedCategories}
                setSelectedCategories={setSelectedCategories}
                listOfCategories={allCategories}
                loadingCourses={loadingCourses}
                holidayEvents={holidayEvents}
                showRightSidebar={showRightSidebar}
                vacation={vacations}
            />
        </div>
    )
}

function renderEventContent(eventInfo) {
    const isHoliday = eventInfo.event.extendedProps.wrapText;

    const color = eventInfo.event.extendedProps.forceColor || eventInfo.event.backgroundColor;

    const isMonthView = eventInfo.view.type === 'customMultiMonth' || eventInfo.view.type === 'multiMonthYear' || eventInfo.view.type === 'dayGridMonth';

    const titleClass = isHoliday
        ? 'ml-1 whitespace-normal break-words text-sm'
        : 'ml-1';

    if (isMonthView) {
        return (
            <div
                className="overflow-hidden whitespace-nowrap text-ellipsis rounded px-1"
                style={{
                    backgroundColor: color,
                    color: '#fff'
                }}
            >
                {!eventInfo.event.allDay && (
                    <b className="mr-1 text-xs">{eventInfo.timeText}</b>
                )}
                <span className={titleClass}>{eventInfo.event.title}</span>
            </div>
        )
    }

    return (
        <>
            <b>{eventInfo.timeText}</b>
            <i className={titleClass}>{eventInfo.event.title}</i>
        </>
    );
}