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

export default function useCourses() {
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