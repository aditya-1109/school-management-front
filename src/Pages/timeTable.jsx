import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getClassesRedux, getTimeTableRedux, getUserRedux } from "../../redux/getData";
import { useMemo } from "react";
import { useState } from "react";
import { apiFunction } from "../../api/apiFunction";
import { createTimeTableApi } from "../../api/apis";
import Toast from "../Components/Toast";

const days = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday"]

const Timetable = () => {

    const { users, classes, timeTables } = useSelector((state) => state.getData)
    const dispatch = useDispatch()
    const [openTimeTableModel, setOpenTimeTableModel] = useState(null)
    const [selectedClass, setSelectedClass] = useState(classes && classes[0]);
    const [newTimeTable, setNewTimeTable] = useState({ day: "", classId: "", timeTables: [] })
    const [timeSubject, setTimeSubject] = useState({ subject: "", initialTime: "", finalTime: "", teacher: "" })
    const [toast, setToast] = useState(null)
    const [selectedDay, setSelectedDay] = useState(0)

    useEffect(() => {

        if (dispatch) {
            if (!users) {

                dispatch(getUserRedux())
            }
            if (!classes) {
                dispatch(getClassesRedux())
            }
            if (!timeTables) {
                dispatch(getTimeTableRedux())
            }

        }
    }, [dispatch])



    const selectedTimeTable = useMemo(() => {
        if (!selectedClass || !timeTables?.length) return null;

        const timeeee = timeTables.filter((timee) => timee.classId == selectedClass.id)
        if (timeeee?.length > 0) {
            return timeeee[0]
        }
    }, [selectedClass, timeTables]);

    const showToast = (message, type = 'success') => setToast({ message, type });


    const handleNewTable = async () => {

        const response = await apiFunction(createTimeTableApi, [], newTimeTable, "post", true)
        if (response.success) {

            setOpenTimeTableModel(false)
            setNewTimeTable({ day: "", classId: "", timeTables: [] })
            setTimeSubject({ subject: "", initialTime: "", finalTime: "", teacher: "" })
            showToast(response.message, "success")
        } else {
            showToast(response.message, "error")
        }

    }



    const getUserName = (userId) => {

        const user = users?.filter((user) => user.id == userId)
        if (user?.length > 0) {

            return user[0]?.name
        }
    }

    console.log(selectedTimeTable?.id)

    return (
        <div className="space-y-6">
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
            {/* 🔵 Top Header */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900">Class Timetable</h2>
                    <p className="text-sm text-slate-500">
                        Manage and view class schedules
                    </p>
                </div>

                <button onClick={() => {
                    setNewTimeTable({ day: "", classId: selectedClass?.id, timeTables: [] })
                    setOpenTimeTableModel(true)
                }} className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-medium shadow-sm transition">
                    + Create Timetable
                </button>
            </div>

            {/* 🔵 Class & Section Selector */}
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between">

                <div className="flex gap-4 items-center">
                    <select
                        value={
                            selectedClass
                                ? JSON.stringify(selectedClass)
                                : ""
                        }
                        onChange={(e) => {
                            const selected = JSON.parse(e.target.value);
                            setSelectedClass(selected);
                        }}
                        className="px-4 py-2 rounded-xl border border-slate-300 text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                    >
                        <option value="">Select Class</option>

                        {classes?.map((cls) => (
                            <option
                                key={cls.id}
                                value={JSON.stringify(cls)}
                            >
                                {cls.className} - {cls.section?.toUpperCase()}
                            </option>
                        ))}
                    </select>
                </div>


                {/* 🔁 Day Switcher */}
                <div className="flex items-center gap-4">
                    <button onClick={() => setSelectedDay((prev) => (prev > 0 ? prev - 1 : 0))} className="w-8 h-8 flex items-center justify-center rounded-full border border-slate-200 hover:bg-slate-100 transition">
                        ←
                    </button>

                    <h3 className="font-semibold text-slate-800 text-sm">
                        {days[selectedDay]?.toUpperCase()}
                    </h3>

                    <button onClick={() => setSelectedDay((prev) => (prev < 5 ? prev + 1 : 5))} className="w-8 h-8 flex items-center justify-center rounded-full border border-slate-200 hover:bg-slate-100 transition">
                        →
                    </button>
                </div>
            </div>

            {/* 🔵 Timetable Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">

                <table className="w-full text-sm">
                    <thead className="bg-slate-50 border-b border-slate-200">
                        <tr className="text-left text-slate-600">
                            <th className="px-6 py-3 font-medium">Time</th>
                            <th className="px-6 py-3 font-medium">Subject</th>
                            <th className="px-6 py-3 font-medium">Teacher</th>
                        </tr>
                    </thead>

                    <tbody>
                        {selectedTimeTable?.[days[selectedDay]]?.map((timet, ind) => (
                            <tr
                                key={ind}
                                className="border-b border-slate-100 hover:bg-slate-50 transition"
                            >
                                <td className="px-6 py-4 font-medium text-slate-700">
                                    {timet.time}
                                </td>
                                <td className="px-6 py-4 text-slate-600">
                                    {timet.subject}
                                </td>
                                <td className="px-6 py-4 text-slate-600">
                                    {getUserName(timet.teacher)}
                                </td>
                            </tr>
                        ))}


                        
                    </tbody>
                </table>
            </div>

            {openTimeTableModel && (
                <div
                    onClick={() => setOpenTimeTableModel(false)}
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        className="w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-2xl border border-slate-200 p-8"
                    >
                        {/* Header */}
                        <div className="flex justify-between items-center mb-8">
                            <h2 className="text-2xl font-bold text-slate-800">
                                Create Timetable
                            </h2>
                            <button
                                onClick={() => setOpenTimeTableModel(false)}
                                className="text-slate-400 hover:text-red-500 text-xl transition"
                            >
                                ✕
                            </button>
                        </div>

                        {/* Class */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-slate-600">
                                Class
                            </label>
                            <input
                                value={`${selectedClass?.className}- ${selectedClass?.section?.toUpperCase()}`}
                                disabled
                                className="w-full mt-2 px-4 py-2 bg-slate-100 rounded-lg border border-slate-200 text-sm"
                            />
                        </div>

                        {/* Day */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-slate-600">
                                Day
                            </label>
                            <select
                                value={newTimeTable.day}
                                onChange={(e) =>
                                    setNewTimeTable({ ...newTimeTable, day: e.target.value })
                                }
                                className="w-full mt-2 px-4 py-2 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            >
                                <option value="">Select Day</option>
                                {days.map((day, ind) => (
                                    <option key={ind} value={day}>
                                        {day}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Time Inputs */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            <div>
                                <label className="block text-sm font-medium text-slate-600">
                                    Start Time
                                </label>
                                <input
                                    type="time"
                                    value={timeSubject.initialTime}
                                    onChange={(e) =>
                                        setTimeSubject({
                                            ...timeSubject,
                                            initialTime: e.target.value,
                                        })
                                    }
                                    className="w-full mt-2 px-4 py-2 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-600">
                                    End Time
                                </label>
                                <input
                                    type="time"
                                    value={timeSubject.finalTime}
                                    onChange={(e) =>
                                        setTimeSubject({
                                            ...timeSubject,
                                            finalTime: e.target.value,
                                        })
                                    }
                                    className="w-full mt-2 px-4 py-2 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>

                        {/* Teacher & Subject Select */}
                        {timeSubject.initialTime && timeSubject.finalTime && (
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-slate-600">
                                    Teacher & Subject
                                </label>

                                <select
                                    value={timeSubject.teacher || ""}
                                    onChange={(e) => {
                                        const teacherId = e.target.value;
                                        const subject = e.target.options[e.target.selectedIndex].dataset.subject;

                                        setTimeSubject({
                                            ...timeSubject,
                                            teacher: teacherId,   // ✅ simple string
                                            subject: subject,     // ✅ subject from dataset
                                        });
                                    }}
                                    className="w-full mt-2 px-4 py-2 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">Select Teacher</option>

                                    {/* Default Class Teacher */}
                                    <option
                                        value={selectedClass?.teacher}
                                        data-subject={selectedClass?.subject}
                                    >
                                        {getUserName(selectedClass?.teacher)} - {selectedClass?.subject}
                                    </option>

                                    {/* Other Teachers */}
                                    {selectedClass?.teachersSubject?.map((cls, ind) => (
                                        <option
                                            key={ind}
                                            value={cls.teacher}
                                            data-subject={cls.subject}
                                        >
                                            {getUserName(cls.teacher)} - {cls.subject}
                                        </option>
                                    ))}
                                </select>

                            </div>
                        )}

                        {/* Preview Section */}
                        {newTimeTable.timeTables.length > 0 && (
                            <div className="mb-8 bg-slate-50 p-5 rounded-xl border border-slate-200">
                                <h3 className="text-sm font-semibold text-slate-700 mb-4">
                                    Added Periods
                                </h3>

                                <div className="space-y-3">
                                    {newTimeTable.timeTables.map((item, index) => (
                                        <div
                                            key={index}
                                            className="flex justify-between items-center bg-white px-4 py-2 rounded-lg border text-sm"
                                        >
                                            <div>
                                                <p className="font-medium text-slate-800">
                                                    {item.subject}
                                                </p>
                                                <p className="text-xs text-slate-500">
                                                    {getUserName(item.teacher)}
                                                </p>
                                            </div>
                                            <span className="text-slate-600 font-medium">
                                                {item.time}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Buttons */}
                        <div className="flex justify-end gap-4">
                            <button
                                onClick={() => {
                                    setNewTimeTable({ day: "", classId: "", timeTables: [] });
                                    setTimeSubject({
                                        subject: "",
                                        teacher: "",
                                        initialTime: "",
                                        finalTime: "",
                                    });
                                    setOpenTimeTableModel(false);
                                }}
                                className="px-5 py-2 rounded-lg border border-slate-300 text-sm hover:bg-slate-100 transition"
                            >
                                Cancel
                            </button>

                            <button
                                onClick={() => {
                                    if (
                                        !newTimeTable.day ||
                                        !timeSubject.subject ||
                                        !timeSubject.initialTime ||
                                        !timeSubject.finalTime
                                    ) {
                                        alert("Please complete all fields");
                                        return;
                                    }

                                    if (timeSubject.initialTime >= timeSubject.finalTime) {
                                        alert("End time must be after start time");
                                        return;
                                    }

                                    const formattedTime = `${timeSubject.initialTime} - ${timeSubject.finalTime}`;

                                    setNewTimeTable({
                                        ...newTimeTable,
                                        timeTables: [
                                            ...newTimeTable.timeTables,
                                            {
                                                subject: timeSubject.subject,
                                                teacher: timeSubject.teacher,
                                                time: formattedTime,
                                            },
                                        ],
                                    });

                                    setTimeSubject({
                                        subject: "",
                                        teacher: "",
                                        initialTime: "",
                                        finalTime: "",
                                    });
                                }}
                                className="px-5 py-2 rounded-lg bg-blue-600 text-white text-sm hover:bg-blue-700 transition"
                            >
                                Add Period
                            </button>

                            <button
                                onClick={handleNewTable}
                                className="px-6 py-2 rounded-lg bg-green-600 text-white text-sm hover:bg-green-700 shadow-md transition"
                            >
                                Submit
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>

    );
};

export default Timetable