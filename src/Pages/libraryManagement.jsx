import React, { useState, useEffect, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { getAllBooksRedux, getUserRedux } from '../../redux/getData';
import { apiFunction } from '../../api/apiFunction';
import { approveBooksApi, updateBooksApi, createBooksApi } from '../../api/apis';
import { supabase } from '../../lib/supabase';
import { Edit, Trash2, Check, X, FileText } from 'lucide-react';

function LibraryManagement() {
    const schoolId = localStorage.getItem("schoolId");

    const { books, users } = useSelector((state) => state.getData);
    const [activeTab, setActiveTab] = useState("all");
    const [newBook, setNewBook] = useState({ title: "", author: "", subject: "", url: "", issuedTo: [], requested: [], stock: 0, schoolId: schoolId || "" })
    const [isEditing, setIsEditing] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedBook, setSelectedBook] = useState(null);
    const [isIssuedOpen, setIsIssuedOpen] = useState(false);
    const [isRequestedOpen, setIsRequestedOpen] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const dispatch = useDispatch()

    useEffect(() => {
        if (!books) {
            dispatch(getAllBooksRedux())
        }
        if (!users) {
            dispatch(getUserRedux())
        }
    }, [dispatch, books, users]);

    const filteredBooks = useMemo(() => {
        let list = books?.filter((book) => String(book.schoolId) === String(schoolId)) || [];
        if (activeTab.toLowerCase() === "online") {
            return list.filter((book) => book.url !== "")
        }
        if (activeTab.toLowerCase() === "offline") {
            return list.filter((book) => book.stock >= 1)
        }
        return list
    }, [books, activeTab, schoolId]);

    const handleSubmit = async (book) => {
        let res;
        if (isEditing) {
            const { id, createdAt, ...bookData } = book;
            res = await apiFunction(updateBooksApi, [id], bookData, "put", true);
        } else {
            res = await apiFunction(createBooksApi, [], book, "post", true);
        }
        if (res.success) {
            dispatch(getAllBooksRedux());
            setIsEditing(false);
            setIsModalOpen(false);
            setNewBook({ title: "", author: "", subject: "", url: "", issuedTo: [], requested: [], stock: 0, schoolId: schoolId || "" })
        }
    }

    const handleFileUpload = async (fileUpload) => {
        if (!fileUpload) return;
        const fileName = `${Date.now()}-${fileUpload.name}`;
        const { error } = await supabase.storage
            .from("school")
            .upload(fileName, fileUpload);
        if (error) {
            console.log(error);
            return;
        }
        const { data } = supabase.storage
            .from("school")
            .getPublicUrl(fileName);
        return data.publicUrl;
    };

    const handleApprove = async (requestedData) => {
        const res = await apiFunction(approveBooksApi, [selectedBook.id], requestedData, "put", true);
        if (res.success) {
            dispatch(getAllBooksRedux());
            setSelectedBook(prev => ({
                ...prev,
                requested: prev.requested.filter(req => req.studentId !== requestedData.studentId),
                issuedTo: [...(prev.issuedTo || []), res.book?.[0]?.issuedTo?.slice(-1)[0] || {}]
            }));
        }
    }

    const handleReject = async (studentId) => {
        const remainingRequests = selectedBook.requested.filter((req) => req.studentId !== studentId);
        const updatedBook = { ...selectedBook, requested: remainingRequests };
        await handleSubmit(updatedBook);
        setSelectedBook(updatedBook);
    }

    return (
        <div className="p-6 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex flex-wrap items-center gap-4">
                    <div className="flex bg-slate-100 p-1 rounded-xl">
                        <button onClick={() => setActiveTab('all')} className={`px-4 py-1.5 rounded-lg text-sm font-medium transition ${activeTab === 'all' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-600'}`}>All</button>
                        <button onClick={() => setActiveTab('online')} className={`px-4 py-1.5 rounded-lg text-sm font-medium transition ${activeTab === 'online' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-600'}`}>Online</button>
                        <button onClick={() => setActiveTab('offline')} className={`px-4 py-1.5 rounded-lg text-sm font-medium transition ${activeTab === 'offline' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-600'}`}>Offline</button>
                    </div>
                </div>

                <button
                    onClick={() => {
                        setIsEditing(false);
                        setNewBook({ title: "", author: "", subject: "", url: "", issuedTo: [], requested: [], stock: 0, schoolId: schoolId || "" });
                        setIsModalOpen(true);
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-xl text-sm font-medium shadow-sm transition whitespace-nowrap"
                >
                    + Create Book
                </button>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border overflow-x-auto">
                <table className="w-full text-sm">
                    <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                        <tr>
                            <th className="px-6 py-4 text-left">Title & Author</th>
                            <th className="px-6 py-4 text-left">Subject</th>
                            {activeTab !== 'online' && <th className="px-6 py-4 text-center">Stock</th>}
                            {activeTab !== 'offline' && <th className="px-6 py-4 text-center">URL</th>}
                            <th className="px-6 py-4 text-center">Requested By</th>
                            <th className="px-6 py-4 text-center">Issued To</th>
                            <th className="px-6 py-4 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {filteredBooks?.map(book => (
                            <tr key={book.id} className="hover:bg-slate-50 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="font-medium text-slate-900">{book.title}</div>
                                    <div className="text-slate-500 text-xs">{book.author}</div>
                                </td>
                                <td className="px-6 py-4 text-slate-600">{book.subject}</td>
                                {activeTab !== 'online' && <td className="px-6 py-4 text-center text-slate-600">{book.stock}</td>}
                                {activeTab !== 'offline' && <td className="px-6 py-4 text-center">
                                    {book.url ? <a href={book.url} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline flex items-center justify-center gap-1"><FileText size={14} /> PDF</a> : "-"}
                                </td>}
                                <td className="px-6 py-4 text-center">
                                    <button onClick={() => { setSelectedBook(book); setIsRequestedOpen(true); }} className="px-3 py-1 bg-amber-50 text-amber-600 hover:bg-amber-100 rounded-full text-xs font-medium transition cursor-pointer">
                                        {book.requested?.length || 0} Requests
                                    </button>
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <button onClick={() => { setSelectedBook(book); setIsIssuedOpen(true); }} className="px-3 py-1 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-full text-xs font-medium transition cursor-pointer">
                                        {book.issuedTo?.length || 0} Issued
                                    </button>
                                </td>
                                <td className="px-6 py-4 text-center space-x-2">
                                    <button onClick={() => { setSelectedBook(book); setNewBook(book); setIsEditing(true); setIsModalOpen(true); }} className="text-blue-600 hover:bg-blue-50 p-1.5 rounded-lg transition"><Edit size={16} /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {(!filteredBooks || filteredBooks.length === 0) && (
                    <div className="text-center py-10 text-slate-400">No books found.</div>
                )}
            </div>

            {isModalOpen && (
                <div onClick={() => setIsModalOpen(false)} className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
                    <div onClick={(e) => e.stopPropagation()} className="bg-white w-full max-w-lg rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="flex justify-between items-center p-6 border-b">
                            <h2 className="text-xl font-semibold text-slate-800">{isEditing ? "Update Book" : "Create Book"}</h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
                        </div>
                        <div className="p-6 space-y-4 overflow-y-auto">
                            <div>
                                <label className="block text-sm font-medium text-slate-600 mb-1">Title</label>
                                <input type="text" className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none" value={newBook.title} onChange={(e) => setNewBook({ ...newBook, title: e.target.value })} placeholder="Book Title" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-600 mb-1">Author</label>
                                <input type="text" className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none" value={newBook.author} onChange={(e) => setNewBook({ ...newBook, author: e.target.value })} placeholder="Author Name" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-600 mb-1">Subject</label>
                                <input type="text" className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none" value={newBook.subject} onChange={(e) => setNewBook({ ...newBook, subject: e.target.value })} placeholder="Subject" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-600 mb-1">Stock (Offline copies)</label>
                                <input type="number" className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none" value={newBook.stock} onChange={(e) => setNewBook({ ...newBook, stock: parseInt(e.target.value) || 0 })} placeholder="Stock Count" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-600 mb-1">Upload PDF (Online copy)</label>
                                <input
                                    type="file"
                                    accept=".pdf"
                                    className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                                    onChange={async (e) => {
                                        setIsUploading(true);
                                        const url = await handleFileUpload(e.target.files[0]);
                                        if (url) setNewBook({ ...newBook, url });
                                        setIsUploading(false);
                                    }}
                                />
                                {isUploading && <p className="text-xs text-blue-600 mt-1">Uploading...</p>}
                                {newBook.url && <p className="text-xs text-emerald-600 mt-1">PDF uploaded successfully.</p>}
                            </div>
                        </div>
                        <div className="p-6 border-t bg-slate-50 flex justify-end gap-3">
                            <button onClick={() => setIsModalOpen(false)} className="px-5 py-2 border rounded-xl text-slate-600 hover:bg-slate-100 transition">Cancel</button>
                            <button disabled={isUploading} onClick={() => handleSubmit(newBook)} className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-sm transition disabled:opacity-50">
                                {isEditing ? "Update" : "Save"} Book
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {isRequestedOpen && selectedBook && (
                <div onClick={() => setIsRequestedOpen(false)} className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
                    <div onClick={(e) => e.stopPropagation()} className="bg-white w-full max-w-2xl rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="flex justify-between items-center p-6 border-b bg-slate-50">
                            <div>
                                <h2 className="text-xl font-semibold text-slate-800">Requests</h2>
                                <p className="text-sm text-slate-500">{selectedBook.title}</p>
                            </div>
                            <button onClick={() => setIsRequestedOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
                        </div>
                        <div className="p-6 overflow-y-auto max-h-[60vh]">
                            {selectedBook.requested?.length > 0 ? (
                                <div className="space-y-4">
                                    {selectedBook.requested.map((req, idx) => (
                                        <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-xl hover:shadow-sm transition bg-white">
                                            <div>
                                                <p className="font-semibold text-slate-800">{req.studentName} <span className="text-xs text-slate-400 font-normal ml-1">(ID: {req.studentId})</span></p>
                                                <div className="flex gap-3 text-sm mt-1">
                                                    <span className="text-blue-600 bg-blue-50 px-2 py-0.5 rounded capitalize">{req.type}</span>
                                                    <span className="text-slate-600">{req.days} Days</span>

                                                </div>
                                            </div>
                                            <div className="flex gap-2 mt-3 sm:mt-0">
                                                <button onClick={() => handleApprove({ studentId: req.studentId })} className="flex items-center gap-1 bg-emerald-100 hover:bg-emerald-200 text-emerald-700 px-3 py-1.5 rounded-lg text-sm font-medium transition">
                                                    <Check size={16} /> Approve
                                                </button>
                                                <button onClick={() => handleReject(req.studentId)} className="flex items-center gap-1 bg-rose-100 hover:bg-rose-200 text-rose-700 px-3 py-1.5 rounded-lg text-sm font-medium transition">
                                                    <X size={16} /> Reject
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center text-slate-500 py-10">No pending requests.</div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {isIssuedOpen && selectedBook && (
                <div onClick={() => setIsIssuedOpen(false)} className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
                    <div onClick={(e) => e.stopPropagation()} className="bg-white w-full max-w-2xl rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="flex justify-between items-center p-6 border-b bg-slate-50">
                            <div>
                                <h2 className="text-xl font-semibold text-slate-800">Issued Records</h2>
                                <p className="text-sm text-slate-500">{selectedBook.title}</p>
                            </div>
                            <button onClick={() => setIsIssuedOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
                        </div>
                        <div className="p-6 overflow-y-auto max-h-[60vh]">
                            {selectedBook.issuedTo?.length > 0 ? (
                                <div className="space-y-4">
                                    {selectedBook.issuedTo.map((issue, idx) => (
                                        <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-xl hover:shadow-sm transition bg-white">
                                            <div>
                                                <p className="font-semibold text-slate-800">{issue.studentName} <span className="text-xs text-slate-400 font-normal ml-1">(ID: {issue.studentId})</span></p>
                                                <div className="flex gap-4 text-sm mt-1">
                                                    <span className="text-slate-600"><span className="text-slate-400">Issued:</span> {new Date(issue.issueDate).toLocaleDateString()}</span>
                                                    <span className="text-slate-600"><span className="text-slate-400">Due:</span> {new Date(issue.returnDate).toLocaleDateString()}</span>
                                                    <span className="text-slate-600"><span className="text-slate-400">Generated Number:</span> {issue.randomNumber}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center text-slate-500 py-10">No issued records.</div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default LibraryManagement