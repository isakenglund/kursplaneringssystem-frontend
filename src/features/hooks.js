import { useEffect, useState, useCallback } from 'react';
import {API} from './api';

const USE_MOCK = (import.meta.env?.VITE_USE_MOCK ?? 'true') === 'false';

const MOCK = {

    courses: [
        {},
        {},
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

    // change this to force the effect to re-run
    const [refreshIndex, setRefreshIndex] = useState(0);

    const refetch = useCallback(() => {
        setRefreshIndex((i) => i + 1);
    }, []);

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
                    setData(pickList(res, "type"));
                }
            } catch (e) {
                if (live) setErr(e);
            } finally {
                if (live) setLoading(false);
            }
        })();

        return () => {
            live = false;
        };
    }, [refreshIndex]); // refetch triggers this

    return {data, loading, err, refetch, setData };
}




export function useGetMiscs() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState(null);

    const [refreshIndex, setRefreshIndex] = useState(0);

    const refetch = useCallback(() => {
        setRefreshIndex((i) => i + 1);
    }, []);

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
                    const res = await API.miscs();
                    if (!live) return;
                    setData(pickList(res, "type"));
                }
            } catch (e) {
                if (live) setErr(e);
            } finally {
                if (live) setLoading(false);
            }
        })();

        return () => {
            live = false;
        };
    }, [refreshIndex]);

    return { data, loading, err, refetch, setData };
}

export function useSaveCourse() {
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
  
    return { data, loading, err, save: save };
}

export function useSaveMisc() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState(null);

    async function save(misc) {
        setLoading(true);
        setErr(null);
        try {
            const res = await API.saveMisc(misc);
            setData(pickList(res));
            return res;
        } catch (e) {
            setErr(e);
            throw e;
        } finally {
            setLoading(false);
        }
    }

    return {data, loading, err, save};
}

export function useDeleteCourse() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState(null);

    async function remove(courseId) {
        setLoading(true);
        setErr(null);

        try {
            if (USE_MOCK) {
                await delay(100);
                setData(true);
                return true;
            }

            const res = await API.deleteCourse(courseId);
            setData(res ?? true);
            return true;

        } catch (e) {
            setErr(e);
            throw e;
        } finally {
            setLoading(false);
        }
    }

    return {data, loading, err, remove};
}

export function useUpdateCourse() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState(null);

    async function update(course) {
        setLoading(true);
        setErr(null);

        try {
            if (USE_MOCK) {
                await delay(100);
                setData(true);
                return true;
            }

            const res = await API.updateCourse(course);
            setData(res ?? true);
            return true;

        } catch (e) {
            setErr(e);
            throw e;
        } finally {
            setLoading(false);
        }
    }

    return {data, loading, err, update};
}

export function useUpdateMisc() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState(null);

    async function update(misc) {
        setLoading(true);
        setErr(null);

        try {
            if (USE_MOCK) {
                await delay(100);
                setData(true);
                return true;
            }

            const res = await API.updateMisc(misc);
            setData(res ?? true);
            return true;

        } catch (e) {
            setErr(e);
            throw e;
        } finally {
            setLoading(false);
        }
    }

    return {data, loading, err, update};
}

    export function useDeleteMisc() {
        const [data, setData] = useState(null);
        const [loading, setLoading] = useState(false);
        const [err, setErr] = useState(null);

        async function remove(miscId) {
            setLoading(true);
            setErr(null);

            try {
                if (USE_MOCK) {
                    await delay(100);
                    setData(true);
                    return true;
                }

                const res = await API.deleteMisc(miscId);
                setData(res ?? true);
                return true;

            } catch (e) {
                setErr(e);
                throw e;
            } finally {
                setLoading(false);
            }
        }

        return {data, loading, err, remove};
    }

