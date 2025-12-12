import {api} from "../lib/fetcher.jsx";

export const API = {

    courses: () => api('/courses', {
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
            hp: course.hp,
            numOfStudents: course.numOfStudents,
            startDate: course.startDate,
            endDate: course.endDate,
        })
    },),

    saveCourseEvent: (courseEvent) => api ('/course-events', {
        method: "POST",
        body: JSON.stringify({
            description: courseEvent.description,
            endDate: courseEvent.endDate,
            name: courseEvent.name,
            startDate: courseEvent.startDate,
            courseId: courseEvent.courseId,
            teachers: courseEvent.teachers.map(t => t.id),
        })
    }),

    teachers: () => api('/persons'),

    addTeacherToEvent: (eventId, personId) => api(`/course-events/${eventId}/teachers/${personId}`, {
        method: "PUT",
    }),

    removeTeacherFromEvent: (eventId, personId) => api(`/course-events/${eventId}/teachers/${personId}`, {
        method: "DELETE",
    }),

    holidays: () => api('/holidays'),

};