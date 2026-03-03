import { useEffect, useState } from "react";
import { getClassesRedux, getFeesRedux, getUserRedux } from "../../redux/getData";
import { apiFunction } from "../../api/apiFunction";
import { createFeesApi, deleteFeesApi, submitFeesApi, updateFeesApi } from "../../api/apis";
import { Edit, Trash2, Users, User, Search, ChevronRight } from "lucide-react";
import { useDispatch, useSelector } from "react-redux"
import Toast from "../Components/Toast";

const FeeManagement = () => {

  const { classes, users, fees } = useSelector((state) => state.getData);

  const dispatch = useDispatch();

  const [selectedClass, setSelectedClass] = useState(null);
  const [showCreateTypeModal, setShowCreateTypeModal] = useState(false);
  const [showFeeFormModal, setShowFeeFormModal] = useState(false);
  const [showUpdateStudentFeeModal, setShowUpdateStudentFeeModal] = useState(false);
  const [searchStudent, setSearchStudent] = useState("");
  const [showAllFees, setShowAllFees] = useState(false);
  const [toast, setToast] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedFeeId, setSelectedFeeId] = useState(null);
  const [editing, setEditing] = useState(null)

  const [newFee, setNewFee] = useState({
    totalAmount: 0,
    studentId: [],
    lastDate: "",
    title: "",
    method: "",
    paidAmount: 0,
    status: "pending"
  });

  useEffect(() => {
    if (!classes) dispatch(getClassesRedux());
    if (!users) dispatch(getUserRedux());
    if (!fees) dispatch(getFeesRedux())

  }, [dispatch]);

  console.log(classes)

  useEffect(() => {
    if (classes && !selectedClass) {
      setSelectedClass(classes[0]);
    }
  }, [classes]);

  const showToast = (message, type) => {
    setToast({ message, type });
  };

  const resetFeeForm = () => {
    setNewFee({
      totalAmount: 0,
      studentId: [],
      lastDate: "",
      title: "",
      method: "",
      paidAmount: 0,
      status: "pending"
    });
  };

  const createFee = async () => {
    const response = await apiFunction(createFeesApi, [], newFee, "post", true);
    showToast(response.message, response.success ? "success" : "error");
    if (response.success) {
      resetFeeForm();
      setShowFeeFormModal(false);
      setShowCreateTypeModal(false);
      dispatch(getFeesRedux())
      dispatch(getUserRedux())
    }
  };

  const updateFee = async (feeId) => {
    const response = await apiFunction(updateFeesApi, [feeId], newFee, "put", true);
    showToast(response.message, response.success ? "success" : "error");
    resetFeeForm()
    setShowFeeFormModal(false)
    setEditing(null)
    dispatch(getFeesRedux())
  };

  const submitFee = async () => {
    const response = await apiFunction(
      submitFeesApi,
      [selectedStudent?.id, selectedFeeId],
      { paidAmount: newFee.paidAmount, status: newFee.status },
      "put",
      true
    );
    showToast(response.message, response.success ? "success" : "error");
    if (response.success) {
      setShowUpdateStudentFeeModal(false);
      resetFeeForm();
      dispatch(getUserRedux())
    }
  };

  const deleteFee = async (feeId) => {

    const response = await apiFunction(deleteFeesApi, [feeId], {}, "delete", true);
    showToast(response.message, response.success ? "success" : "error");
    dispatch(getFeesRedux())
  };

  const getName = (id) => {
    return users?.find((u) => u.id == id)?.name || "Unknown";
  };

  const getFeeName = (id) => {
    return fees?.find((fee) => fee.id == id).title || "Untitled"
  }

  const getFeeAmount = (id) => {
    return fees?.find((fee) => fee.id == id).totalAmount || "0"
  }

  const filteredStudents = users?.filter((user) =>
    selectedClass?.student?.includes(String(user.id))
  );



  return (
    <div className="space-y-6">

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Header */}
      <div className="flex justify-between items-center">
        <select
          value={selectedClass?.id || ""}
          onChange={(e) =>
            setSelectedClass(classes.find((c) => c.id == e.target.value))
          }
          className="border p-2 rounded-lg"
        >
          {classes?.map((cls) => (
            <option key={cls.id} value={cls.id}>
              {cls.className}-{cls.section?.toUpperCase()}
            </option>
          ))}
        </select>

        <div className="flex gap-3">
          <button
            onClick={() => setShowCreateTypeModal(true)}
            className="bg-blue-600 text-white px-5 py-2 rounded-xl"
          >
            + Create Fee
          </button>

          <button
            onClick={() => setShowAllFees(!showAllFees)}
            className="bg-slate-800 text-white px-5 py-2 rounded-xl"
          >
            {showAllFees ? "Class Based" : "All Fees"}
          </button>
        </div>
      </div>

      {/* STUDENT VIEW */}
      {!showAllFees && (
        <div className="space-y-6">

          {filteredStudents?.length === 0 && (
            <div className="bg-white border rounded-2xl shadow-sm p-10 text-center">
              <div className="text-4xl mb-3">👨‍🎓</div>
              <p className="text-gray-500 font-medium">
                No Students Found
              </p>
            </div>
          )}

          {filteredStudents?.map((student) => (
            <div
              key={student.id}
              className="bg-white border rounded-2xl shadow-sm hover:shadow-md transition-all duration-200"
            >
              {/* Student Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b bg-gray-50 rounded-t-2xl">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">
                    {student.name}
                  </h3>
                  <p className="text-sm text-gray-500">
                    ID: {student.id}
                  </p>
                </div>
              </div>

              {/* Fees List */}
              <div className="divide-y">
                {student.fees?.length === 0 && (
                  <div className="p-6 text-sm text-gray-400">
                    No fees assigned
                  </div>
                )}

                {student.fees?.map((fee) => {
                  const statusColor =
                    fee.status === "paid"
                      ? "bg-green-100 text-green-600"
                      : fee.status === "partial"
                        ? "bg-yellow-100 text-yellow-600"
                        : "bg-red-100 text-red-600";

                  return (
                    <div
                      key={fee.feeId}
                      className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition"
                    >
                      {/* Fee Info */}
                      <div className="flex flex-col gap-1">
                        <span className="font-medium text-gray-700">
                          {getFeeName(fee.feeId)}
                        </span>
                        <span className="text-sm text-gray-500">
                          Paid: ₹{fee.paidAmount || 0}
                        </span>
                      </div>

                      {/* Status + Action */}
                      <div className="flex items-center gap-4">
                        <div className="flex flex-col justify-center items-end gap-2">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${statusColor}`}
                        >
                          {fee.status}
                        </span>

                        <span>Total Amount: {getFeeAmount(fee.feeId)}</span>
                        </div>

                        <button
                          onClick={() => {
                            setSelectedStudent(student);
                            setSelectedFeeId(fee.feeId);
                            setNewFee({
                              ...newFee,
                              status: fee.status,
                              paidAmount: fee.paidAmount || 0
                            });
                            setShowUpdateStudentFeeModal(true);
                          }}
                          className="p-2 rounded-lg hover:bg-purple-100 text-purple-600 transition"
                        >
                          <Edit size={16} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}


      {/* ALL FEES VIEW */}
      {showAllFees && (
        <div className="space-y-4">

          {fees?.length === 0 && (
            <div className="bg-white rounded-2xl shadow-sm border p-10 text-center">
              <div className="text-4xl mb-3">📭</div>
              <p className="text-gray-500 font-medium">No Fees Created Yet</p>
              <p className="text-sm text-gray-400">
                Create a new fee to get started.
              </p>
            </div>
          )}

          {fees?.map((fee) => {
            const isOverdue = new Date(fee.lastDate) < new Date();

            return (
              <div
                key={fee.id}
                className="bg-white border rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
              >
                {/* Left Section */}
                <div className="flex flex-col gap-2">
                  <h3 className="text-lg font-semibold text-gray-800">
                    {fee.title}
                  </h3>

                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                    <span className="font-medium text-purple-600">
                      ₹{fee.totalAmount}
                    </span>

                    <span className="flex items-center gap-1">
                      📅 {fee.lastDate}
                    </span>

                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${isOverdue
                        ? "bg-red-100 text-red-600"
                        : "bg-green-100 text-green-600"
                        }`}
                    >
                      {isOverdue ? "Overdue" : "Active"}
                    </span>
                  </div>
                </div>

                {/* Right Section - Actions */}
                <div className="flex gap-3 justify-end">
                  <button
                    onClick={() => {
                      setNewFee(fee);
                      setShowFeeFormModal(true);
                      setEditing(fee.id);
                    }}
                    className="p-2 rounded-lg hover:bg-purple-100 text-purple-600 transition"
                  >
                    <Edit size={18} />
                  </button>

                  <button
                    onClick={() => deleteFee(fee.id)}
                    className="p-2 rounded-lg hover:bg-red-100 text-red-500 transition"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}


      {/* CREATE TYPE MODAL */}
      {showCreateTypeModal && (
        <div
          onClick={() => setShowCreateTypeModal(false)}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white w-[95%] sm:w-[600px] md:w-[720px] rounded-3xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b bg-slate-50">
              <div className="flex items-center gap-2">
                <div className="bg-indigo-100 p-2 rounded-xl">
                  <Users size={20} className="text-indigo-600" />
                </div>
                <h2 className="text-lg font-semibold text-slate-700">
                  Select Fee Type
                </h2>
              </div>

              <button
                onClick={() => setShowCreateTypeModal(false)}
                className="text-slate-400 hover:text-red-500 transition"
              >
                ✕
              </button>
            </div>

            {/* Body */}
            <div className="p-6 flex flex-col gap-4 overflow-hidden">

              {/* Whole Class Button */}
              <button
                className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-medium shadow-md transition"
                onClick={() => {
                  setNewFee({ ...newFee, studentId: selectedClass.student });
                  setShowCreateTypeModal(false);
                  setShowFeeFormModal(true);
                }}
              >
                <Users size={18} />
                Assign to Whole Class
              </button>

              {/* Search Input */}
              <div className="relative">
                <Search
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="text"
                  placeholder="Search student..."
                  value={searchStudent}
                  onChange={(e) => setSearchStudent(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border rounded-xl focus:ring-2 focus:ring-indigo-400 outline-none"
                />
              </div>

              {/* Student List */}
              <div className="flex-1 overflow-y-auto border rounded-xl divide-y">
                {selectedClass?.student
                  ?.filter((id) =>
                    getName(id)
                      ?.toLowerCase()
                      .includes(searchStudent?.toLowerCase())
                  )
                  .map((id) => (
                    <div
                      key={id}
                      className="flex items-center justify-between px-4 py-3 hover:bg-indigo-50 cursor-pointer transition"
                      onClick={() => {
                        setNewFee({ ...newFee, studentId: [id] });
                        setShowCreateTypeModal(false);
                        setShowFeeFormModal(true);
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <div className="bg-indigo-100 p-2 rounded-full">
                          <User size={16} className="text-indigo-600" />
                        </div>
                        <span className="text-slate-700 font-medium">
                          {getName(id)}
                        </span>
                      </div>

                      <ChevronRight
                        size={18}
                        className="text-slate-400"
                      />
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}


      {/* CREATE FEE FORM MODAL */}
      {showFeeFormModal && (
        <div
          onClick={() => setShowFeeFormModal(false)}
          className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-200"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white w-[95%] sm:w-[600px] md:w-[720px] max-h-[85vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden"
          >

            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b bg-gray-50">
              <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                Create Fee
              </h2>
              <button
                onClick={() => setShowFeeFormModal(false)}
                className="text-gray-500 hover:text-red-500 text-lg"
              >
                ✕
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-5">

              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Fee Title
                </label>
                <input
                  type="text"
                  placeholder="Enter fee title"
                  className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 focus:outline-none transition"
                  value={newFee.title}
                  onChange={(e) =>
                    setNewFee({ ...newFee, title: e.target.value })
                  }
                />
              </div>

              {/* Total Amount */}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Total Amount (₹)
                </label>
                <input
                  type="number"
                  placeholder="Enter total amount"
                  value={newFee.totalAmount}
                  className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 focus:outline-none transition"
                  onChange={(e) =>
                    setNewFee({ ...newFee, totalAmount: e.target.value })
                  }
                />
              </div>

              {/* Last Date */}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Last Date
                </label>
                <input
                  type="date"
                  value={newFee.lastDate}
                  className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 focus:outline-none transition"
                  onChange={(e) =>
                    setNewFee({ ...newFee, lastDate: e.target.value })
                  }
                />
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t bg-gray-50 flex justify-end">
              <button
                className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg shadow-md transition-all duration-200"
                onClick={editing ? () => updateFee(editing) : createFee}
              >
                {editing ? "Update" : "Create"} Fee
              </button>
            </div>
          </div>
        </div>
      )}


      {/* UPDATE STUDENT FEE MODAL */}
      {showUpdateStudentFeeModal && (
        <div
          onClick={() => setShowUpdateStudentFeeModal(false)}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white w-[95%] sm:w-[500px] rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b bg-gray-50">
              <h2 className="text-lg font-semibold text-gray-800">
                Update Student Fee
              </h2>
              <button
                onClick={() => setShowUpdateStudentFeeModal(false)}
                className="text-gray-400 hover:text-red-500 transition"
              >
                ✕
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-5">

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">
                  Payment Status
                </label>
                <select
                  value={newFee.status}
                  onChange={(e) =>
                    setNewFee({ ...newFee, status: e.target.value })
                  }
                  className="w-full border rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-purple-500 focus:outline-none transition"
                >
                  <option value="pending">Pending</option>
                  <option value="paid">Paid</option>
                  <option value="partial">Partial</option>
                </select>
              </div>

              {/* Paid Amount */}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">
                  Paid Amount
                </label>

                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-gray-400">
                    ₹
                  </span>
                  <input
                    type="number"
                    placeholder="Enter paid amount"
                    value={newFee.paidAmount}
                    onChange={(e) =>
                      setNewFee({ ...newFee, paidAmount: e.target.value })
                    }
                    className="w-full border rounded-xl pl-8 pr-4 py-2.5 focus:ring-2 focus:ring-purple-500 focus:outline-none transition"
                  />
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-3 px-6 py-4 border-t bg-gray-50">
              <button
                onClick={() => setShowUpdateStudentFeeModal(false)}
                className="px-4 py-2 rounded-xl border text-gray-600 hover:bg-gray-100 transition"
              >
                Cancel
              </button>

              <button
                onClick={submitFee}
                className="px-5 py-2 rounded-xl bg-purple-600 text-white font-medium hover:bg-purple-700 transition shadow-sm"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}


    </div>
  );
};

export default FeeManagement;
