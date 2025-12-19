import { api } from "../lib/fetcher.jsx";

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

    updateEventTime: (eventId, startTime, endTime) => {

        api(`/course-events/${eventId}/updateTime`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                startTime: startTime instanceof Date
                    ? formatToISO(startTime)
                    : startTime,
                endTime: endTime instanceof Date
                    ? formatToISO(endTime)
                    : endTime,
            }),
        });
    },


    updateEventEndTime: (eventId, endTime) => {
        api(`/course-events/${eventId}/end-time`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                endTime: endTime instanceof Date
                    ? formatToISO(endTime)
                    : endTime,
            }),
        });
    },

};

function formatToISO(date) {
    const pad = (num) => String(num).padStart(2, '0');
    const year = date.getFullYear();
    const month = pad(date.getMonth() + 1);
    const day = pad(date.getDate());
    const hours = pad(date.getHours());
    const minutes = pad(date.getMinutes());
    const seconds = pad(date.getSeconds());
    const milliseconds = String(date.getMilliseconds()).padStart(3, '0');

    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}.${milliseconds}`;
};