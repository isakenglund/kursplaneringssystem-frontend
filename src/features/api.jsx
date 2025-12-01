import { api } from '/../lib/fetcher';

export const API = {

    courses: () => api('/courses'),

    save: (course) => api('', {
        method: "POST",
        body: JSON.stringify({
            type: course.type,
            name: course.name,
            description: course.description,
            colorHex: course.colorHex,
            hp: course.hp,
            numOfStudents: course.numOfStudents,
            startDate: course.startDate,
            endDate: course.endDate,
        })
    }, ),

};