import React, { useEffect, useState } from "react";
import { formatDate } from "@fullcalendar/core";
import EditEventModal from "./EditEventModal.jsx";
import TeacherPicker from "./TeacherPicker.jsx";
import useGetCourses, { useDeleteCourseEvent, useSaveCourseEvent } from "../hooks.js";

export default function VacationPicker({
    draggableContainerRef,
    currentEvents,
    openModal,
    closeModal,
    isModalOpen,
}) {

}