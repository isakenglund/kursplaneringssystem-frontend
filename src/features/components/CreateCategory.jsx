import React, {useState} from "react";
import ColorPicker from "../../ColorPicker.jsx";

export default function CreateCategory({ weekendsVisible, handleWeekendsToggle, currentEvents }) {
    const [showCreateCatagory, setShowCreateCatagory] = useState(false);

    return (
        <div className='demo-app-sidebar'>
            <div className='demo-app-sidebar-section'>
                <label>
                    <input
                        type='checkbox'
                        checked={weekendsVisible}
                        onChange={handleWeekendsToggle}
                    ></input>
                    toggle weekends
                </label>
            </div>
            <button onClick={() => setShowCreateCatagory(!showCreateCatagory)}>Create category</button>
            {showCreateCatagory && <ShowCategoryInput setShowCreateCatagory={setShowCreateCatagory}/>}
            <div className='demo-app-sidebar-section'>
                <h2>All Events ({currentEvents.length})</h2>

            </div>
        </div>
    )
}

function ShowCategoryInput({setShowCreateCatagory}) {

    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0"); // month is 0-indexed
    const dd = String(today.getDate()).padStart(2, "0");
    const todayDate = `${yyyy}-${mm}-${dd}`;


    const [categoryType, setCategoryType] = useState("course")
    const [hp, setHp] = useState(null);
    const [studentNum, setStudentNum] = useState(null);
    const [startDate, setStartDate] = useState(todayDate);
    const [endDate, setEndDate] = useState(todayDate);
    return (
        <div>
            <label style={{ fontWeight: 600 }}>Namn på kategorin</label>
            <br></br>
            <input
                type="text"
                placeholder="T.ex Datasystem, Matematik"
            />
            <br></br>
            <label>
                <input
                    type='radio'
                    name='categoryType'
                    value='course'
                    checked={categoryType === "course"}
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
                    value='misc'
                    checked={categoryType === "misc"}
                    onChange={(e) => {
                        setCategoryType(e.target.value);
                        setStartDate(todayDate);
                        setEndDate(todayDate)}}
                /> Övrigt
            </label>
            <br></br>
            <ColorPicker />
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
                            value={studentNum}
                            onChange={(e) => setStudentNum(parseFloat(e.target.value))}
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
            <button style={{ color: "blue"}}>Skapa</button>
            <button onClick={() => setShowCreateCatagory(false)}>avbryt</button>
        </div>
    )
}
