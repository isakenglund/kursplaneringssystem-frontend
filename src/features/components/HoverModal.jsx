import React, { useMemo } from "react";
import { getReadableTextColor, lightenColor, getRelativeLuminance, parseColorToRGB } from '../functions/colorFunctions.jsx';

export default function HoverModal({ hoverData, listOfCourses, listOfMiscs }) {
    if (!hoverData) return null;

    const { x, y, event } = hoverData;

    console.log("HoverModal event:", event);
    console.log("event endtime:", event.end);

    const baseColor =
        event.backgroundColor ||
        event.borderColor ||
        event.extendedProps?.color ||
        "#ffffff";

    const bgColor = lightenColor(baseColor, 0.35);
    const textColor = getReadableTextColor(bgColor);
    const p = event.extendedProps || {};


    function isVacationOrHoliday(event) {
        if (event.id?.startsWith("vacation-")) return true;
        else if (event.id?.startsWith("holiday-")) return true;
        else return false;
    }

    function formatDateOnly(date) {
        return new Date(date).toLocaleDateString("sv-SE");
    }


    const { parentTypeLabel, parentName } = useMemo(() => {
        if (p.courseId != null) {
            const id = Number(p.courseId);
            const course = listOfCourses.find(c => Number(c.id) === id);
            return {
                parentTypeLabel: "Från kursen",
                parentName: course?.name ?? `Okänd kurs (id: ${p.courseId})`,
            };
        }

        if (p.miscId != null) {
            const id = Number(p.miscId);
            const misc = listOfMiscs.find(m => Number(m.id) === id);
            return {
                parentTypeLabel: "Från övrig kategori",
                parentName: misc?.name ?? `Okänd kategori (id: ${p.miscId})`,
            };
        }

        return { parentTypeLabel: null, parentName: null };
    }, [p.courseId, p.miscId, listOfCourses, listOfMiscs]);

    return (
        <div
            className="fixed z-50"
            style={{
                left: x,
                top: y,
                pointerEvents: "none",
            }}
        >
            <div
                className="rounded-lg shadow-xl w-80 p-4 border"
                style={{
                    backgroundColor: bgColor,
                    color: textColor,
                    borderColor: "rgba(0,0,0,0.12)",
                }}
            >
                <div className="font-semibold mb-1">{event.title}</div>

                {p.description && (
                    <div className="text-sm mb-2">
                        Beskrivning: {p.description}
                    </div>
                )}

                {event.start && isVacationOrHoliday(event) ? (
                    <div className="text-sm flex gap-2">
                        <span className="font-medium">Datum:</span>
                        <span>{formatDateOnly(event.start)}</span>
                    </div>

                ) : (
                    <>
                        {event.start && (
                            <div className="text-sm flex gap-2">
                                <span className="font-medium w-8 shrink-0">Start:</span>
                                <span>
                                    {new Date(event.start).toLocaleTimeString("sv-SE", {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                    })}{" "}
                                    {new Date(event.start).toLocaleDateString("sv-SE")}
                                </span>
                            </div>
                        )}

                        {event.end && (
                            <div className="text-sm flex gap-2">
                                <span className="font-medium w-8 shrink-0">Slut:</span>
                                <span>
                                    {new Date(event.end).toLocaleTimeString("sv-SE", {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                    })}{" "}
                                    {new Date(event.end).toLocaleDateString("sv-SE")}
                                </span>
                            </div>
                        )}

                    </>
                )}

                {Array.isArray(p.teachers) && p.teachers.length > 0 && (
                    <div className="text-sm ">
                        <br></br>
                        <span className="font-medium">Lärare:</span>{" "}
                        {p.teachers.map(t => `${t.firstName} ${t.lastName}`).join(", ")}
                    </div>
                )}

                {parentTypeLabel && (
                    <div className="text-xs opacity-80 mt-3">
                        {parentTypeLabel}: {parentName}
                    </div>
                )}
            </div>
        </div>
    );
}