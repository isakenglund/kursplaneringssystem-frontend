import React, {useState} from "react";
import ColorPicker from "./ColorPicker.jsx";
import {useSaveCourse} from "../hooks.js";

export default function CreateCategory() {
    const [showCreateCatagory, setShowCreateCatagory] = useState(false);



    return (
        <div className='demo-app-sidebar'>
            <button onClick={() => setShowCreateCatagory(!showCreateCatagory)}>Create category</button>
            {showCreateCatagory && <ShowCategoryInput setShowCreateCatagory={setShowCreateCatagory}/>}
        </div>
    )
}

function ShowCategoryInput({setShowCreateCatagory}) {

    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0"); // month is 0-indexed
    const dd = String(today.getDate()).padStart(2, "0");
    const todayDate = `${yyyy}-${mm}-${dd}`;


    const [name, setName] = useState("");
    const [colorHex, setColorHex] = useState("");
    const [categoryType, setCategoryType] = useState("course")
    const [hp, setHp] = useState(0);
    const [numOfStudents, setNumOfStudents] = useState(0);
    const [startDate, setStartDate] = useState(todayDate);
    const [endDate, setEndDate] = useState(todayDate);

    const course = {
        type: categoryType,
        name: name,
        colorHex: colorHex,
        hp: hp,
        numOfStudents: numOfStudents,
        startDate: startDate,
        endDate: endDate
    }

    const {data: savedCourse, loading: savingCourse, err: courseSaveErr, save} = useSaveCourse();


    const handleColorHex = (colorHex) => {
        setColorHex((colorHex));
    }

    async function handleCreateClick() {
        try {
            await save(course);
            setShowCreateCatagory(false);
        } catch (e) {
            console.error("Kunde inte spara", e);
        }
    }


    return (
        <div>
            <label>
            <input
                type='radio'
                name='categoryType'
                value='COURSE'
                checked={categoryType === "COURSE"}
                onChange={(e) => {
                    setCategoryType(e.target.value);
                    setStartDate(todayDate);
                    setEndDate(todayDate);
                }}
            /> Kurs
        </label>
            <label>
                <input
                    type='radio'
                    name='categoryType'
                    value='MISC'
                    checked={categoryType === "MISC"}
                    onChange={(e) => {
                        setCategoryType(e.target.value);
                        setStartDate(todayDate);
                        setEndDate(todayDate)}}
                /> Övrigt
            </label>
            <br></br>

            <label style={{ fontWeight: 600 }}>Namn på kategorin</label>
            <br></br>
            <input
                type="text"
                value={name}
                placeholder="T.ex Datasystem, Matematik"
                onChange={(t) => {
                    setName(t.target.value)
                }}
            />

            <br></br>
            <ColorPicker onCallback = {handleColorHex} />
            {categoryType === "course" && (
                <div>
                    <label>
                        HP:
                        <input
                            type="number"
                            value={hp}
                            onChange={(e) => setHp(parseFloat(e.target.value))}
                            min={0}    // min HP
                            max={180}   // max HP
                            step={0.5} // increment
                        />
                    </label>
                    <br></br>
                    <label>
                        Antal studenter:
                        <input
                            type="number"
                            value={numOfStudents}
                            onChange={(e) => setNumOfStudents(parseFloat(e.target.value))}
                            min={0}    // min HP
                            max={1000}   // max HP
                            step={1} // increment
                        />
                    </label>
                    <br></br>
                    <label>
                        Start Datum:
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                        />
                    </label>
                    <br></br>
                    <label>
                        Slut Datum:
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                        />
                    </label>
                    {new Date(startDate) > new Date(endDate) && (
                        <p style={{ color: "red", marginTop: "0.5rem" }}>
                            ⚠️ Start datum är nu EFTER slut datum
                        </p>
                    )}
                    {new Date(startDate) < new Date(todayDate) && (
                        <p style={{ color: "red", marginTop: "0.5rem" }}>
                            ⚠️ Start datum är nu FÖRE dagens datum
                        </p>
                    )}
                </div>
            )}
            <button style={{ color: "blue"}} onClick= {handleCreateClick}>Skapa</button>
            <button onClick={() => setShowCreateCatagory(false)}>avbryt</button>
        </div>
    )
}
