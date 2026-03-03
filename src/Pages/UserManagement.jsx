import React, { useEffect, useMemo, useState } from 'react';
import { Search, Plus, Edit, Trash2, Calendar } from 'lucide-react';
import Toast from '../Components/Toast';
import { apiFunction } from '../../api/apiFunction';
import { createBulkUserApi, createUserApi, deleteUserApi, updateUserApi } from '../../api/apis';
import { useDispatch, useSelector } from "react-redux"
import { getClassesRedux, getUserRedux } from '../../redux/getData';
import { useNavigate, useParams } from 'react-router';
import Papa from "papaparse"
import { supabase } from '../../lib/supabase';


const tableType = { "principal": "Role", "teacher": "Class", "student": "Parent", "parent": "student", "public": "applications" }
const days = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday"]

const UserManagement = () => {

    const dispatch = useDispatch();
    const { users, classes } = useSelector((state) => state.getData)
    const [searchQuery, setSearchQuery] = useState('');
    const [searchStudentQuery, setSearchStudentQuery] = useState('');
    const [teacherTableOpen, setTeachettableOpen] = useState(null)
    const { type } = useParams()
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [csvData, setCsvData] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [openCSVModal, setCSVModal] = useState(false)
    const [newUser, setNewUser] = useState({ name: '', email: '', password: "", phone: "", type: "principal", address: "", links: { fb: "", insta: "", linkdIn: "", twitter: "" }, documents: { aadhar: "", pan: "" }, connections: [] });


    useEffect(() => {

        if (dispatch) {
            if (!users) {

                dispatch(getUserRedux())
            }
            if (!classes) {
                dispatch(getClassesRedux())
            }
        }
    }, [dispatch])

    const usersType = useMemo(() => {
        if (users) {
            return users?.filter((user) => user.type === type)
        }
    }, [users])

    const handleCSVUpload = (e) => {
        const file = e.target.files[0];

        if (!file) return;

        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: function (results) {
                setCsvData(results.data);
            },
        });
    };

    const handleBulkCreate = async () => {
        if (!csvData.length) return;

        setUploading(true);

        const response = await apiFunction(
            createBulkUserApi,
            [],
            csvData,
            "post",
            true
        );

        if (response.success) {
            showToast(response.message, "success")
            dispatch(getUserRedux())
            setCSVModal(false)
            setCsvData([]);
        } else {
            showToast(response.message, "error")
        }

        setUploading(false);
    };



    const teachers = useMemo(() => {
        if (users) {
            return users.filter((user) => user.type === "teacher")
        }
    }, [users])

    const parents = useMemo(() => {
        if (users) {
            return users.filter((user) => user.type === "parent")
        }
    }, [users])

    const students = useMemo(() => {
        if (users) {
            return users.filter((user) => user.type === "student")
        }
    }, [users])



    const filteredUser = usersType?.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const filteredConnection = (type === "student"? parents: students)?.filter(p =>
        p.name.toLowerCase().includes(searchStudentQuery.toLowerCase())
    );






    const handleAdd = async () => {
        const response = await apiFunction(createUserApi, [], newUser, "post", false);
        if (response.success) {

            setIsModalOpen(false);
            setEditingUser(null);
            dispatch(getUserRedux())
            showToast(response.message, "success")
        } else {
            showToast(response.message, "error")
        }

    };

    const openEditModal = (id) => {
        const selected = usersType.filter((user) => user.id === id)
        setNewUser({ ...selected[0], password: "" })
        setIsModalOpen(true)
        setEditingUser(true)
    }

    const handleEdit = async () => {
        const response = await apiFunction(updateUserApi, [], newUser, "put", true);
        if (response.success) {

            setIsModalOpen(false);
            setEditingUser(null);
            showToast(response.message, "success")
            dispatch(getUserRedux())
        } else {
            showToast(response.message, "error")
        }
    };


    const [toast, setToast] = useState(null);


    const showToast = (message, type = 'success') => setToast({ message, type });

    const getUserName = (userId) => {
        const user = users?.filter((user) => user.id == userId)
        if (user.length > 0) {

            return user[0]?.name
        }
    }

    const getClassName = (classID) => {

        const classe = classes?.filter((classs) => classs.id == classID)

        if (classe?.length > 0) {

            return `${classe[0]?.className}- ${classe[0]?.section?.toUpperCase()}`
        }
    }

    const deleteUser = async (id) => {
        const res = confirm("Are you sure");
        if (res) {
            const response = await apiFunction(deleteUserApi, [id], {}, "delete", true)
            if (response.success) {

                showToast(response.message, "success")
                dispatch(getUserRedux())
            } else {
                showToast(response.message, "error")
            }
        }
    }

    const handleFileUpload = async (fileUpload) => {

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




        return publicUrl.publicUrl
    }


    return (
        <div className="space-y-6">
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

            <div className='flex flex-row justify-between items-center'>

                <div className="flex flex-col gap-2">
                    <h1 className="text-2xl font-bold text-slate-900">
                        {type.toUpperCase()} Management

                    </h1>
                    <p className="text-slate-600 text-sm">
                        'Manage {type} accounts

                    </p>
                </div>

                <button onClick={() => setCSVModal(true)} className='bg-green-600 px-4 py-2 font-bold rounded-lg text-white'>Upload CSV</button>
            </div>




            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-4 border-b border-slate-200 flex justify-between items-center">
                    <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-lg text-slate-600 border border-slate-200 w-96">
                        <Search className="text-slate-500" size={18} />
                        <input type="text" onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search principals..." className="bg-transparent border-none outline-none text-sm w-full text-slate-900 placeholder-slate-4001" />
                    </div>
                    <div className='flex flex-row gap-4 justify-center items-center'>


                        <button onClick={() => {
                            setIsModalOpen(true);
                            setEditingUser(false)
                            setNewUser({ name: '', email: '', password: "", phone: "", type: type, address: "", links: { fb: "", insta: "", linkdIn: "", twitter: "" }, documents: { aadhar: "", pan: "" }, connections: [] })
                        }} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-medium flex items-center gap-2 shadow-sm">
                            <Plus size={20} /> Add {type}
                        </button>
                    </div>
                </div>
                <table className="w-full text-left text-sm text-slate-700">
                    <thead className="bg-slate-50 text-slate-800 uppercase font-semibold text-xs">
                        <tr>
                            <th className="px-6 py-4">Name</th>
                            <th className="px-6 py-4">{tableType[type]}</th>
                            <th className="px-6 py-4">Contact</th>
                            <th className="px-6 py-4">Attendance</th>
                            <th className="px-6 py-4 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {filteredUser?.map(p => (
                            <tr key={p.id} className="hover:bg-slate-50">
                                <td className="px-6 py-4 font-medium text-slate-900">{p.name}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded  text-xs font-medium bg-purple-100 text-purple-700`}>
                                        {type === "principal" && type}
                                        {type === "teacher" && (p.classes?.length > 0 ?
                                            p.classes?.map((cls, ind) => (
                                                getClassName(cls)
                                            ))
                                            : "No Assigned Class"
                                        )}
                                        {(type === "parent" || type === "student") && (p.connections?.length > 0 ?
                                            p.connections?.map((cls, ind) => (
                                                getUserName(cls)
                                            ))
                                            : "No Assigned Connections"
                                        )}
                                    </span>
                                </td>
                                <td className="px-6 py-4">{p.email}</td>
                                <td className="px-6 py-4 text-emerald-600 font-medium">Active</td>
                                <td className="px-6 py-4 text-center flex justify-center gap-2">
                                    {type === "teacher" &&
                                        <button onClick={() => setTeachettableOpen(p)}>
                                            <Calendar size={25} color='grey' />
                                        </button>}
                                    <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg" onClick={() => openEditModal(p.id)}><Edit size={16} /></button>
                                    <button className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg" onClick={() => deleteUser(p.id)}><Trash2 size={16} /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

            </div>

            {type === "principal" &&
                <div className="bg-white rounded-2xl shadow-sm mt-4 border border-slate-200 overflow-hidden">
                    <table className="w-full text-left text-sm text-slate-700">
                        <thead className="bg-slate-50 text-slate-800 uppercase font-semibold text-xs">
                            <tr>
                                <th className="px-6 py-4">Teacher</th>
                                <th className="px-6 py-4">Subject</th>

                                <th className="px-6 py-4">Student Pass Rate</th>
                                <th className="px-6 py-4">Attendance</th>
                                <th className="px-6 py-4">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {teachers?.map((t, i) => (
                                <tr key={i} className="hover:bg-slate-50">
                                    <td className="px-6 py-4 font-medium text-slate-900">{t.name}</td>
                                    <td className="px-6 py-4">
                                        <span>
                                            {t.classes?.map((clas, ind) => (
                                                getClassName(clas)
                                            ))}
                                        </span>
                                    </td>

                                    <td className="px-6 py-4">
                                        <div className="bg-slate-100 rounded-full h-2 w-24">
                                            <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${t.passRate}%` }}></div>
                                        </div>
                                        <span className="text-xs text-slate-500 mt-1 block">{t.passRate}%</span>
                                    </td>
                                    <td className="px-6 py-4">{t.attendance}%</td>
                                    <td className="px-6 py-4">
                                        <span className="bg-emerald-50 text-emerald-700 px-2 py-1 rounded text-xs font-medium">Excellent</span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>}



            {isModalOpen && (
                <div onClick={() => setIsModalOpen(false)} className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    {/* Modal Card */}
                    <div
                        onClick={(e) => e.stopPropagation()}
                        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 sm:p-8"
                    >
                        {/* Header */}
                        <div className="mb-6">
                            <h2 className="text-2xl font-bold text-slate-800">
                                {editingUser ? "Edit Account" : "Create Account"}
                            </h2>
                            <p className="text-sm text-slate-500">
                                Fill the details below to {editingUser ? "update" : "create"} the account.
                            </p>
                        </div>

                        <div className="space-y-6">

                            {/* Basic Info */}
                            <div className="grid sm:grid-cols-2 gap-4">
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-medium text-slate-600">Name</label>
                                    <input
                                        className="input-style"
                                        placeholder="Enter Name..."
                                        value={newUser.name}
                                        onChange={e => setNewUser({ ...newUser, name: e.target.value })}
                                    />
                                </div>

                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-medium text-slate-600">Password</label>
                                    <input
                                        type="password"
                                        className="input-style"
                                        placeholder="Enter Password..."
                                        value={newUser.password}
                                        onChange={e => setNewUser({ ...newUser, password: e.target.value })}
                                    />
                                </div>

                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-medium text-slate-600">Email</label>
                                    <input
                                        className="input-style"
                                        placeholder="Enter Email..."
                                        value={newUser.email}
                                        onChange={e => setNewUser({ ...newUser, email: e.target.value })}
                                    />
                                </div>

                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-medium text-slate-600">Phone</label>
                                    <input
                                        type="tel"
                                        className="input-style"
                                        placeholder="Enter Phone..."
                                        value={newUser.phone}
                                        onChange={e => setNewUser({ ...newUser, phone: e.target.value })}
                                    />
                                </div>
                            </div>

                            {/* connections */}
                            {(type === "parent" || type === "student") &&
                                <div className="flex flex-col gap-3 relative">
                                    <label className="text-sm font-semibold text-slate-700">
                                        {type === "student" ? "Parent" : "Children"}
                                    </label>

                                    {/* Selected Children */}
                                    <div className="flex flex-wrap gap-2">
                                        {newUser.connections?.map((childId) => (
                                            <div
                                                key={childId}
                                                className="flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm shadow-sm"
                                            >
                                                <span>{getUserName(childId)}</span>

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setNewUser({
                                                            ...newUser,
                                                            connections: newUser.connections.filter(
                                                                (id) => id !== childId
                                                            ),
                                                        })
                                                    }
                                                    className="text-xs text-red-500 hover:text-red-700"
                                                >
                                                    ✕
                                                </button>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Search Input */}
                                    <input
                                        className="w-full p-2.5 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                                        placeholder="Search children..."
                                        value={searchStudentQuery}
                                        onChange={(e) => setSearchStudentQuery(e.target.value)}
                                    />

                                    {/* Dropdown Results */}
                                    {searchStudentQuery && filteredConnection.length > 0 && (
                                        <div className="absolute top-full mt-1 w-full bg-white border border-slate-200 rounded-xl shadow-lg max-h-48 overflow-y-auto z-20">
                                            {filteredConnection?.map((student) => {
                                                const alreadySelected = newUser.connections?.includes(student.id);

                                                return (
                                                    <div
                                                        key={student.id}
                                                        onClick={() => {
                                                            if (alreadySelected) return;

                                                            setNewUser({
                                                                ...newUser,
                                                                connections: [
                                                                    ...(newUser.connections || []),
                                                                    student.id,
                                                                ],
                                                            });

                                                            setSearchStudentQuery("");
                                                        }}
                                                        className={`flex justify-between items-center px-4 py-2 cursor-pointer transition 
              ${alreadySelected
                                                                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                                                : "hover:bg-blue-50"
                                                            }`}
                                                    >
                                                        <span className="font-medium text-slate-700">
                                                            {student.name}
                                                        </span>

                                                        <span className="text-xs text-slate-500">
                                                            {student.connections?.length > 0
                                                                ? getUserName(student.connections[0])
                                                                : (type === "parent" ? "No Parent": "No Children")}
                                                        </span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>}

                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-medium text-slate-600">Address</label>
                                <input
                                    className="input-style"
                                    placeholder="Enter Address..."
                                    value={newUser.address}
                                    onChange={e => setNewUser({ ...newUser, address: e.target.value })}
                                />
                            </div>

                            {/* Social Links */}
                            <div>
                                <h3 className="text-lg font-semibold text-slate-700 mb-3">Social Links</h3>
                                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                    {[
                                        { label: "Facebook", key: "fb" },
                                        { label: "Instagram", key: "insta" },
                                        { label: "LinkedIn", key: "linkdIn" },
                                        { label: "Twitter", key: "twitter" },
                                    ].map((item) => (
                                        <div key={item.key} className="flex flex-col gap-2">
                                            <label className="text-sm text-slate-600">{item.label}</label>
                                            <input
                                                className="input-style"
                                                placeholder={`Enter ${item.label} link...`}
                                                value={newUser.links?.[item.key] || ""}
                                                onChange={e =>
                                                    setNewUser({
                                                        ...newUser,
                                                        links: { ...newUser.links, [item.key]: e.target.value }
                                                    })
                                                }
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Documents */}
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                                <h3 className="text-lg font-semibold text-slate-800 mb-4">
                                    Documents
                                </h3>

                                <div className="grid sm:grid-cols-2 gap-6">

                                    {/* Aadhar */}
                                    <div className="flex flex-col gap-3 p-4 rounded-xl border border-slate-200 bg-slate-50">
                                        <label className="text-sm font-medium text-slate-700">
                                            Aadhar Card
                                        </label>

                                        <input
                                            type="file"
                                            className="file-style"
                                            onChange={(e) =>
                                                setNewUser({
                                                    ...newUser,
                                                    documents: {
                                                        ...newUser.documents,
                                                        aadhar: e.target.files[0], // store file only
                                                    },
                                                })
                                            }
                                        />

                                        {newUser?.documents?.aadhar && (
                                            <div className="flex justify-between items-center text-sm text-slate-600">
                                                <span className="truncate max-w-[150px]">
                                                    {newUser.documents.aadhar.name}
                                                </span>

                                                <button
                                                    type="button"
                                                    className="px-3 py-1 text-xs bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                                                    onClick={async () => {
                                                        const uploadedUrl = await handleFileUpload(
                                                            newUser.documents.aadhar
                                                        );

                                                        setNewUser({
                                                            ...newUser,
                                                            documents: {
                                                                ...newUser.documents,
                                                                aadhar: uploadedUrl,
                                                            },
                                                        });
                                                    }}
                                                >
                                                    Upload
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    {/* PAN */}
                                    <div className="flex flex-col gap-3 p-4 rounded-xl border border-slate-200 bg-slate-50">
                                        <label className="text-sm font-medium text-slate-700">
                                            Pan Card
                                        </label>

                                        <input
                                            type="file"
                                            className="file-style"
                                            onChange={(e) =>
                                                setNewUser({
                                                    ...newUser,
                                                    documents: {
                                                        ...newUser.documents,
                                                        pan: e.target.files[0], // store file only
                                                    },
                                                })
                                            }
                                        />

                                        {newUser?.documents?.pan && (
                                            <div className="flex justify-between items-center text-sm text-slate-600">
                                                <span className="truncate max-w-[150px]">
                                                    {newUser.documents.pan.name}
                                                </span>

                                                <button
                                                    type="button"
                                                    className="px-3 py-1 text-xs bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                                                    onClick={async () => {
                                                        const uploadedUrl = await handleFileUpload(
                                                            newUser.documents.pan
                                                        );

                                                        setNewUser({
                                                            ...newUser,
                                                            documents: {
                                                                ...newUser.documents,
                                                                pan: uploadedUrl,
                                                            },
                                                        });
                                                    }}
                                                >
                                                    Upload
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                </div>
                            </div>


                            {/* Buttons */}
                            <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4">
                                <button
                                    onClick={() => {
                                        setIsModalOpen(false);
                                        setEditingUser(null);
                                    }}
                                    className="px-5 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-100 transition font-medium"
                                >
                                    Cancel
                                </button>

                                <button
                                    onClick={editingUser ? handleEdit : handleAdd}
                                    className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-md transition"
                                >
                                    {editingUser ? "Update Account" : "Create Account"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

            )}

            {teacherTableOpen && (
                <div onClick={() => setTeachettableOpen(false)} className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    {/* Modal Card */}
                    <div
                        onClick={(e) => e.stopPropagation()}
                        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 sm:p-8"
                    >

                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="font-bold text-slate-900 text-lg">{teacherTableOpen.name}</h3>
                                {/* <p className="text-sm text-slate-500">{teacher.subject}</p> */}
                            </div>
                            <span className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-full font-medium">Weekly Schedule</span>
                        </div>
                        <div className="space-y-3">
                            {days?.map((day, ind) => (

                                <div key={ind} className="flex justify-between text-sm py-2 border-b border-slate-50">
                                    <span className="w-20 font-medium text-slate-600">{day}</span>
                                    {teacherTableOpen?.classTime?.map((teacher, ind) => (

                                        teacher.day === day &&
                                        <div key={ind} className="flex gap-2">
                                            <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded">{teacher?.time}{`(${getClassName(teacher?.classId)})`}</span>

                                        </div>
                                    ))}
                                </div>
                            ))}

                        </div>
                    </div>

                </div>
            )}

            {openCSVModal && (
                <div onClick={() => setCSVModal(false)} className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    {/* Modal Card */}
                    <div
                        onClick={(e) => e.stopPropagation()}
                        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 sm:p-8"
                    >
                        <div className="bg-white border rounded-2xl p-6 shadow-sm space-y-4">
                            <h2 className="text-lg font-semibold text-slate-700">
                                Bulk Upload Users
                            </h2>

                            <input
                                type="file"
                                accept=".csv"
                                onChange={handleCSVUpload}
                                className="block w-full text-sm text-slate-500
                   file:mr-4 file:py-2 file:px-4
                   file:rounded-lg file:border-0
                   file:text-sm file:font-semibold
                   file:bg-blue-50 file:text-blue-700
                   hover:file:bg-blue-100"
                            />

                            {csvData.length > 0 && (
                                <>
                                    <div className="max-h-40 overflow-y-auto border rounded-lg p-3 text-sm bg-slate-50">
                                        {csvData.slice(0, 5).map((user, index) => (
                                            <p key={index}>
                                                {user.name} — {user.email} — {user.type}
                                            </p>
                                        ))}
                                        {csvData.length > 5 && (
                                            <p className="text-slate-400">
                                                + {csvData.length - 5} more...
                                            </p>
                                        )}
                                    </div>

                                    <button
                                        onClick={handleBulkCreate}
                                        disabled={uploading}
                                        className="bg-blue-600 text-white px-6 py-2 rounded-xl hover:bg-blue-700 transition"
                                    >
                                        {uploading ? "Creating..." : `Create ${csvData.length} Users`}
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>

            )}

        </div>
    );
};



export default UserManagement;
