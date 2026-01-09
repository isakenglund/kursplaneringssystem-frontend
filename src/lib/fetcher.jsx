const BASE = 'http://localhost:8080/api'; // proxas i dev

export async function api(path, init = {}) {
    const sep = path.includes('?') ? '&' : '?';
    const res = await fetch(`${BASE}${path}${sep}`, {
        headers: { 'Content-Type': 'application/json' },
        ...init,
    });

    // liten hjälp för felsökning
    const ct = res.headers.get('content-type') || '';
    if (!res.ok) {
        const text = await res.text();
        throw new Error(`${res.status} ${res.statusText}: ${text.slice(0,120)}`);
    }
    if(res.status === 204) {
        return null;
    }
    if (!ct.includes('application/json')) {
        const text = await res.text();
        throw new Error(`Expected JSON but got ${ct}. First 120 chars: ${text.slice(0,120)}`);
    }
    return res.status === 204 ? null : res.json();
}
