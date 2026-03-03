import React, { useEffect, useMemo, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { BookOpen, AlertCircle, Calendar, Trash2, Edit, User, Plus } from 'lucide-react';
import Toast from '../Components/Toast';
import { useDispatch, useSelector } from 'react-redux';
import { getClassesRedux, getCoursesRedux, getExamsRedux, getUserRedux } from '../../redux/getData';
import { apiFunction } from '../../api/apiFunction';
import { createCourseApi, createExamApi, deleteCourseApi, deleteExamsApi, updateCourseApi, updateExamApi, updateMarksApi } from '../../api/apis';
import { supabase } from '../../lib/supabase';

const coursesTypes = ["exam", "Material", "Assignment"]

const Exams = () => {
    const { classes, exams, users, courses } = useSelector((state) => state.getData)
    const [courseType, setCourseType] = useState("exam")
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingExam, setEditingExam] = useState(null);
    const [newExam, setNewExam] = useState({ title: '', date: '', class: '', time: "", duration: "", marks: "", section: "", subject: "" });
    const [newCourse, setNewCourse] = useState({ title: '', dueDate: '', class: '', type: "", chapter: "", status: "Pending", content: "", points: "", section: "", subject: "" });
    const [toast, setToast] = useState(null);
    const [fileUpload, setFileUpload] = useState(null)
    const [selectedClass, setSelectedClass] = useState(null)
    const [openStudentListModal, setOpenStudentListModal] = useState(false)
    const [selectedExam, setSelectedExam] = useState(null)
    const [studentGrade, setStudentGrade] = useState({ id: "", type: "exam", typeId: "", marks: "" })
    const dispatch = useDispatch()

    useEffect(() => {
        if (!classes) {
            dispatch(getClassesRedux())
        }
        if (!exams) {
            dispatch(getExamsRedux())
        }
        if (!users) {
            dispatch(getUserRedux())
        }
        if (!courses) {
            dispatch(getCoursesRedux())
        }
    }, [dispatch])

    const materials = useMemo(() => {
        if (courseType === "exam" && exams) {
            return exams
        } else if (courseType === "Material" && courses) {
            return courses?.filter((cour) => cour.type === "Material")
        } else {
            return courses?.filter((cour) => cour.type === "Assignment")
        }
    }, [courseType, courses, exams])

    const classPerformance = [
        { name: 'Class 10', avgScore: 85, passRate: 92 },
        { name: 'Class 9', avgScore: 78, passRate: 88 },
        { name: 'Class 8', avgScore: 82, passRate: 90 },
        { name: 'Class 7', avgScore: 74, passRate: 85 },
        { name: 'Class 6', avgScore: 88, passRate: 95 },
    ];

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
    };

    const handleScheduleExam = async () => {
        let response;
        if (courseType == "exam") {

            response = await apiFunction(createExamApi, [], newExam, "post", true)
        } else {
            response = await apiFunction(createCourseApi, [], { ...newCourse, type: courseType }, "post", true)
        }
        if (response.success) {

            setNewExam({ title: '', date: '', class: '', time: "", duration: "", marks: "", section: "", subject: "" });
            setNewCourse({ title: '', dueDate: '', class: '', type: "", chapter: "", status: "Pending", content: "", points: "", section: "", subject: "" })
            setIsModalOpen(false);
            dispatch(getExamsRedux())
            dispatch(getCoursesRedux())
            showToast(response.message, "success")
        } else {
            showToast(response.message, "error")
        }

    };

    const handleEdit = (exam) => {
        setEditingExam(exam);
        if (courseType === "exam") {

            setNewExam(exam);
        } else {
            setNewCourse(exam)
        }
        setIsModalOpen(true);
    };

    const handleDeleteExam = async (id) => {
        let response
        if (courseType === "exam") {

            response = await apiFunction(deleteExamsApi, [id], {}, "delete", true);
        } else {
            response = await apiFunction(deleteCourseApi, [id], {}, "delete", true)
        }
        if (response.success) {

            setNewExam({ title: '', date: '', class: '', time: "", duration: "", marks: "", section: "", subject: "" });
            setNewCourse({ title: '', dueDate: '', class: '', type: "", chapter: "", status: "Pending", content: "", points: "", section: "", subject: "" })
            setIsModalOpen(false);
            dispatch(getExamsRedux())
            dispatch(getCoursesRedux())
            showToast(response.message, "success")
        } else {
            showToast(response.message, "error")
        }
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingExam(null);
        setNewExam({ title: '', date: '', class: '', time: "", duration: "", marks: "", section: "", subject: "" });
    };

    const handleUpdateExam = async () => {
        let response
        if (courseType === "exam") {

            const { id, createdAt, ...examData } = newExam;
            response = await apiFunction(updateExamApi, [id], examData, "put", true);
        } else {
            const { id, createdAt, ...examData } = newCourse;
            response = await apiFunction(updateCourseApi, [id], examData, "put", true);
        }
        if (response.success) {
            setNewCourse({ title: '', dueDate: '', class: '', type: "", chapter: "", status: "Pending", content: "", points: "", section: "", subject: "" })
            setNewExam({ title: '', date: '', class: '', time: "", duration: "", marks: "", section: "", subject: "" });
            setIsModalOpen(false);
            dispatch(getExamsRedux())
            dispatch(getCoursesRedux())
            showToast(response.message, "success")
        } else {
            showToast(response.message, "error")
        }
    }

    const UpdateMarks = async () => {

        const response = await apiFunction(updateMarksApi, [], studentGrade, "put", true)
        if (response.success) {

            setNewExam({ id: "", type: "exam", typeId: "", marks: "" });

            dispatch(getUserRedux())
            showToast(response.message, "success")
        } else {
            showToast(response.message, "error")
        }
    }

    const handleFileUpload = async () => {

        if (!fileUpload) return;

        const fileName = `${Date.now()}-${fileUpload.name}`;

        const { data, error } = await supabase.storage
            .from("school")
            .upload(fileName, fileUpload);



        if (error) {
            console.log(error);
            return;
        }

        const { data: publicUrl } = supabase.storage
            .from("school")
            .getPublicUrl(fileName);

        console.log(publicUrl.publicUrl)


        setNewCourse({ ...newCourse, content: [...newCourse.content, publicUrl.publicUrl] })
    }



    return (
        <div className="space-y-6">
            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">

                {/* Left Section */}
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-transparent">
                        Academic Oversight
                    </h1>
                    <p className="text-slate-500 text-sm mt-1">
                        Monitor course performance and schedules
                    </p>
                </div>

                {/* Course Type Switcher */}
                <div className="flex items-center p-1.5 rounded-xl bg-slate-100 shadow-inner">

                    {coursesTypes?.map((course) => (
                        <button
                            key={course}
                            onClick={() => setCourseType(course)}
                            className={`relative px-5 py-2 text-sm font-medium rounded-lg transition-all duration-300
          
          ${course === courseType
                                    ? "bg-white text-blue-600 shadow-md"
                                    : "text-slate-600 hover:text-slate-900 hover:bg-white/70"
                                }
        `}
                        >
                            {course}
                        </button>
                    ))}

                </div>
            </div>


            <div className="grid grid-cols-1 gap-6">
                {/* Recent Exams List */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                    <div className='w-full justify-between flex flex-row items-center mb-4'>

                        <h3 className="text-lg font-bold text-slate-900"> {courseType} List</h3>
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors flex items-center gap-2 shadow-sm"
                        >
                            <Calendar size={16} /> Schedule {courseType}
                        </button>
                    </div>
                    <div className="space-y-4">
                        {materials?.map((exam) => (
                            <div
                                key={exam.id}
                                onClick={() => {
                                    const selected = classes?.find(
                                        (clas) =>
                                            clas.className === exam.class &&
                                            clas.section === exam.section
                                    );


                                    setSelectedClass(selected || null);
                                    setSelectedExam(exam)
                                    setOpenStudentListModal(true);
                                }}
                                className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200 hover:border-blue-200 transition-colors group cursor-pointer"
                            >

                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-white rounded-lg text-blue-600 shadow-sm border border-slate-100">
                                        <BookOpen size={20} />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-slate-800">{exam.title}</h4>
                                        <p className="text-xs text-slate-500">Class: {exam.class}- {exam.section?.toUpperCase()} • {courseType === "exam" ? `Date: ${exam.date}` : `Due-Date: ${exam.dueDate}`}</p>
                                        <p className="text-xs text-slate-500">Subject: {exam.subject} {courseType !== "exam" && `Chapter: ${exam.chapter}`}</p>
                                        {courseType !== "exam" &&
                                            exam.content?.map((fileUrl, index) => {
                                                const fileName = decodeURIComponent(fileUrl.split("/").pop());

                                                return (
                                                    <a
                                                        key={index}
                                                        href={fileUrl}
                                                        target="_blank"
                                                        onClick={(e) => e.stopPropagation()}
                                                        rel="noopener noreferrer"
                                                        className="flex items-center mt-2 justify-between bg-white border border-slate-200 hover:border-blue-500 hover:shadow-md transition rounded-xl px-4 py-3 group"
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            {/* PDF Icon */}
                                                            <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-red-100 text-red-600 font-semibold">
                                                                PDF
                                                            </div>

                                                            <div className="flex flex-col">
                                                                <span className="text-sm font-medium text-slate-800 group-hover:text-blue-600 transition">
                                                                    {fileName}
                                                                </span>
                                                                <span className="text-xs text-slate-500">
                                                                    Click to preview
                                                                </span>
                                                            </div>
                                                        </div>


                                                    </a>
                                                );
                                            })}

                                    </div>

                                </div>


                                <div className="flex items-center gap-3">
                                    <div className='rounded-full px-4 py-1 bg-white/50 border border-gray-400'>
                                        {courseType === "exam" ? `Marks: ${exam.marks}` : `Points: ${exam.points}`}
                                    </div>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            handleEdit(exam)
                                        }}
                                        className="text-slate-400 hover:text-blue-600 p-1.5 hover:bg-blue-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                        title="Edit"
                                    >
                                        <Edit size={16} />
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            handleDeleteExam(exam.id)
                                        }}
                                        className="text-slate-400 hover:text-rose-600 p-1.5 hover:bg-rose-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                        title="Delete"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>


            </div>

            {/* Performance Overview Chart */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <h3 className="text-lg font-bold text-slate-900 mb-6">Class-wise Performance (Avg Score)</h3>
                <div className="h-80 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={classPerformance}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                            <Tooltip
                                cursor={{ fill: '#f1f5f9' }}
                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                            />
                            <Bar dataKey="avgScore" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={40} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>



            {/* Schedule/Edit Exam Modal */}
            {isModalOpen && (
                <div
                    className="fixed inset-0 bg-black/50 backdrop-blur-md flex items-center justify-center z-50 px-4"
                    onClick={() => setIsModalOpen(false)}
                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        className="relative w-full max-w-lg bg-white rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.15)] animate-in fade-in zoom-in-95 duration-200 overflow-hidden"
                    >
                        {/* Gradient Header */}
                        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6">
                            <h3 className="text-xl font-semibold text-white">
                                {editingExam
                                    ? `Edit ${courseType?.toUpperCase()}`
                                    : `Schedule New ${courseType?.toUpperCase()}`}
                            </h3>
                            <p className="text-blue-100 text-sm mt-1">
                                Fill in the details below to continue
                            </p>
                        </div>

                        <div className="p-8 space-y-6 max-h-[75vh] overflow-y-auto">

                            {/* Title */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-600">
                                    {courseType?.toUpperCase()} TITLE
                                </label>
                                <input
                                    type="text"
                                    placeholder="e.g. Mid-Term Physics"
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition"
                                    value={courseType === "exam" ? newExam.title : newCourse.title}
                                    onChange={(e) =>
                                        courseType === "exam"
                                            ? setNewExam({ ...newExam, title: e.target.value })
                                            : setNewCourse({ ...newCourse, title: e.target.value })
                                    }
                                />
                            </div>

                            {/* Date & Time / Chapter */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-600">
                                        {courseType === "exam" ? "Date" : "Due Date"}
                                    </label>
                                    <input
                                        type="date"
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition"
                                        value={courseType === "exam" ? newExam.date : newCourse.dueDate}
                                        onChange={(e) =>
                                            courseType === "exam"
                                                ? setNewExam({ ...newExam, date: e.target.value })
                                                : setNewCourse({ ...newCourse, dueDate: e.target.value })
                                        }
                                    />
                                </div>

                                {courseType === "exam" ? (
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-600">
                                            Time
                                        </label>
                                        <input
                                            type="time"
                                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition"
                                            value={newExam.time}
                                            onChange={(e) =>
                                                setNewExam({ ...newExam, time: e.target.value })
                                            }
                                        />
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-600">
                                            Chapter
                                        </label>
                                        <input
                                            type="text"
                                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition"
                                            value={newCourse.chapter}
                                            onChange={(e) =>
                                                setNewCourse({ ...newCourse, chapter: e.target.value })
                                            }
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Duration / File Upload + Marks */}
                            <div className="grid grid-cols-2 gap-4">
                                {courseType === "exam" ? (
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-600">
                                            Duration (mins)
                                        </label>
                                        <input
                                            type="number"
                                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition"
                                            value={newExam.duration}
                                            onChange={(e) =>
                                                setNewExam({ ...newExam, duration: Number(e.target.value) })
                                            }
                                        />
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-600">
                                            Content Upload (max size: 50 MB)
                                        </label>

                                        <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-300 rounded-xl p-5 text-slate-500 cursor-pointer hover:border-blue-500 hover:text-blue-600 transition">
                                            <span className="text-sm font-medium">
                                                Click to upload PDF / DOC
                                            </span>
                                            <input
                                                type="file"
                                                accept=".pdf,.doc,.docx"
                                                className="hidden"
                                                onChange={(e) => setFileUpload(e.target.files[0])}
                                            />
                                        </label>

                                        {fileUpload && (
                                            <button
                                                onClick={handleFileUpload}
                                                className="text-sm text-blue-600 font-medium hover:underline"
                                            >
                                                {newCourse.content ? "Uploaded" : "Upload Selected File"}
                                            </button>
                                        )}
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-600">
                                        {courseType === "exam" ? "Marks" : "Points"}
                                    </label>
                                    <input
                                        type="number"
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition"
                                        value={courseType === "exam" ? newExam.marks : newCourse.points}
                                        onChange={(e) =>
                                            courseType === "exam"
                                                ? setNewExam({ ...newExam, marks: Number(e.target.value) })
                                                : setNewCourse({ ...newCourse, points: Number(e.target.value) })
                                        }
                                    />
                                </div>
                            </div>

                            {/* Class & Subject remains same as yours — just apply same rounded-xl + focus styles */}
                            <div>
                                <label className="block text-sm font-medium text-slate-600 mb-1">
                                    Class & Section
                                </label>
                                <select
                                    className="w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={courseType == "exam" ? `${newExam.class}-${newExam.section}` : `${newCourse.class}-${newCourse.section}`}
                                    onChange={(e) => {
                                        const selected = classes.find((cls) => `${cls.className}-${cls.section}` === e.target.value);
                                        setSelectedClass(selected);
                                        console.log(e.target.value)
                                        courseType === "exam" ?
                                            setNewExam({ ...newExam, class: selected?.className || "", section: selected?.section || "", subject: "" })
                                            : setNewCourse({ ...newCourse, class: selected?.className || "", section: selected?.section || "", subject: "" })
                                    }} >
                                    <option value="">Select Class-Section</option>
                                    {classes?.map((cls, ind) => (
                                        <option key={ind} value={`${cls.className}-${cls.section}`} >
                                            {cls.className}-{cls.section}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            {/* Subject */}
                            {selectedClass && (
                                <div>
                                    <label className="block text-sm font-medium text-slate-600 mb-1">
                                        Subject
                                    </label>
                                    <select
                                        className="w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                        value={courseType === "exam" ? newExam.subject : newCourse.subject}
                                        onChange={(e) => {
                                            if (courseType === "exam") {
                                                setNewExam({ ...newExam, subject: e.target.value })
                                            } else {
                                                setNewCourse({ ...newCourse, subject: e.target.value })
                                            }
                                        }} >
                                        <option value="">Select Subject</option>
                                        {selectedClass?.teachersSubject?.map((sub, ind) => (
                                            <option key={ind} value={sub.subject}> {sub.subject} </option>
                                        ))}
                                    </select>
                                </div>
                            )}


                        </div>

                        <div className="flex justify-between items-center px-8 py-5 bg-slate-50 border-t">
                            <button
                                onClick={handleCloseModal}
                                className="text-slate-600 font-medium hover:text-slate-900 transition"
                            >
                                Cancel
                            </button>

                            <button
                                onClick={editingExam ? handleUpdateExam : handleScheduleExam}
                                className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition disabled:opacity-50"
                            >
                                {editingExam ? `Update ${courseType}` : "Schedule"}
                            </button>
                        </div>
                    </div>



                </div >

            )
            }


            {
                openStudentListModal && (
                    <div
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
                        onClick={() => {
                            setOpenStudentListModal(false);
                            setSelectedClass(null);
                        }}
                    >
                        <div
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white w-[95%] sm:w-[650px] md:w-[800px] max-h-[85vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200"
                        >
                            {/* HEADER */}
                            <div className="flex items-center justify-between px-8 py-5 border-b border-slate-200">
                                <h2 className="text-xl font-semibold text-slate-800">
                                    {selectedClass?.className} - {selectedClass?.section} Students
                                </h2>

                                <button
                                    onClick={() => {
                                        setOpenStudentListModal(false);
                                        setSelectedClass(null);
                                    }}
                                    className="text-slate-400 hover:text-red-500 transition text-lg"
                                >
                                    ✕
                                </button>
                            </div>

                            {/* CONTENT */}
                            <div className="p-8 overflow-y-auto">
                                {!selectedClass?.student?.length && (
                                    <div className="text-center text-slate-400 py-12">
                                        No students enrolled in this class.
                                    </div>
                                )}

                                <div className="grid grid-cols-2  gap-6">
                                    {selectedClass?.student?.map((stuId) => {
                                        const student = users?.find((user) => user.id == stuId);

                                        if (!student) return null;

                                        // ✅ Find submitted solution for this student
                                        const submittedSolution =
                                            courseType !== "exam"
                                                ? selectedExam?.solution?.find(
                                                    (sol) => sol.studentId == stuId
                                                )
                                                : null;

                                        const fileUrl = submittedSolution?.content;
                                        const fileName = submittedSolution?.content
                                            ? decodeURIComponent(
                                                submittedSolution.content.split("/").pop()
                                            )
                                            : null;

                                        // ✅ Find marks
                                        const marksObtained = student?.grade?.find(
                                            (grad) =>
                                                grad.typeId === selectedExam?.id &&
                                                grad.type === courseType
                                        );

                                        return (
                                            <div
                                                key={stuId}
                                                className="bg-slate-50 border border-slate-200 rounded-2xl w-full p-5 flex flex-col items-center hover:shadow-xl hover:bg-white transition-all duration-300"
                                            >
                                                {/* Avatar */}
                                                <div className="w-14 h-14 rounded-full bg-blue-600 text-white flex items-center justify-center text-lg font-semibold">
                                                    {student?.name?.charAt(0) || "?"}
                                                </div>

                                                {/* Name */}
                                                <p className="mt-4 text-sm font-medium text-slate-800 text-center">
                                                    {student?.name}
                                                </p>

                                                {/* ✅ Submitted File Section */}
                                                {submittedSolution && (
                                                    <a
                                                        href={fileUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        onClick={(e) => e.stopPropagation()}
                                                        className="group relative mt-4 w-full flex items-center justify-between rounded-2xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 px-5 py-4 shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 hover:border-blue-500"
                                                    >
                                                        {/* Left Section */}
                                                        <div className="flex items-center gap-4 min-w-0">

                                                            {/* Icon */}
                                                            <div className="flex h-12 w-20 items-center justify-center rounded-xl P-2 bg-gradient-to-br from-red-500 to-red-600 text-white shadow-md group-hover:scale-105 transition-transform duration-300">
                                                                <span className="text-sm font-bold tracking-wide">PDF</span>
                                                            </div>

                                                            {/* File Info */}
                                                            <div className="flex flex-col min-w-0">
                                                                <span className="text-sm font-semibold text-slate-800 truncate">
                                                                    {fileName}
                                                                </span>
                                                                <span className="text-xs text-slate-500">
                                                                    Submitted Assignment
                                                                </span>
                                                            </div>
                                                        </div>

                                                        {/* Right Action */}
                                                        <div className="flex items-center gap-2 text-blue-600 text-sm font-medium opacity-80 group-hover:opacity-100 transition">
                                                            Preview
                                                            <svg
                                                                xmlns="http://www.w3.org/2000/svg"
                                                                className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
                                                                fill="none"
                                                                viewBox="0 0 24 24"
                                                                stroke="currentColor"
                                                                strokeWidth={2}
                                                            >
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                                                            </svg>
                                                        </div>

                                                        {/* Subtle Hover Glow */}
                                                        <div className="absolute inset-0 rounded-2xl bg-blue-500/5 opacity-0 group-hover:opacity-100 transition pointer-events-none" />
                                                    </a>

                                                )}

                                                {/* MARKS SECTION */}
                                                <div className="mt-4 w-full">
                                                    {marksObtained ? (
                                                        <div className="flex flex-col gap-2 w-full">
                                                            <input
                                                                type="number"
                                                                value={
                                                                    studentGrade?.id === student?.id
                                                                        ? studentGrade?.marks
                                                                        : marksObtained?.marks || ""
                                                                }
                                                                onChange={(e) => {
                                                                    const value = Number(e.target.value);
                                                                    const totalMarks =
                                                                        selectedExam?.points ?? selectedExam?.marks ?? 0;

                                                                    if (value <= totalMarks) {
                                                                        setStudentGrade({
                                                                            id: student?.id,
                                                                            type: courseType,
                                                                            typeId: selectedExam?.id,
                                                                            marks: value,
                                                                        });
                                                                    } else {
                                                                        alert("Marks cannot be greater than total marks");
                                                                    }
                                                                }}
                                                                className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                                            />
                                                            <button
                                                                onClick={UpdateMarks}
                                                                className="bg-blue-600 text-white text-xs py-1.5 rounded-lg hover:bg-blue-700 transition"
                                                            >
                                                                Update
                                                            </button>
                                                        </div>
                                                    ) : studentGrade?.id === student?.id ? (
                                                        <div className="flex flex-col gap-2 w-full">
                                                            <input
                                                                placeholder="Enter marks..."
                                                                type="number"
                                                                onChange={(e) =>
                                                                    setStudentGrade({
                                                                        ...studentGrade,
                                                                        marks: Number(e.target.value),
                                                                    })
                                                                }
                                                                className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                                            />
                                                            <button
                                                                onClick={UpdateMarks}
                                                                className="bg-green-600 text-white text-xs py-1.5 rounded-lg hover:bg-green-700 transition"
                                                            >
                                                                Submit
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <button
                                                            onClick={() =>
                                                                setStudentGrade({
                                                                    id: student?.id,
                                                                    type: courseType,
                                                                    typeId: selectedExam?.id,
                                                                })
                                                            }
                                                            className="border-2 mt-3 border-dashed border-slate-300 rounded-xl p-4 flex flex-col items-center justify-center text-slate-400 hover:border-blue-500 hover:text-blue-600 transition-all w-full"
                                                        >
                                                            <Plus size={22} />
                                                            <span className="text-xs font-medium mt-1">
                                                                Add Marks
                                                            </span>
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }



        </div >
    );
};

export default Exams;
