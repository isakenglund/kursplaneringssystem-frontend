import {api} from "../lib/fetcher.jsx";

export const API = {

    courses: () => api('/courses', {
        method: "GET",
    }),

    miscs: () => api('/miscs', {
        method: "GET",
    }),

    courseEvents: () => api('/course-events', {
        method: "GET",
    }),

    miscEvents: () => api('/misc-events', {
        method: "GET",
    }),

    saveCourse: (course) => api('/courses', {
        method: "POST",
        body: JSON.stringify({
            type: course.type,
            name: course.name,
            colorHex: course.colorHex,
            numOfStudents: course.numOfStudents,
            startDate: course.startDate,
            endDate: course.endDate,
        })
    },),

    saveMisc: (misc) => api('/miscs', {
        method: "POST",
        body: JSON.stringify({
            type: misc.type,
            name: misc.name,
            colorHex: misc.colorHex,
            startDate: misc.startDate,
            endDate: misc.endDate,
        })
    },),

    saveCourseEvent: (courseEvent) => api('/course-events', {
        method: "POST",
        body: JSON.stringify({
            description: courseEvent.description,
            endDate: courseEvent.endDate,
            name: courseEvent.name,
            startDate: courseEvent.startDate,
            courseId: courseEvent.courseId,
            teachers: courseEvent.teachers,
            displayIndex: courseEvent.displayIndex
        })
    }),

    saveMiscEvent: (miscEvent) => api('/misc-events', {
        method: "POST",
        body: JSON.stringify({
            description: miscEvent.description,
            endDate: miscEvent.endDate,
            name: miscEvent.name,
            startDate: miscEvent.startDate,
            miscId: miscEvent.miscId,
            displayIndex: miscEvent.displayIndex
        })
    }),

    teachers: () => api('/persons'),

    addTeacherToEvent: (eventId, personId) => api(`/course-events/${eventId}/teachers/${personId}`, {
        method: "PUT",
    }),

    removeTeacherFromEvent: (eventId, personId) => api(`/course-events/${eventId}/teachers/${personId}`, {
        method: "DELETE",
    }),

    updateCourseEvent: (courseEvent) => api('/course-events', {
        method: "PUT",
        body: JSON.stringify({
            id: courseEvent.id,
            description: courseEvent.description,
            endDate: courseEvent.endDate,
            name: courseEvent.name,
            startDate: courseEvent.startDate,
            courseId: courseEvent.courseId,
            teachers: courseEvent.teachers,
            displayIndex: courseEvent.displayIndex
        })
    }),

    updateMiscEvent: (miscEvent) => api('/misc-events', {
        method: "POST",
        body: JSON.stringify({
            description: miscEvent.description,
            endDate: miscEvent.endDate,
            name: miscEvent.name,
            startDate: miscEvent.startDate,
            miscId: miscEvent.courseId,
            displayIndex: miscEvent.displayIndex
        })
    }),


    holidays: () => api('/holidays'),


    deleteCourseEvent: (eventId) => api(`/course-events/${eventId}`, {
        method: "DELETE"
    }),

    deleteMiscEvent: (eventId) =>
        api(`/misc-events/${eventId}`, {
            method: "DELETE"
        }),

    saveVacation: (vacation) =>
        api('/vacation', {
            method: "POST",
            body: JSON.stringify({
                date: vacation.date
            })
        }),

    deleteVacation: (vacationId) =>
        api(`/vacation/${vacationId}`, {
            method: "DELETE"
        }),

    getVacation: () => api('/vacation', {
        method: "GET",
    }),

    updateEventStartTime: (eventId, startTime) =>
        api(`/course-events/${eventId}/start-time`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                startTime: startTime instanceof Date
                    ? startTime.toISOString()
                    : startTime,
            }),
        }),

    reorderCourseEvents: (courseId, orderedIds) =>
        api(`/course-events/${courseId}/reorder`, { // OBS: course-events, inte courses
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(orderedIds),
        }),
};