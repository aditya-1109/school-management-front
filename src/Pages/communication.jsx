import { useState, useMemo, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { apiFunction } from "../../api/apiFunction";
import { createCommunicationApi } from "../../api/apis";
import { getMyselfRedux, getUserRedux, getCommunicationRedux } from "../../redux/getData";
import Toast from "../Components/Toast";
import { useParams } from "react-router";
import { Search } from "lucide-react";

const Communication = () => {
    const dispatch = useDispatch();
    const { activeTab } = useParams()
    const [searchInboxQuery, setSearchInboxQuery] = useState(null)
    const { users, chats, myself } = useSelector((state) => state.getData);
    const [toast, setToast] = useState(null)
    const [content, setContent] = useState("");
    const [selectedRole, setSelectedRole] = useState("all");
    const [selectedChatUser, setSelectedChatUser] = useState(null);
    const [showNewChat, setShowNewChat] = useState(false)

    useEffect(() => {
        if (!users) {
            dispatch(getUserRedux())
        }

        if (!myself) {
            dispatch(getMyselfRedux())
        }
    }, [dispatch])

    const filteredUsers = users?.filter((userr) => userr.name.toLowerCase().includes(searchInboxQuery?.toLowerCase()))

    useEffect(() => {
        if (activeTab) {
            dispatch(getCommunicationRedux(activeTab))
        }
    }, [activeTab])


    const handleSend = async () => {
        let secondPersonIds = [];

        if (activeTab === "broadcast") {
            secondPersonIds = users.map((u) => u.id);
        }

        if (activeTab === "post") {
            const filtered =
                selectedRole === "all"
                    ? users
                    : users.filter((u) => u.type === selectedRole);

            secondPersonIds = filtered.map((u) => u.id);
        }

        if (activeTab === "inbox" && selectedChatUser) {
            secondPersonIds = [selectedChatUser.id];
        }

        const payload = {
            firstPerson: myself?.id,
            title: content,
            type: activeTab,
            secondPerson: secondPersonIds,
        };



        const response = await apiFunction(createCommunicationApi, [], payload, "post", true)
        if (response.success) {
            setContent("");
            dispatch(getCommunicationRedux(activeTab))
            setToast({ message: response.message, type: "success" })
        } else {
            setToast({ message: response.message, type: "error" })
        }

    };

    const broadcastList = useMemo(() => {
        return chats?.filter(
            (c) => c.type === "broadcast"
        );
    }, [chats]);


    const postList = useMemo(() => {
        return chats?.filter(
            (c) => c.type === "post" && c.firstPerson == myself.id
        );
    }, [chats, myself]);

    const inboxUsers = useMemo(() => {
        return chats
            ?.filter(
                (c) =>
                    c.type === "inbox" &&
                    (c.firstPerson == myself.id ||
                        c.secondPerson?.includes(myself.id))
            )
            ?.map((c) =>
                c.firstPerson == myself.id
                    ? users.find((u) => u.id == c.secondPerson[0])
                    : users.find((u) => u.id == c.firstPerson)
            );
    }, [chats, users, myself]);




    const selectedChatMessages = useMemo(() => {
        if (!selectedChatUser) return [];

        return chats?.filter(
            (c) =>
                c.type === "inbox" &&
                ((c.firstPerson == myself?.id &&
                    c.secondPerson?.includes(`${selectedChatUser.id}`)) ||
                    (c.firstPerson == selectedChatUser.id &&
                        c.secondPerson?.includes(`${myself.id}`)))
        );
    }, [chats, selectedChatUser, myself]);

    console.log(selectedChatMessages)

    const getUserName = (id) => {
        const user = users?.find(usr => usr.id == id)
        return user.name
    }

    return (
        <div className="p-6 space-y-6">

            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}


            {/* ================= BROADCAST ================= */}
            {activeTab === "broadcast" && (
                <div className="space-y-4">
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="Write broadcast message..."
                        className="w-full border rounded-xl p-4 focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                        onClick={handleSend}
                        className="bg-blue-600 cursor-pointer text-white px-6 py-2 rounded-lg"
                    >
                        Send Broadcast
                    </button>

                    <div className="space-y-4">
                        {broadcastList?.map((msg) => {
                            const isMe = msg.firstPerson == myself?.id;

                            return (
                                <div
                                    key={msg.id}
                                    className="group relative p-5 bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300"
                                >
                                    {/* Header */}
                                    <div className="flex justify-between items-start mb-3">
                                        <h3 className="text-base font-semibold text-slate-800 group-hover:text-blue-600 transition">
                                            {msg.title}
                                        </h3>

                                        <span className="text-xs text-slate-400 whitespace-nowrap">
                                            {new Date(msg.createdAt).toLocaleString()}
                                        </span>
                                    </div>

                                    {/* Divider */}
                                    <div className="h-px bg-slate-100 my-2" />

                                    {/* Footer */}
                                    <div className="flex justify-between items-center mt-3">
                                        <div className="text-sm text-slate-500">
                                            Sent By{" "}
                                            <span
                                                className={`font-medium ${isMe ? "text-blue-600" : "text-slate-700"
                                                    }`}
                                            >
                                                {isMe ? "You" : getUserName(msg.firstPerson)}
                                            </span>
                                        </div>

                                        {isMe && (
                                            <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-600 font-medium">
                                                Your Broadcast
                                            </span>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                </div>
            )}

            {/* ================= POST ================= */}
            {activeTab === "post" && (
                <div className="space-y-4">
                    <div className="flex flex-row gap-2 justify-start items-center">
                        <p>Sent To:</p>
                        <select
                            value={selectedRole}
                            onChange={(e) => setSelectedRole(e.target.value)}
                            className="border p-2 rounded-lg"
                        >
                            <option value="all">All</option>
                            <option value="teacher">Teacher</option>
                            <option value="student">Student</option>
                            <option value="parent">Parent</option>
                        </select>
                    </div>

                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="Write post..."
                        className="w-full border rounded-xl p-4"
                    />

                    <button
                        onClick={handleSend}
                        className="bg-green-600 text-white px-6 py-2 rounded-lg"
                    >
                        Publish Post
                    </button>

                    <div className="space-y-4">
                        {postList?.map((post) => {
                            const isMe = post.firstPerson == myself?.id;

                            return (
                                <div
                                    key={post.id}
                                    className="group relative p-5 bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300"
                                >
                                    {/* Header */}
                                    <div className="flex justify-between items-start mb-3">
                                        <h3 className="text-base font-semibold text-slate-800 group-hover:text-green-600 transition">
                                            {post.title}
                                        </h3>

                                        <span className="text-xs text-slate-400 whitespace-nowrap">
                                            {new Date(post.createdAt).toLocaleString()}
                                        </span>
                                    </div>

                                    {/* Divider */}
                                    <div className="h-px bg-slate-100 my-2" />

                                    {/* Footer */}
                                    <div className="flex justify-between items-center mt-3">
                                        <div className="text-sm text-slate-500">
                                            Posted By{" "}
                                            <span
                                                className={`font-medium ${isMe ? "text-green-600" : "text-slate-700"
                                                    }`}
                                            >
                                                {isMe ? "You" : getUserName(post.firstPerson)}
                                            </span>
                                        </div>

                                        {isMe && (
                                            <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-600 font-medium">
                                                Your Post
                                            </span>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                </div>
            )}

            {/* ================= INBOX ================= */}
            {activeTab === "inbox" && (
                <div className="flex h-[600px] border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-sm">


                    <div className="w-1/3 border-r bg-slate-50 flex flex-col">

                        {/* Header */}
                        <div className="p-4 flex justify-between items-center border-b bg-white">
                            <h2 className="font-semibold text-slate-700">Inbox</h2>
                            <button
                                onClick={() => setShowNewChat(true)}
                                className="text-sm bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 transition"
                            >
                                + New Chat
                            </button>
                        </div>



                        {/* User List */}
                        <div className="flex-1 overflow-y-auto">
                            {inboxUsers?.map((user) => (
                                <div
                                    key={user?.id}
                                    onClick={() => setSelectedChatUser(user)}
                                    className={`p-4 cursor-pointer border-b hover:bg-slate-100 transition ${selectedChatUser?.id === user.id
                                        ? "bg-slate-200"
                                        : ""
                                        }`}
                                >
                                    <p className="font-medium text-slate-700">
                                        {user?.name}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>


                    <div className="flex-1 flex flex-col">


                        <div className="p-4 border-b bg-white">
                            {selectedChatUser ? (
                                <h3 className="font-semibold text-slate-700">
                                    {selectedChatUser.name}
                                </h3>
                            ) : (
                                <h3 className="text-slate-400">
                                    Select a chat to start messaging
                                </h3>
                            )}
                        </div>


                        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50">
                            {selectedChatMessages?.map((msg) => (
                                <div
                                    key={msg.id}
                                    className={`max-w-xs px-4 py-2 rounded-2xl text-sm shadow-sm ${msg.firstPerson == myself.id
                                        ? "ml-auto bg-blue-600 text-white"
                                        : "bg-white border text-slate-700"
                                        }`}
                                >
                                    <p>{msg.title}</p>
                                    <span className="text-xs block mt-1 opacity-70">
                                        {new Date(msg.createdAt).toLocaleTimeString()}
                                    </span>
                                </div>
                            ))}
                        </div>

                        {/* Message Input */}
                        {selectedChatUser && (
                            <div className="p-4 border-t bg-white flex gap-3">
                                <input
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                    className="flex-1 border border-slate-300 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Type a message..."
                                />
                                <button
                                    onClick={handleSend}
                                    className="bg-blue-600 text-white px-5 rounded-xl hover:bg-blue-700 transition"
                                >
                                    Send
                                </button>
                            </div>
                        )}
                    </div>


                    {showNewChat && (
                        <div
                            onClick={() => setShowNewChat(false)}
                            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                        >
                            <div
                                onClick={(e) => e.stopPropagation()}
                                className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
                            >
                                {/* Header */}
                                <div className="flex items-center justify-between px-6 py-4 border-b bg-slate-50">
                                    <h2 className="text-lg font-semibold text-slate-800">
                                        Start New Chat
                                    </h2>
                                    <button
                                        onClick={() => setShowNewChat(false)}
                                        className="text-slate-400 hover:text-slate-600 transition"
                                    >
                                        ✕
                                    </button>
                                </div>

                                {/* Search */}
                                <div className="px-6 py-4 border-b bg-white">
                                    <div className="relative ">
                                        <input
                                            type="text"
                                            placeholder="Search users..."
                                            onChange={(e) => setSearchInboxQuery(e.target.value)}
                                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                                        />
                                        <span className="absolute left-3 top-3 text-slate-400 text-sm">
                                            <Search size={16} color="grey" />
                                        </span>
                                    </div>
                                </div>

                                {/* Users List */}
                                <div className="max-h-[350px] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300">
                                    {filteredUsers?.length > 0 ? (
                                        filteredUsers.map((user) => (
                                            <div
                                                key={user.id}
                                                onClick={() => {
                                                    setSelectedChatUser(user);
                                                    setSearchInboxQuery(null)
                                                    setShowNewChat(false);
                                                }}
                                                className="flex items-center gap-3 px-6 py-3 cursor-pointer transition hover:bg-indigo-50"
                                            >
                                                {/* Avatar */}
                                                <div className="h-10 w-10 flex items-center justify-center rounded-full bg-indigo-100 text-indigo-600 font-semibold">
                                                    {user.name?.charAt(0).toUpperCase()}
                                                </div>

                                                {/* User Info */}
                                                <div>
                                                    <p className="text-sm font-medium text-slate-800">
                                                        {user.name}
                                                    </p>
                                                    <p className="text-xs text-slate-400">
                                                        {user.email}
                                                    </p>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="py-10 text-center text-slate-400 text-sm">
                                            No users found
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                </div>
            )}

        </div>
    );
};

export default Communication;
