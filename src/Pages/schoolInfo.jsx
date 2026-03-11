import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getClassesRedux, getInfoRedux, getUserRedux } from "../../redux/getData";
import { apiFunction } from "../../api/apiFunction";
import { createInfoApi, deleteInfoApi, updateInfoApi } from "../../api/apis";
import Toast from "../Components/Toast";
import { supabase } from "../../lib/supabase";
import { useMemo } from "react";

const SchoolInfo = () => {

    const { info, users, classes } = useSelector((state) => state.getData);
    const dispatch = useDispatch();

    const [toast, setToast] = useState(null);
    const [modal, setModal] = useState(null);
    const [social, setNewSocial] = useState({ insta: "", whatsapp: "", linkedin: "", twitter: "" })
    const [news, setNewNews] = useState([])
    const [champ, setNewChamp] = useState({ studentId: "", gameName: "", type: "", marks: "" })
    const [gallery, setNewGallery] = useState([])
    const [searchQuery, setSearchQuery] = useState("")

    useEffect(() => {
        if (!users) dispatch(getUserRedux())
        if (!info) dispatch(getInfoRedux())
        if (!classes) dispatch(getClassesRedux())
    }, [dispatch])



    const students = useMemo(() => {
        return users?.filter((user) => (user.type === "student"))
    }, [users])

    const handleSubmit = async (submitData) => {
        let response;
        const { id, ...data } = submitData
        if (id) {
            response = await apiFunction(updateInfoApi, [], submitData, "put", true)
        } else {
            response = await apiFunction(createInfoApi, [], data, "post", true)
        }
        if (response) {
            showToast(response.message, response.success ? "success" : "error")
            dispatch(getInfoRedux())
            setModal(null)
            setNewChamp({ studentId: "", gameName: "", type: "", marks: "" })
            setNewGallery({ url: "" })
            setNewNews({ letter: "" })
            setNewSocial({ insta: "", whatsapp: "", linkedin: "", twitter: "" })
        }
    }




    const showToast = (message, type = "success") => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };


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

    const deleteItem = async (id) => {
        const res = await apiFunction(deleteInfoApi, [id], {}, "delete", true);

        if (res.success) {
            showToast(res.message);
            dispatch(getInfoRedux());
        } else showToast(res.message, "error");
    };





    return (
        <div className="p-8 space-y-10 bg-slate-50 min-h-screen">

            {toast && <Toast message={toast.message} type={toast.type} />}

            <h1 className="text-3xl font-bold text-slate-800">
                School Information Manager
            </h1>

            {/* SOCIAL MEDIA */}

            <section className="bg-white shadow-md rounded-xl p-6 border">

                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold text-slate-700">Social Media</h2>

                    <button
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
                        onClick={() => setModal("social")}
                    >
                        Add Links
                    </button>
                </div>

                <div className="space-y-3">



                    {info?.map((item) => {

                        if (Array.isArray(item?.social)) return null

                        return (
                            <div
                                key={item.id}
                                className="flex justify-between items-center border rounded-lg p-4 hover:bg-slate-50 transition"
                            >

                                <div className="flex gap-5 text-sm">

                                    {item.social?.insta && (
                                        <a href={item.social.insta} target="_blank" rel="noreferrer" className="text-pink-600 font-medium">
                                            Instagram
                                        </a>
                                    )}

                                    {item.social?.whatsapp && (
                                        <a href={item.social.whatsapp} target="_blank" rel="noreferrer" className="text-green-600 font-medium">
                                            Whatsapp
                                        </a>
                                    )}

                                    {item.social?.linkedin && (
                                        <a href={item.social.linkedin} target="_blank" rel="noreferrer" className="text-blue-700 font-medium">
                                            LinkedIn
                                        </a>
                                    )}

                                    {item.social?.twitter && (
                                        <a href={item.social.twitter} target="_blank" rel="noreferrer" className="text-sky-500 font-medium">
                                            Twitter
                                        </a>
                                    )}

                                </div>

                                <div className="flex gap-3">

                                    <button
                                        className="text-blue-600 hover:underline"
                                        onClick={() => {
                                            setModal("social")
                                            setNewSocial(item.social)
                                        }}
                                    >
                                        Edit
                                    </button>

                                    <button
                                        className="text-red-500 hover:underline"
                                        onClick={() => deleteItem(item.id)}
                                    >
                                        Delete
                                    </button>

                                </div>

                            </div>
                        )
                    })}
                </div>

            </section>


            {/* CHAMPION STUDENTS */}

            <section className="bg-white shadow-md rounded-xl p-6 border">

                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold text-slate-700">
                        Champion Students
                    </h2>

                    <button
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
                        onClick={() => setModal("champ")}
                    >
                        Add Champion
                    </button>

                </div>

                <div className="space-y-3">



                    {info?.map((item) => {

                        if (Array.isArray(item?.champ)) return null

                        const student = users?.find(
                            (c) => c.id === item.champ?.studentId
                        )

                        return (
                            <div
                                key={item.id}
                                className="flex justify-between items-center border rounded-lg p-4 hover:bg-slate-50 transition"
                            >

                                <div>
                                    <p className="font-semibold text-slate-700">
                                        {student?.name || "Unknown Student"}
                                    </p>

                                    <p className="text-sm text-gray-500">
                                        {item.champ?.gameName} • {item.champ?.marks} Marks
                                    </p>
                                </div>

                                <div className="flex gap-3">

                                    <button
                                        className="text-blue-600 hover:underline"
                                        onClick={() => {
                                            setModal("champ")
                                            setNewChamp(item.champ)
                                        }}
                                    >
                                        Edit
                                    </button>

                                    <button
                                        className="text-red-500 hover:underline"
                                        onClick={() => deleteItem(item.id)}
                                    >
                                        Delete
                                    </button>

                                </div>

                            </div>
                        )
                    })}

                </div>

            </section>


            {/* GALLERY */}

            <section className="bg-white shadow-md rounded-xl p-6 border">

                <div className="flex justify-between items-center mb-6">

                    <h2 className="text-xl font-semibold text-slate-700">Gallery</h2>

                    <button
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
                        onClick={() => setModal("gallery")}
                    >
                        Upload Media
                    </button>

                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">



                    {info?.map((item) =>
                        item?.gallery?.length > 0
                            ? item.gallery.map((glry, ind) => (
                                <div
                                    key={`${item.id}-${ind}`}
                                    className="relative rounded-lg overflow-hidden border group"
                                >
                                    <img
                                        src={glry?.url}
                                        className="w-full h-36 object-cover group-hover:scale-105 transition"
                                    />

                                    <button
                                        className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white text-xs px-2 py-1 rounded"
                                        onClick={() => {
                                            const remaining = item.gallery.filter(
                                                (e) => e.url !== glry?.url
                                            )

                                            handleSubmit({
                                                ...item,
                                                gallery: remaining,
                                            })
                                        }}
                                    >
                                        Delete
                                    </button>
                                </div>
                            ))
                            : null
                    )}

                </div>

            </section>


            {/* NEWSLETTER */}

            <section className="bg-white shadow-md rounded-xl p-6 border">

                <div className="flex justify-between items-center mb-6">

                    <h2 className="text-xl font-semibold text-slate-700">
                        Newsletter
                    </h2>

                    <button
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
                        onClick={() => setModal("news")}
                    >
                        Upload
                    </button>

                </div>

                <div className="space-y-3">


                    {info?.map((item) =>
                        item?.news?.length > 0
                            ? item.news.map((news, index) => (
                                <div
                                    key={`${item.id}-${index}`}
                                    className="flex justify-between items-center border rounded-lg p-4"
                                >
                                    <a
                                        href={news?.letter}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="text-blue-600 hover:underline"
                                    >
                                        View Newsletter
                                    </a>

                                    <button
                                        className="text-red-500 hover:underline"
                                        onClick={() => {
                                            const remaining = item.news.filter(
                                                (e) => e.letter !== news?.letter
                                            )

                                            handleSubmit({
                                                ...item,
                                                news: remaining,
                                            })
                                        }}
                                    >
                                        Delete
                                    </button>
                                </div>
                            ))
                            : null
                    )}

                </div>

            </section>


            {/* ---------------- MODALS ---------------- */}


            {/* SOCIAL MODAL */}

            {modal === "social" && (
                <div
                    onClick={() => setModal(null)}
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
                >

                    <div
                        onClick={(e) => e.stopPropagation()}
                        className="w-full max-w-2xl bg-white rounded-2xl shadow-xl p-8 space-y-6"
                    >

                        <h2 className="text-xl font-semibold">Social Media Links</h2>

                        {[
                            { name: "Instagram", variable: "insta" },
                            { name: "Whatsapp", variable: "whatsapp" },
                            { name: "Linkedin", variable: "linkedin" },
                            { name: "Twitter", variable: "twitter" }
                        ].map((item) => (
                            <div key={item.variable}>

                                <label className="text-sm font-medium text-gray-600">
                                    {item.name}
                                </label>

                                <input
                                    type="text"
                                    placeholder={`Enter ${item.name} link`}
                                    value={social?.[item.variable] || ""}
                                    onChange={(e) => setNewSocial({
                                        ...social,
                                        [item.variable]: e.target.value
                                    })}
                                    className="w-full mt-1 border rounded-lg p-3 focus:ring-2 focus:ring-blue-500"
                                />

                            </div>
                        ))}

                        <div className="flex justify-end gap-3 pt-4">

                            <button
                                onClick={() => setModal(null)}
                                className="px-5 py-2 border rounded-lg"
                            >
                                Cancel
                            </button>

                            <button
                                onClick={() => handleSubmit({ social })}
                                className="px-5 py-2 bg-blue-600 text-white rounded-lg"
                            >
                                Save
                            </button>

                        </div>

                    </div>
                </div>
            )}



            {/* NEWSLETTER MODAL */}

            {modal === "news" && (
                <div
                    onClick={() => setModal(null)}
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
                >

                    <div
                        onClick={(e) => e.stopPropagation()}
                        className="w-full max-w-2xl bg-white rounded-2xl shadow-xl p-8 space-y-6"
                    >

                        <h2 className="text-xl font-semibold">Upload Newsletter</h2>

                        <input
                            type="file"
                            accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                            onChange={async (e) => {
                                const file = e.target.files[0]

                                if (!file) return

                                const allowedTypes = [
                                    "application/pdf",
                                    "application/msword",
                                    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                                ]

                                if (!allowedTypes.includes(file.type)) {
                                    alert("Only PDF or DOC files are allowed.")
                                    e.target.value = ""
                                    return
                                }

                                const url = await handleFileUpload(file)

                                if (url) {
                                    setNewNews([...news, { letter: url }])
                                }
                            }}
                            className="border p-3 rounded-lg w-full"
                        />

                        <div className="space-y-3">

                            {Array.isArray(news) && news?.map((item, index) => (
                                <div
                                    key={index}
                                    className="flex justify-between items-center border rounded-lg p-3"
                                >

                                    <a
                                        href={item.letter}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="text-blue-600 hover:underline"
                                    >
                                        View Newsletter
                                    </a>

                                    <button
                                        onClick={() => {
                                            const updated = [...news]
                                            updated.splice(index, 1)
                                            setNewNews(updated)
                                        }}
                                        className="text-red-500"
                                    >
                                        Delete
                                    </button>

                                </div>
                            ))}

                        </div>

                        <div className="flex justify-end">

                            <button
                                onClick={() => handleSubmit({ news })}
                                className="px-5 py-2 bg-blue-600 text-white rounded-lg"
                            >
                                Save
                            </button>

                        </div>

                    </div>
                </div>
            )}



            {/* GALLERY MODAL */}

            {modal === "gallery" && (
                <div
                    onClick={() => setModal(null)}
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
                >

                    <div
                        onClick={(e) => e.stopPropagation()}
                        className="w-full max-w-3xl bg-white rounded-2xl shadow-xl p-8 space-y-6"
                    >

                        <h2 className="text-xl font-semibold">Upload Gallery Media</h2>

                        <input
                            type="file"
                            onChange={async (e) => {
                                const url = await handleFileUpload(e.target.files[0])
                                if (url) {
                                    setNewGallery([...gallery, { url }])
                                }
                            }}
                            className="border p-3 rounded-lg w-full"
                        />

                        <div className="grid grid-cols-3 gap-4">

                            {Array.isArray(gallery) && gallery?.map((item, index) => (
                                <div key={index} className="relative border rounded-lg overflow-hidden">

                                    <img
                                        src={item.url}
                                        className="w-full h-32 object-cover"
                                    />

                                    <button
                                        onClick={() => {
                                            const updated = [...gallery]
                                            updated.splice(index, 1)
                                            setNewGallery(updated)
                                        }}
                                        className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-xs"
                                    >
                                        X
                                    </button>

                                </div>
                            ))}

                        </div>

                        <div className="flex justify-end">

                            <button
                                onClick={() => handleSubmit({ gallery })}
                                className="px-5 py-2 bg-blue-600 text-white rounded-lg"
                            >
                                Save
                            </button>

                        </div>

                    </div>
                </div>
            )}



            {/* CHAMPION MODAL */}

            {modal === "champ" && (
                <div
                    onClick={() => setModal(null)}
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        className="w-full max-w-3xl bg-white h-[70vh] overflow-y-scroll rounded-2xl shadow-2xl border border-gray-200 p-8 space-y-6"
                    >

                        {/* HEADER */}
                        <div className="flex justify-between items-center">
                            <h2 className="text-2xl font-semibold">Champion Student</h2>

                            <button
                                onClick={() => setModal(null)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                ✕
                            </button>
                        </div>

                        {/* SEARCH */}
                        <div>
                            <label className="text-sm font-medium text-gray-600">
                                Search Student
                            </label>

                            <input
                                placeholder="Search by student name..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full border border-gray-300 rounded-lg p-3 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        {/* STUDENT LIST */}
                        <div className="border rounded-xl max-h-52 overflow-y-auto">

                            {students
                                ?.filter((stud) =>
                                    stud.name.toLowerCase().includes(searchQuery.toLowerCase())
                                )
                                ?.map((stud) => {

                                    const classe = classes?.find((c) => c.id == stud.classes?.[0])

                                    const isSelected = champ?.studentId == stud.id

                                    return (
                                        <div
                                            key={stud.id}
                                            onClick={() =>
                                                setNewChamp({ ...champ, studentId: stud.id })
                                            }
                                            className={`flex justify-between items-center p-3 cursor-pointer border-b hover:bg-gray-50 ${isSelected ? "bg-blue-50 border-blue-300" : ""
                                                }`}
                                        >

                                            <div>
                                                <p className="font-medium">{stud.name}</p>
                                                <p className="text-sm text-gray-500">
                                                    Class {classe?.className}-{classe?.section?.toUpperCase()}
                                                </p>
                                            </div>

                                            {isSelected && (
                                                <span className="text-blue-600 text-sm font-medium">
                                                    Selected
                                                </span>
                                            )}

                                        </div>
                                    )
                                })}

                        </div>

                        {/* GAME NAME */}
                        <div>
                            <label className="text-sm font-medium text-gray-600">
                                Game Name
                            </label>

                            <input
                                placeholder="Enter game name"
                                value={champ?.gameName || ""}
                                onChange={(e) =>
                                    setNewChamp({ ...champ, gameName: e.target.value })
                                }
                                className="w-full border border-gray-300 rounded-lg p-3 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        {/* TYPE */}
                        <div>
                            <label className="text-sm font-medium text-gray-600">
                                Champion Type
                            </label>

                            <input
                                placeholder="District / State / National"
                                value={champ?.type || ""}
                                onChange={(e) =>
                                    setNewChamp({ ...champ, type: e.target.value })
                                }
                                className="w-full border border-gray-300 rounded-lg p-3 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        {/* MARKS */}
                        <div>
                            <label className="text-sm font-medium text-gray-600">
                                Marks / Score
                            </label>

                            <input
                                placeholder="Enter marks"
                                value={champ?.marks || ""}
                                onChange={(e) =>
                                    setNewChamp({ ...champ, marks: e.target.value })
                                }
                                className="w-full border border-gray-300 rounded-lg p-3 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        {/* FOOTER */}
                        <div className="flex justify-end gap-3 pt-4 border-t">

                            <button
                                onClick={() => setModal(null)}
                                className="px-5 py-2 border rounded-lg hover:bg-gray-50"
                            >
                                Cancel
                            </button>

                            <button
                                onClick={() => handleSubmit({ champ })}
                                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                            >
                                Save Champion
                            </button>

                        </div>

                    </div>
                </div>
            )}

        </div>
    );
};

export default SchoolInfo;