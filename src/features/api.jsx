import {api} from "../lib/fetcher.jsx";

export const API = {

    courses: () => api('/courses', {
        method: "GET",

    }),
    courses: () => api('/courses', {
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
        })
    }),

    holidays: () => api('/holidays'),
};