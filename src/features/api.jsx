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

    saveCourseEvent: (courseEvent) => api ('/course-events', {
        method: "POST",
        body: JSON.stringify({
            id: courseEvent.id,
            description: courseEvent.description,
            endDate: courseEvent.endDate,
            name: courseEvent.name,
            startDate: courseEvent.startDate,
            courseId: courseEvent.courseId,
            teachers: courseEvent.teachers,
        })
    }),

    saveMiscEvent: (miscEvent) => api ('/misc-events', {
        method: "POST",
        body: JSON.stringify({
            description: miscEvent.description,
            endDate: miscEvent.endDate,
            name: miscEvent.name,
            startDate: miscEvent.startDate,
            miscId: miscEvent.miscId,
        })
    }),

    teachers: () => api('/persons'),

    addTeacherToEvent: (eventId, personId) => api(`/course-events/${eventId}/teachers/${personId}`, {
        method: "PUT",
    }),

    removeTeacherFromEvent: (eventId, personId) => api(`/course-events/${eventId}/teachers/${personId}`, {
        method: "DELETE",
    }),

    updateCourseEvent: (courseEvent) => api ('/course-events', {
        method: "PUT",
        body: JSON.stringify({
            id: courseEvent.id,
            description: courseEvent.description,
            endDate: courseEvent.endDate,
            name: courseEvent.name,
            startDate: courseEvent.startDate,
            courseId: courseEvent.courseId,
            teachers: courseEvent.teachers,
        })
    }),

    updateMiscEvent: (miscEvent) => api ('/misc-events', {
        method: "POST",
        body: JSON.stringify({
            description: miscEvent.description,
            endDate: miscEvent.endDate,
            name: miscEvent.name,
            startDate: miscEvent.startDate,
            miscId: miscEvent.courseId,
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
};