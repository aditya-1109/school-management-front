import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Search, Calendar } from "lucide-react";
import { apiFunction } from "../../api/apiFunction";
import { updateAttendanceApi } from "../../api/apis";
import { getUserRedux } from "../../redux/getData";
import Toast from "../Components/Toast";

export default function Attendance() {
    const { users } = useSelector((state) => state.getData);

    const [activeTab, setActiveTab] = useState("student");
    const [search, setSearch] = useState("");
    const [dateFilter, setDateFilter] = useState("today");
    const [openAttendanceModal, setAttendanceModal] = useState(null)
    const [statusFilter, setStatusFilter] = useState("all");
    const [newAttendance, setNewAttendance] = useState({ date: "", status: "" })
    const [toast, setToast] = useState(null)
    const dispatch = useDispatch()

    const tabs = ["student", "teacher", "principal"];

    const showToast = (message, type = 'success') => {
        setToast({ message, type });

    };

    const todayString = new Date().toISOString().split("T")[0];

    useEffect(() => {
        if (!users) {
            dispatch(getUserRedux())
        }
    }, [dispatch])


    const filteredUsers = useMemo(() => {
        return users
            ?.filter((user) => user.type === activeTab)
            ?.filter((user) =>
                user.name?.toLowerCase().includes(search.toLowerCase())
            )
            ?.map((user) => {
                const attendanceArray = user.attendance || [];

                let filteredAttendance = [];

                if (dateFilter === "today") {
                    filteredAttendance = attendanceArray.filter(
                        (a) => a.date === todayString
                    );
                } else {
                    const last7Days = new Date();
                    last7Days.setDate(last7Days.getDate() - 7);

                    filteredAttendance = attendanceArray.filter(
                        (a) => new Date(a.date) >= last7Days
                    );
                }

                const totalDays = filteredAttendance.length;

                const presentDays = filteredAttendance.filter(
                    (a) => a.status === "present"
                ).length;

                const attendancePercentage =
                    totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0;

                const todayStatus = attendanceArray.find(
                    (a) => a.date === todayString
                )?.status;

                return {
                    ...user,
                    attendancePercentage,
                    todayStatus,
                };
            })
            ?.filter((user) => {
                if (statusFilter === "all") return true;

                if (dateFilter === "today") {
                    return user.todayStatus === statusFilter;
                }

                // For weekly filter → check if user has at least one matching status
                return user.attendance?.some((a) => {
                    const last7Days = new Date();
                    last7Days.setDate(last7Days.getDate() - 7);
                    return (
                        new Date(a.date) >= last7Days &&
                        a.status === statusFilter
                    );
                });
            });
    }, [users, activeTab, search, dateFilter, statusFilter]);



    const markAttendance = async (id) => {
        const response = await apiFunction(updateAttendanceApi, [id], newAttendance, "put", true)
        if (response.success) {
            showToast(response.message, "success")
            dispatch(getUserRedux())
            setNewAttendance({ date: "", status: "" })
        } else {
            showToast(response.message, "error")
        }
    }

    return (
        <div className="min-h-screen bg-slate-50 p-8">

            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}
            {/* HEADER */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800">
                        Attendance Dashboard
                    </h1>
                    <p className="text-slate-500 text-sm mt-1">
                        Monitor daily and weekly attendance performance
                    </p>
                </div>

                {/* RIGHT CONTROLS */}
                <div className="flex flex-col sm:flex-row gap-4">
                    {/* Search */}
                    <div className="relative w-full sm:w-72">
                        <Search
                            className="absolute left-3 top-3 text-slate-400"
                            size={18}
                        />
                        <input
                            type="text"
                            placeholder="Search user..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                    </div>

                    {/* Date Filter */}
                    <div className="flex bg-white border border-slate-200 rounded-xl overflow-hidden">
                        <button
                            onClick={() => setDateFilter("today")}
                            className={`px-4 py-2 text-sm font-medium transition ${dateFilter === "today"
                                ? "bg-blue-600 text-white"
                                : "text-slate-600 hover:bg-slate-100"
                                }`}
                        >
                            Today
                        </button>
                        <button
                            onClick={() => setDateFilter("week")}
                            className={`px-4 py-2 text-sm font-medium transition ${dateFilter === "week"
                                ? "bg-blue-600 text-white"
                                : "text-slate-600 hover:bg-slate-100"
                                }`}
                        >
                            Last 7 Days
                        </button>
                    </div>

                    {/* Status Filter */}
                    <div className="flex bg-white border border-slate-200 rounded-xl overflow-hidden">
                        {["all", "present", "late", "absent"].map((status) => (
                            <button
                                key={status}
                                onClick={() => setStatusFilter(status)}
                                className={`px-4 py-2 text-sm font-medium capitalize transition ${statusFilter === status
                                        ? status === "present"
                                            ? "bg-green-600 text-white"
                                            : status === "late"
                                                ? "bg-yellow-500 text-white"
                                                : status === "absent"
                                                    ? "bg-red-600 text-white"
                                                    : "bg-blue-600 text-white"
                                        : "text-slate-600 hover:bg-slate-100"
                                    }`}
                            >
                                {status}
                            </button>
                        ))}
                    </div>

                </div>
            </div>

            {/* TABS */}
            <div className="flex gap-3 mb-8">
                {tabs.map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-5 py-2 rounded-xl text-sm font-medium capitalize transition ${activeTab === tab
                            ? "bg-blue-600 text-white shadow-md"
                            : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-100"
                            }`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* TABLE */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-100 text-slate-600 text-sm uppercase">
                            <tr>
                                <th className="px-6 py-4">Name</th>
                                <th className="px-6 py-4">Email</th>
                                <th className="px-6 py-4">Attendance %</th>
                                <th className="px-6 py-4">Today Status</th>
                            </tr>
                        </thead>

                        <tbody>
                            {filteredUsers?.length > 0 ? (
                                filteredUsers.map((user) => (
                                    <tr
                                        key={user.id}
                                        onClick={() => setAttendanceModal(user)}
                                        className="border-t border-slate-100 hover:bg-slate-50 transition"
                                    >
                                        {/* Name */}
                                        <td className="px-6 py-4 flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold">
                                                {user.name?.charAt(0)}
                                            </div>
                                            <span className="font-medium text-slate-800">
                                                {user.name}
                                            </span>
                                        </td>

                                        {/* Email */}
                                        <td className="px-6 py-4 text-slate-600 text-sm">
                                            {user.email}
                                        </td>

                                        {/* Attendance Percentage */}
                                        <td className="px-6 py-4 w-60">
                                            <div className="flex items-center gap-3">
                                                <div className="w-full bg-slate-200 rounded-full h-2.5">
                                                    <div
                                                        className={`h-2.5 rounded-full ${user.attendancePercentage >= 75
                                                            ? "bg-green-500"
                                                            : user.attendancePercentage >= 50
                                                                ? "bg-yellow-500"
                                                                : "bg-red-500"
                                                            }`}
                                                        style={{
                                                            width: `${user.attendancePercentage}%`,
                                                        }}
                                                    />
                                                </div>
                                                <span className="text-sm font-medium text-slate-700">
                                                    {user.attendancePercentage}%
                                                </span>
                                            </div>
                                        </td>

                                        {/* Today Status */}
                                        <td className="px-6 py-4">
                                            <span
                                                className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${user.todayStatus === "present"
                                                    ? "bg-green-100 text-green-600"
                                                    : user.todayStatus === "late"
                                                        ? "bg-yellow-100 text-yellow-600"
                                                        : user.todayStatus === "absent"
                                                            ? "bg-red-100 text-red-600"
                                                            : "bg-gray-100 text-gray-500"
                                                    }`}
                                            >
                                                {user.todayStatus || "Not Marked"}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td
                                        colSpan="4"
                                        className="text-center py-10 text-slate-400"
                                    >
                                        No records found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {openAttendanceModal && (
                <div
                    onClick={() => setAttendanceModal(null)}
                    className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-200"
                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        className="relative bg-white w-[95%] sm:w-[500px] rounded-3xl shadow-2xl p-8 animate-in zoom-in-95 duration-200"
                    >
                        {/* Close Button */}
                        <button
                            onClick={() => setAttendanceModal(null)}
                            className="absolute top-4 right-4 text-slate-400 hover:text-red-500 transition"
                        >
                            ✕
                        </button>

                        {/* Header Section */}
                        <div className="flex flex-col items-center text-center">
                            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-600 to-blue-700 text-white flex items-center justify-center text-xl font-semibold shadow-md">
                                {openAttendanceModal?.name?.charAt(0) || "?"}
                            </div>

                            <h2 className="mt-4 text-lg font-semibold text-slate-800">
                                {openAttendanceModal?.name}
                            </h2>

                            <p className="text-sm text-slate-500">
                                Mark Attendance
                            </p>
                        </div>

                        {/* Form Section */}
                        <div className="mt-8 flex flex-col gap-5">
                            {/* Date Picker */}
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-medium text-slate-600">
                                    Select Date
                                </label>
                                <input
                                    type="date"
                                    value={newAttendance?.date || ""}
                                    onChange={(e) =>
                                        setNewAttendance({
                                            ...newAttendance,
                                            date: e.target.value,
                                        })
                                    }
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition"
                                />
                            </div>

                            {/* Status Select */}
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-medium text-slate-600">
                                    Attendance Status
                                </label>
                                <select
                                    value={newAttendance?.status || ""}
                                    onChange={(e) =>
                                        setNewAttendance({
                                            ...newAttendance,
                                            status: e.target.value,
                                        })
                                    }
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition capitalize"
                                >
                                    <option value="" disabled>
                                        Select status
                                    </option>
                                    {["present", "absent", "late"].map((status) => (
                                        <option value={status} key={status} className="capitalize">
                                            {status}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Submit Button */}
                            <button
                                disabled={!newAttendance?.date || !newAttendance?.status}
                                onClick={() => {
                                    if (!newAttendance?.date || !newAttendance?.status) return;
                                    markAttendance(openAttendanceModal.id);
                                }}
                                className={`mt-4 py-3 rounded-xl font-medium transition-all duration-300 ${!newAttendance?.date || !newAttendance?.status
                                    ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                                    : "bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg"
                                    }`}
                            >
                                Submit Attendance
                            </button>
                        </div>
                    </div>
                </div>
            )}



        </div>
    );
}
