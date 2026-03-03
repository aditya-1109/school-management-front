import React, { useEffect, useState } from "react";
import { createeventsApi, deleteeventsApi, updateeventsApi } from "../../api/apis";
import { useDispatch, useSelector } from "react-redux";
import { getEventsRedux } from "../../redux/getData";
import { apiFunction } from '../../api/apiFunction';

const EventsManagement = () => {
  const [loading, setLoading] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const { events } = useSelector((state) => state.getData)
  const [toast, setToast] = useState()

  const dispatch = useDispatch()

  const [formData, setFormData] = useState({
    date: "",
    topic: "",
    time: "",
    attendees: 0,
    status: "pending",
    approval: "not",
  });

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };



  useEffect(() => {
    if (!events) {

      dispatch(getEventsRedux())
    }
  }, []);


  const handleSubmit = async () => {
    if (!formData.date || !formData.topic || !formData.time) {
      alert("Date, Topic and Time are required");
      return;
    }

    setLoading(true);

    let response

    if (editingId) {
      response = await apiFunction(
        updateeventsApi,
        [editingId],
        formData,
        "PUT",
        true
      );
    } else {
      response = await apiFunction(
        createeventsApi,
        [],
        formData,
        "POST",
        true
      );
    }



    if (response.success) {
      setLoading(false);
      setOpenModal(false);
      setEditingId(null);
      resetForm();
      dispatch(getEventsRedux())
      showToast(response?.message, "success")
    } else {
      showToast(response?.message, "error")
    }


  };

  const handleEdit = (event) => {
    setFormData({
      ...event,
      time: event.time?.slice(0, 16), // for datetime-local
    });
    setEditingId(event.id);
    setOpenModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this event?"))
      return;

    await apiFunction(deleteeventsApi, [id], {}, "DELETE", true);
    fetchEvents();
  };

  const resetForm = () => {
    setFormData({
      date: "",
      topic: "",
      time: "",
      attendees: 0,
      status: "pending",
      approval: "not",
    });
  };



  return (
    <div className="p-6 space-y-6">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800">
            Events Management
          </h1>
          <p className="text-sm text-slate-500">
            Create and manage school events
          </p>
        </div>

        <button
          onClick={() => {
            resetForm();
            setEditingId(null);
            setOpenModal(true);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition"
        >
          + Create Event
        </button>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-6 py-3 text-left">Topic</th>
              <th className="px-6 py-3 text-left">Date</th>
              <th className="px-6 py-3 text-left">Time</th>
              <th className="px-6 py-3 text-center">Status</th>
              <th className="px-6 py-3 text-center">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y">
            {events?.map((event) => (
              <tr key={event.id} className="hover:bg-slate-50 transition">
                <td className="px-6 py-4 font-medium">
                  {event.topic}
                </td>

                <td className="px-6 py-4">
                  {event.date}
                </td>

                <td className="px-6 py-4">
                  {event?.time && !isNaN(new Date(event.time).getTime())
                    ? new Date(event.time).toLocaleTimeString()
                    : event?.time}
                </td>

                <td className="px-6 py-4 text-center">
                  <span
                    className={`px-3 py-1 text-xs rounded-full font-medium
                      ${event.status === "approved"
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-amber-100 text-amber-700"
                      }`}
                  >
                    {event.status}
                  </span>
                </td>

                <td className="px-6 py-4 text-center space-x-2">
                  <button
                    onClick={() => handleEdit(event)}
                    className="text-blue-600 hover:underline text-xs"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(event.id)}
                    className="text-rose-600 hover:underline text-xs"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {events?.length === 0 && (
          <div className="text-center py-10 text-slate-400">
            No events found
          </div>
        )}
      </div>

      {/* MODAL */}
      {openModal && (
        <div
          onClick={() => setOpenModal(false)}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 px-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white w-full max-w-lg rounded-2xl shadow-2xl p-6 animate-fadeIn"
          >
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-800">
                {editingId ? "Update Event" : "Create Event"}
              </h2>

              <button
                onClick={() => setOpenModal(false)}
                className="text-gray-400 hover:text-gray-600 text-xl"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              {/* Event Topic */}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Event Topic
                </label>
                <input
                  type="text"
                  placeholder="Enter event topic"
                  className="w-full border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none px-3 py-2 rounded-lg text-sm transition"
                  value={formData.topic}
                  onChange={(e) =>
                    setFormData({ ...formData, topic: e.target.value })
                  }
                />
              </div>

              {/* Event Date */}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Event Date
                </label>
                <input
                  type="date"
                  className="w-full border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none px-3 py-2 rounded-lg text-sm transition"
                  value={formData.date}
                  onChange={(e) =>
                    setFormData({ ...formData, date: e.target.value })
                  }
                />
              </div>

              {/* Event Time */}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Event Time
                </label>
                <input
                  type="time"
                  className="w-full border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none px-3 py-2 rounded-lg text-sm transition"
                  value={formData.time}
                  onChange={(e) =>
                    setFormData({ ...formData, time: e.target.value })
                  }
                />
              </div>

              {/* Attendees */}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Number of Attendees
                </label>
                <input
                  type="number"
                  placeholder="Enter number of attendees"
                  className="w-full border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none px-3 py-2 rounded-lg text-sm transition"
                  value={formData.attendees}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      attendees: Number(e.target.value),
                    })
                  }
                />
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Event Status
                </label>
                <select
                  className="w-full border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none px-3 py-2 rounded-lg text-sm transition"
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({ ...formData, status: e.target.value })
                  }
                >
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                </select>
              </div>

              {/* Submit Button */}
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading
                  ? "Saving..."
                  : editingId
                    ? "Update Event"
                    : "Create Event"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventsManagement;
