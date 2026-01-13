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

    deleteCourse: (courseId) => api(`/courses/${courseId}`, {
        method: "DELETE"
    }),

    deleteMisc: (miscId) => api(`/miscs/${miscId}`, {
        method: "DELETE"
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

    updateCourse: (course) => api(`/courses/${course.id}`, {
        method: "PUT",
        body: JSON.stringify({
            id: course.id,
            name: course.name,
            colorHex: course.colorHex,
            numOfStudents: course.numOfStudents,
            startDate: course.startDate,
            endDate: course.endDate
        })
    }),

    updateMisc: (misc) => api(`/miscs/${misc.id}`, {
        method: "PUT",
        body: JSON.stringify({
            id: misc.id,
            name: misc.name,
            colorHex: misc.colorHex,
        })
    }),


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
            name: miscEvent.name,
            startTime: miscEvent.startTime ?? miscEvent.startDate ?? null,
            endTime: miscEvent.endTime ?? miscEvent.endDate ?? null,
            miscId: miscEvent.miscId ?? miscEvent.categoryId?.id ?? null,
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
        method: "PUT",
        body: JSON.stringify({
            id: miscEvent.id,
            name: miscEvent.name,
            description: miscEvent.description,
            startTime: miscEvent.startTime ?? miscEvent.startDate ?? null,
            endTime: miscEvent.endTime ?? miscEvent.endDate ?? null,
            miscId: miscEvent.miscId ?? miscEvent.categoryId?.id ?? null,
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

    updateCourseEventTime: (eventId, startTime, endTime) => {

        api(`/course-events/${eventId}/course-update-time`, {
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


    updateCourseEventEndTime: (eventId, endTime) => {
        api(`/course-events/${eventId}/course-end-time`, {
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

    updateMiscEventTime: (eventId, startTime, endTime) => {

        api(`/misc-events/${eventId}/misc-update-time`, {
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


    updateMiscEventEndTime: (eventId, endTime) => {
        api(`/misc-events/${eventId}/misc-end-time`, {
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

    savePerson: (person) => api('/persons', {
        method: "POST",
        body: JSON.stringify({
            firstName: person.firstName,
            lastName: person.lastName,
            email: person.email,
        })
    },),

    deletePerson: (personId) => api(`/persons/${personId}`, {
        method: "DELETE"
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

}