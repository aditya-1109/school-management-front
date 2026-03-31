import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { apiFunction } from "../../api/apiFunction";
import { updateNotificationApi } from "../../api/apis" 
import Toast from "../Components/Toast";
import { useNavigate } from "react-router-dom";
import { getUserRedux } from "../../redux/getData";

export default function Notifications() {
  const { users, parentStudent, loading } = useSelector((state) => state.getData);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [toast, setToast] = useState(null);

  

  

  // ✅ Fetch user
  useEffect(() => {
    if (!users) {
      dispatch(getUserRedux());
    }
  }, [users, dispatch]);

  const myself = useMemo(() => {
    if (!users) return null;
    return users.find((u) => u.type.toLowerCase() === "admin");
    }, [users]);

    const notifications = useMemo(() => {
        if (!myself) return [];
        return Array.isArray(myself.notification) ? myself.notification : [];
    }, [myself]);



  // ✅ Update notifications
  const updateNotification = async () => {
    if (!myself?.id) return;

    const response = await apiFunction(
      updateNotificationApi,
      [myself?.id],
      {},
      "put",
      true
    );

    if (response?.success) {
      dispatch(getUserRedux());
    } else {
      setToast({ message: "Could not update notification", type: "error" });
    }
  };

  // ✅ Mark as read if any unread
  useEffect(() => {
    if (notifications.some((n) => !n.read)) {
      updateNotification();
    }
  }, [notifications]);

  // ✅ Sort latest first
  const sortedNotifications = useMemo(() => {
    return [...notifications].sort(
      (a, b) => new Date(b.date) - new Date(a.date)
    );
  }, [notifications]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-blue-600">Loading...</p>
      </div>
    );
  }

  return (
    <div className="h-screen bg-white flex flex-col">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
      {/* Header */}
      <div className="flex items-center px-4 py-4 shadow-sm border-b">
        <button onClick={() => navigate("/home")} className="mr-3">
          ←
        </button>
        <h1 className="text-xl font-bold">Notifications</h1>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {sortedNotifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <p className="text-lg">No notifications yet</p>
          </div>
        ) : (
          sortedNotifications.map((item, index) => {
            const isUnread = !item.read;

            return (
              <div
                key={index}
                className={`flex items-start p-4 mb-4 rounded-2xl shadow border-l-4 ${
                  isUnread
                    ? "bg-indigo-50 border-indigo-600"
                    : "bg-gray-100 border-gray-400"
                }`}
              >
                <div className="mr-3 mt-1">
                  <span>
                    {isUnread ? "🔔" : "🔕"}
                  </span>
                </div>

                <div className="flex-1">
                  <p
                    className={`text-base font-semibold ${
                      isUnread ? "text-gray-900" : "text-gray-500"
                    }`}
                  >
                    {item.title}
                  </p>

                  <p className="text-sm text-gray-600 mt-1">
                    {item.message}
                  </p>

                  <p className="text-xs text-gray-400 mt-2">
                    {new Date(item.date).toLocaleString()}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}