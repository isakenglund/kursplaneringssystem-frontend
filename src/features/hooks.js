import {useEffect, useState} from 'react';
import { API } from './api';

const USE_MOCK = (import.meta.env?.VITE_USE_MOCK ?? 'true') === 'false';

const MOCK = {

    courses: [
        {  },
        {  },
    ],



};

const delay = (ms) => new Promise((r) => setTimeout(r, ms));

function pickList(res, field) {
    if (Array.isArray(res)) return res;
    if (res && Array.isArray(res[field])) return res[field];
    return [];
}

export default function useGetCourses() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState(null);

    useEffect(() => {
        let live = true;

        (async () => {
            try {
                setLoading(true);
                setErr(null);

                if (USE_MOCK) {
                    await delay(150);
                    if (!live) return;
                    setData(MOCK.courses() ?? []);
                } else {
                    const res = await API.courses();
                    if (!live) return;
                    setData(pickList(res, 'type'));
                }
            } catch (e) {
                if (live) setErr(e);
            } finally {
                if (live) setLoading(false);
            }
        })();

        return () => { live = false; };
    }, []);

    return { data, loading, err };

}

export function useSaveCourse(){
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState(null);

    async function save(course) {
        setLoading(true);
        setErr(null);
         try {
                const res = await API.saveCourse(course);
                setData(pickList(res));
                return res;
            } catch (e) {
             setErr(e);
             throw e;
            } finally {
             setLoading(false);
            }
        }
    return { data, loading, err, save };
}

export function useGetCourseEvents() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState(null);

    useEffect(() => {
        let live = true;

        (async () => {
            try {
                setLoading(true);
                setErr(null);

                if (USE_MOCK) {
                    await delay(150);
                    if (!live) return;
                    setData(MOCK.courses() ?? []);
                } else {
                    const res = await API.courseEvents();
                    if (!live) return;
                    setData(pickList(res, 'type'));
                }
            } catch (e) {
                if (live) setErr(e);
            } finally {
                if (live) setLoading(false);
            }
        })();

        return () => { live = false; };
    }, []);

    return { data, loading, err };
}

export function useSaveCourseEvent() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState(null);

    async function save(courseEvent) {
        setLoading(true);
        setErr(null);
        try {
            console.log(courseEvent)
            const res = await API.saveCourseEvent(courseEvent);
            setData(pickList(res));
            return res;
        } catch (e) {
            setErr(e);
            throw e;
        } finally {
            setLoading(false);
        }
    }
    return { data, loading, err, save };
}

export function useGetHolidays() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState(null);

    useEffect(() => {
        let live = true;

        (async () => {
            try {
                setLoading(true);
                setErr(null);

                const res = await API.holidays(); // fetch from DB
                if (!live) return;
                setData(res); // assign directly
            } catch (e) {
                if (live) setErr(e);
            } finally {
                if (live) setLoading(false);
            }
        })();

        return () => { live = false; };
    }, []);

    return { data, loading, err };
}

export function useDeleteCourseEvent() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState(null);

    async function remove(eventId) {
        setLoading(true);
        setErr(null);

        try {
            if (USE_MOCK) {
                await delay(100);
                setData(true);
                return true;
            }

            const res = await API.deleteCourseEvent(eventId);
            setData(res ?? true);
            return true;

        } catch (e) {
            setErr(e);
            throw e;
        } finally {
            setLoading(false);
        }
    }

    return { data, loading, err, remove };
}

