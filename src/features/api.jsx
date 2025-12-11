import {api} from "../lib/fetcher.jsx";

export const API = {

    courses: () => api('/courses'),

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
    }, ),

    teachers: () => api('/persons'),

    holidays: () => api('/holidays'),

    saveCourseEvent: (event) => api('/courseEvent', {
        method: "POST",
        body: JSON.stringify({
            id: event.id,
            name: event.name,
            description: event.description,
            startTime: event.startTime,
            endTime: event.endTime,
            teachers: event.teachers,
        })
    },),

};