import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from "react-redux";
import Toast from '../Components/Toast';
import { approveNewUserApi, createNewUSerApi, updateNewUserApi } from '../../api/apis';
import { getNewUserRedux } from '../../redux/getData';
import { supabase } from '../../lib/supabase';
import { apiFunction } from '../../api/apiFunction';

const AdmissionManagement = () => {
    const dispatch = useDispatch();
    const { newUsers } = useSelector(state => state.getData);

    const [toast, setToast] = useState(null);
    const [loading, setLoading] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [openModal, setOpenModal] = useState(false);
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState("All");

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        parent: "",
        parentEmail: "",
        phone: "",
        status: "Pending",
        dob: "",
        gender: "",
        documents: []
    });

    const [selectedFiles, setSelectedFiles] = useState({
        aadhar: null,
        pan: null,
        birthCertificate: null
    });


    useEffect(() => {
        dispatch(getNewUserRedux());
    }, [dispatch]);


    const handleFileSelect = (e) => {
        setSelectedFiles(Array.from(e.target.files));
    };

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


    const handleSubmit = async () => {
        try {
            setLoading(true);

            let documentsArray = [];

            for (const key in selectedFiles) {
                if (selectedFiles[key]) {
                    const url = await handleFileUpload(selectedFiles[key]);
                    if (url) {
                        documentsArray.push({
                            type: key,
                            name: selectedFiles[key].name,
                            url
                        });
                    }
                }
            }

            const payload = {
                ...formData,
                documents: documentsArray
            };

            let response;

            if (editingId) {
                response = await apiFunction(
                    updateNewUserApi,
                    [editingId],
                    payload,
                    "put",
                    true
                );
            } else {
                response = await apiFunction(
                    createNewUSerApi,
                    [],
                    payload,
                    "post",
                    true
                );
            }

            showToast(response?.message || "Success", response?.success ? "success" : "error");

            if (response?.success) {
                dispatch(getNewUserRedux());
                closeModal();
            }

        } catch (err) {
            showToast(`Something went wrong ${err}`, "error");
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (user, status) => {
        setLoading(true);

        console.log("Updating status for ID:", user?.id, "to", status);

        const payload = {
            name: user.name,
            email: user.email,
            type: "student",
            documents: { pan: "", aadhar: "" },
            phone: String(user.phone),
            address: "",
            links: {
                fb: "",
                insta: "",
                linkdIn: "",
                twitter: "",
            }
        }


            const response = await apiFunction(
                approveNewUserApi,
                [],
                { payload, id: user.id, status },
                "post",
                true
            );

            showToast(response?.message, response?.success? "success" : "error");

        if(response?.success) {
                dispatch(getNewUserRedux());
            }

        setLoading(false);
        };

        const handleEdit = (user) => {
            setEditingId(user.id);
            setFormData(user);
            setOpenModal(true);
        };

        const closeModal = () => {
            setEditingId(null);
            setFormData({
                name: "",
                email: "",
                parent: "",
                parentEmail: "",
                phone: "",
                status: "Pending",
                dob: "",
                gender: "",
                documents: []
            });
            setSelectedFiles([]);
            setOpenModal(false);
        };

        const showToast = (message, type = "success") => {
            setToast({ message, type });
            setTimeout(() => setToast(null), 3000);
        };


        const filteredUsers = newUsers?.filter(user =>
            (filter === "All" || user.status === filter) &&
            user.name.toLowerCase().includes(search.toLowerCase())
        );

        return (
            <div className="space-y-6">

                {toast && <Toast message={toast.message} type={toast.type} />}

                {/* HEADER */}
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold">Admission Dashboard</h1>
                        <p className="text-sm text-slate-500">
                            Manage student applications
                        </p>
                    </div>

                    <button
                        onClick={() => setOpenModal(true)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-xl shadow hover:bg-blue-700"
                    >
                        + New Application
                    </button>
                </div>

                {/* FILTER BAR */}
                <div className="flex justify-between items-center bg-white p-4 rounded-xl border">
                    <div className="flex gap-2">
                        {["All", "Pending", "Approved", "Rejected"].map(f => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`px-3 py-1 text-sm rounded-lg ${filter === f
                                    ? "bg-blue-600 text-white"
                                    : "bg-slate-100"
                                    }`}
                            >
                                {f}
                            </button>
                        ))}
                    </div>

                    <input
                        type="text"
                        placeholder="Search student..."
                        className="px-3 py-2 border rounded-lg text-sm"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>

                {/* TABLE */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">

                    {/* Header */}
                    <div className="px-6 py-4 border-b bg-slate-50 flex justify-between items-center">
                        <div>
                            <h2 className="text-lg font-semibold text-slate-800">
                                Admission Applications
                            </h2>
                            <p className="text-xs text-slate-500">
                                Manage and review student applications
                            </p>
                        </div>
                        <div className="text-sm text-slate-500">
                            Total: {filteredUsers?.length || 0}
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-slate-50 text-xs uppercase text-slate-500 tracking-wider">
                                <tr>
                                    <th className="px-6 py-3 text-left">Student</th>
                                    <th className="px-6 py-3 text-left">Parent</th>
                                    <th className="px-6 py-3 text-center">Status</th>
                                    <th className="px-6 py-3 text-center">Actions</th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-slate-100">
                                {filteredUsers?.length > 0 ? (
                                    filteredUsers.map(user => (
                                        <tr
                                            key={user.id}
                                            className="hover:bg-slate-50 transition"
                                        >
                                            {/* Student Column */}
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 flex items-center justify-center rounded-full bg-blue-100 text-blue-600 font-semibold text-sm">
                                                        {user.name?.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <div className="font-medium text-slate-800">
                                                            {user.name}
                                                        </div>
                                                        <div className="text-xs text-slate-500">
                                                            {user.email}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Parent Column */}
                                            <td className="px-6 py-4 text-slate-700">
                                                {user.parent}
                                            </td>

                                            {/* Status Column */}
                                            <td className="px-6 py-4 text-center">
                                                <span
                                                    className={`inline-flex items-center px-3 py-1 text-xs font-medium rounded-full
                  ${user.status === "Approved"
                                                            ? "bg-emerald-100 text-emerald-700"
                                                            : user.status === "Rejected"
                                                                ? "bg-rose-100 text-rose-700"
                                                                : "bg-amber-100 text-amber-700"
                                                        }`}
                                                >
                                                    {user.status}
                                                </span>
                                            </td>

                                            {/* Actions Column */}
                                            <td className="px-6 py-4">
                                                <div className="flex justify-center gap-2">

                                                    <button
                                                        onClick={() => handleEdit(user)}
                                                        className="px-3 py-1.5 text-xs font-medium rounded-lg border border-blue-200 text-blue-600 hover:bg-blue-50 transition"
                                                    >
                                                        Edit
                                                    </button>

                                                    {user.status === "Pending" && (
                                                        <>
                                                            <button
                                                                onClick={() => handleStatusUpdate(user, "approved")}
                                                                className="px-3 py-1.5 text-xs font-medium rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition"
                                                            >
                                                                Approve
                                                            </button>

                                                            <button
                                                                onClick={() => handleStatusUpdate(user, "rejected")}
                                                                className="px-3 py-1.5 text-xs font-medium rounded-lg bg-rose-600 text-white hover:bg-rose-700 transition"
                                                            >
                                                                Reject
                                                            </button>
                                                        </>
                                                    )}

                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="4" className="text-center py-10 text-slate-400">
                                            No admission applications found
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>


                {/* MODAL */}
                {openModal && (
                    <div
                        onClick={closeModal}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 animate-fadeIn"
                    >
                        <div
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl max-h-[90vh] overflow-y-auto"
                        >
                            {/* Header */}
                            <div className="px-6 py-4 border-b flex justify-between items-center">
                                <h2 className="text-xl font-semibold text-slate-800">
                                    {editingId ? "Update Admission" : "New Admission"}
                                </h2>
                                <button
                                    onClick={closeModal}
                                    className="text-slate-400 hover:text-slate-600 text-lg"
                                >
                                    ✕
                                </button>
                            </div>

                            {/* Body */}
                            <div className="p-6 space-y-6">

                                {/* Student Info */}
                                <div className="grid sm:grid-cols-2 gap-4">

                                    <div>
                                        <label className="label">Student Name</label>
                                        <input
                                            type="text"
                                            className="input-style"
                                            value={formData.name}
                                            onChange={e =>
                                                setFormData({ ...formData, name: e.target.value })
                                            }
                                        />
                                    </div>

                                    <div>
                                        <label className="label">Student Email</label>
                                        <input
                                            type="email"
                                            className="input-style"
                                            value={formData.email}
                                            onChange={e =>
                                                setFormData({ ...formData, email: e.target.value })
                                            }
                                        />
                                    </div>

                                    <div>
                                        <label className="label">Parent Name</label>
                                        <input
                                            type="text"
                                            className="input-style"
                                            value={formData.parent}
                                            onChange={e =>
                                                setFormData({ ...formData, parent: e.target.value })
                                            }
                                        />
                                    </div>

                                    <div>
                                        <label className="label">Phone Number</label>
                                        <input
                                            type="text"
                                            className="input-style"
                                            value={formData.phone}
                                            onChange={e =>
                                                setFormData({ ...formData, phone: e.target.value })
                                            }
                                        />
                                    </div>

                                    <div>
                                        <label className="label">Date of Birth</label>
                                        <input
                                            type="date"
                                            className="input-style"
                                            value={formData.dob}
                                            onChange={e =>
                                                setFormData({ ...formData, dob: e.target.value })
                                            }
                                        />
                                    </div>

                                    <div>
                                        <label className="label">Gender</label>
                                        <select
                                            className="input-style"
                                            value={formData.gender}
                                            onChange={e =>
                                                setFormData({ ...formData, gender: e.target.value })
                                            }
                                        >
                                            <option value="">Select Gender</option>
                                            <option>Male</option>
                                            <option>Female</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Documents Section */}
                                <div className="border-t pt-4">
                                    <h3 className="text-md font-semibold text-slate-700 mb-4">
                                        Upload Documents
                                    </h3>

                                    <div className="grid sm:grid-cols-3 gap-4">

                                        <div>
                                            <label className="label">Aadhar Card</label>
                                            <input
                                                type="file"
                                                className="file-style"
                                                onChange={(e) =>
                                                    setSelectedFiles(prev => ({
                                                        ...prev,
                                                        aadhar: e.target.files[0]
                                                    }))
                                                }
                                            />
                                        </div>

                                        <div>
                                            <label className="label">PAN Card</label>
                                            <input
                                                type="file"
                                                className="file-style"
                                                onChange={(e) =>
                                                    setSelectedFiles(prev => ({
                                                        ...prev,
                                                        pan: e.target.files[0]
                                                    }))
                                                }
                                            />
                                        </div>

                                        <div>
                                            <label className="label">Birth Certificate</label>
                                            <input
                                                type="file"
                                                className="file-style"
                                                onChange={(e) =>
                                                    setSelectedFiles(prev => ({
                                                        ...prev,
                                                        birthCertificate: e.target.files[0]
                                                    }))
                                                }
                                            />
                                        </div>

                                    </div>
                                </div>

                                {/* Submit Button */}
                                <button
                                    disabled={loading}
                                    onClick={handleSubmit}
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-medium transition disabled:opacity-50"
                                >
                                    {loading
                                        ? "Saving..."
                                        : editingId
                                            ? "Update Admission"
                                            : "Submit Admission"}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

            </div>
        );
    };


    export default AdmissionManagement;