export function useGetTeachers() {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);

  // change this to force the effect to re-run
  const [refreshIndex, setRefreshIndex] = useState(0);

  const refetch = useCallback(() => {
    setRefreshIndex((i) => i + 1);
  }, []);

  useEffect(() => {
    let live = true;

    (async () => {
      try {
        setLoading(true);
        setErr(null);

        if (USE_MOCK) {
          await delay(150);
          if (!live) return;
          // add MOCK.teachers if you have it; otherwise default to []
          setTeachers(MOCK.teachers ?? []);
        } else {
          const res = await API.teachers();
          if (!live) return;
          // if API returns { teachers: [...] } you can use pickList(res, "teachers")
          setTeachers(Array.isArray(res) ? res : (res ?? []));
        }
      } catch (e) {
        if (live) {
          setErr(e);
          setTeachers([]);
        }
      } finally {
        if (live) setLoading(false);
      }
    })();

    return () => {
      live = false;
    };
  }, [refreshIndex]); // refetch triggers this

  return { teachers, loading, err, refetch };
}

    export function useEventTeacherUpdater() {
        const [loading, setLoading] = useState(false);
        const [error, setError] = useState(null);

        const addTeacher = async (eventId, personId) => {
            setLoading(true);
            setError(null);
            try {
                const updatedEvent = await API.addTeacherToEvent(eventId, personId);
                return updatedEvent;
            } catch (e) {
                setError(e);
                throw e;
            } finally {
                setLoading(false);
            }
        };

        const removeTeacher = async (eventId, personId) => {
            setLoading(true);
            setError(null);
            try {
                await API.removeTeacherFromEvent(eventId, personId);
            } catch (e) {
                setError(e);
                throw e;
            } finally {
                setLoading(false);
            }
        };

        return {addTeacher, removeTeacher, loading, error};
    }

    export function useSaveCourseEvent() {
        const [data, setData] = useState([]);
        const [loading, setLoading] = useState(false);
        const [err, setErr] = useState(null);

        async function save(courseEvent) {
            setLoading(true);
            setErr(null);
            try {
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

        return {data, loading, err, save};
    }

    export function useSaveMiscEvent() {
        const [data, setData] = useState([]);
        const [loading, setLoading] = useState(false);
        const [err, setErr] = useState(null);

        async function save(miscEvent) {
            setLoading(true);
            setErr(null);
            try {
                const res = await API.saveMiscEvent(miscEvent);
                setData(pickList(res));
                return res;
            } catch (e) {
                setErr(e);
                throw e;
            } finally {
                setLoading(false);
            }
        }

        return {data, loading, err, save};
    }

    export function useUpdateCourseEvent() {
        const [data, setData] = useState([]);
        const [loading, setLoading] = useState(false);
        const [err, setErr] = useState(null);

        async function save(courseEvent) {
            setLoading(true);
            setErr(null);
            try {
                const res = await API.updateCourseEvent(courseEvent);
                setData(pickList(res));
                return res;
            } catch (e) {
                setErr(e);
                throw e;
            } finally {
                setLoading(false);
            }
        }

        return {data, loading, err, save};
    }

    export function useUpdateMiscEvent() {
        const [data, setData] = useState([]);
        const [loading, setLoading] = useState(false);
        const [err, setErr] = useState(null);

        async function save(miscEvent) {
            setLoading(true);
            setErr(null);
            try {
                const res = await API.updateMiscEvent(miscEvent);
                
                setData(pickList(res));
                return res;
            } catch (e) {
                setErr(e);
                throw e;
            } finally {
                setLoading(false);
            }
        }

        return {data, loading, err, save};
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

            return () => {
                live = false;
            };
        }, []);

        return {data, loading, err};
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

        return {data, loading, err, remove};
    }

    export function useDeleteMiscEvent() {
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

                const res = await API.deleteMiscEvent(eventId);
                setData(res ?? true);
                return true;

            } catch (e) {
                setErr(e);
                throw e;
            } finally {
                setLoading(false);
            }
        }

        return {data, loading, err, remove};
    }

    export function useGetAllEvents() {
        const [data, setData] = useState([]);
        const [loading, setLoading] = useState(false);
        const [err, setErr] = useState(null);

        useEffect(() => {
            let live = true;

            (async () => {
                try {
                    setLoading(true);
                    setErr(null);

                    const [courses, misc] = await Promise.all([
                        API.courseEvents(),
                        API.miscEvents()
                    ]);

                const allEvents = [...courses, ...misc];
              
                if (!live) return;
                setData(allEvents);
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

export function useGetAllCategories(){
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState(null);

    useEffect(() => {
        let live = true;

        (async () => {
            try {
                setLoading(true);
                setErr(null);

                const [courses, misc] = await Promise.all([
                    API.courses(),
                    API.miscs()
                ]);

                const allEvents = [...courses, ...misc];
                if (!live) return;
                setData(allEvents);
            } catch (e) {
                if (live) setErr(e);
            } finally {
                if (live) setLoading(false);
            }
        })();

            return () => {
                live = false;
            };
        }, []);

        return {data, loading, err};
    }

   export function useGetVacation() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);

  // force effect to re-run
  const [refreshIndex, setRefreshIndex] = useState(0);

  const refetch = useCallback(() => {
    setRefreshIndex((i) => i + 1);
  }, []);

  useEffect(() => {
    let live = true;

    (async () => {
      try {
        setLoading(true);
        setErr(null);

        const res = await API.getVacation(); // fetch from DB
        if (!live) return;

        setData(Array.isArray(res) ? res : (res ?? []));
      } catch (e) {
        if (live) {
          setErr(e);
          setData([]);
        }
      } finally {
        if (live) setLoading(false);
      }
    })();

    return () => {
      live = false;
    };
  }, [refreshIndex]); // refetch triggers this

  return { data, loading, err, refetch };
}

    export function useDeleteVacation() {
        const [data, setData] = useState(null);
        const [loading, setLoading] = useState(false);
        const [err, setErr] = useState(null);

        async function remove(vacationId) {
            setLoading(true);
            setErr(null);

            try {
                if (USE_MOCK) {
                    await delay(100);
                    setData(true);
                    return true;
                }

                const res = await API.deleteVacation(vacationId);
                setData(res ?? true);
                return true;

            } catch (e) {
                setErr(e);
                throw e;
            } finally {
                setLoading(false);
            }
        }

        return {data, loading, err, remove};
    }

    export function useSaveVacation() {
        const [data, setData] = useState([]);
        const [loading, setLoading] = useState(false);
        const [err, setErr] = useState(null);

        async function save(vacation) {
            setLoading(true);
            setErr(null);
            try {
                const res = await API.saveVacation(vacation);
                setData(pickList(res));
                return res;
            } catch (e) {
                setErr(e);
                throw e;
            } finally {
                setLoading(false);
            }
        }

        return {data, loading, err, save};
    }

export function useUpdateCourseEventTime() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState(null);

    async function update(eventId, startTime, endTime) {
        setLoading(true);
        setErr(null);
        try {
            const res = await API.updateCourseEventTime(eventId, startTime, endTime);
            setData(pickList(res));
            return res;
        } catch (e) {
            setErr(e);
            throw e;
        } finally {
            setLoading(false);
        }
    }
    return { data, loading, err, update };
}

export function useUpdateCourseEventEndTime() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState(null);

    async function update(eventId, endTime) {
        setLoading(true);
        setErr(null);
        try {
            const res = await API.updateCourseEventEndTime(eventId, endTime);
            setData(pickList(res));
            return res;
        } catch (e) {
            setErr(e);
            throw e;
        } finally {
            setLoading(false);
        }
    }
    return { data, loading, err, update };
}

export function useUpdateMiscEventTime() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState(null);

    async function update(eventId, startTime, endTime) {
        setLoading(true);
        setErr(null);
        try {
            const res = await API.updateMiscEventTime(eventId, startTime, endTime);
            setData(pickList(res));
            return res;
        } catch (e) {
            setErr(e);
            throw e;
        } finally {
            setLoading(false);
        }
    }
    return { data, loading, err, update };
}

export function useUpdateMiscEventEndTime() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState(null);

    async function update(eventId, endTime) {
        setLoading(true);
        setErr(null);
        try {
            const res = await API.updateMiscEventEndTime(eventId, endTime);
            setData(pickList(res));
            return res;
        } catch (e) {
            setErr(e);
            throw e;
        } finally {
            setLoading(false);
        }
    }
    return { data, loading, err, update };
}

export function useSaveTeacher() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState(null);

    async function save(teacher) {
        setLoading(true);
        setErr(null);
        try {
            const res = await API.savePerson(teacher);
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

export function useDeleteTeacher() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState(null);

    async function remove(teacherId) {
        setLoading(true);
        setErr(null);

        try {
            if (USE_MOCK) {
                await delay(100);
                setData(true);
                return true;
            }

            const res = await API.deletePerson(teacherId);
            setData(res ?? true);
            return true;

        } catch (e) {
            setErr(e);
            throw e;
        } finally {
            setLoading(false);
        }
    }

    return {data, loading, err, remove};
}

