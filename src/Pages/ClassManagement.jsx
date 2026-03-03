import React, { useEffect, useMemo, useState } from 'react';
import { Plus, Users, BookOpen, Search, Trash2, Edit, User } from 'lucide-react';
import Toast from '../Components/Toast';
import { useDispatch, useSelector } from "react-redux";
import { getClassesRedux, getUserRedux } from '../../redux/getData';
import { apiFunction } from '../../api/apiFunction';
import { addStudentApi, addTeacherApi, createClassesApi, deleteClassApi, updateClassApi } from '../../api/apis';

const ClassManagement = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchStudent, setSearchStudent] = useState("");
  const [searchTeacher, setSearchTeacher] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState(null);
  const [openStudentModal, setOpenStudentModal] = useState(null);
  const [openStudentListModal, setOpenListModal] = useState(null)
  const [openTeacherListModal, setOpenTeacherListModal] = useState(null)
  const [AddTeacherModal, setAddTeacherModal] = useState(false)
  const [selectedClass, setSelectedClass] = useState(null)
  const [toast, setToast] = useState(null);
  const dispatch = useDispatch();
  const [subjectTeacher, setSubjectTeacher] = useState([])
  const [subjectTeacherJson, setSubjectTeacherJson] = useState({ teacher: "", subject: "" })
  const classNames = ["8", "9", "10", "11", "12"]

  const { users, classes } = useSelector((state) => state.getData)

  const [newClass, setNewClass] = useState({ className: 'Class 10', section: '', teacher: "", subject: "" });

  const students = useMemo(() => {
    return users?.filter((user) => user.type === "student")
  }, [users])

  const teachers = useMemo(() => {
    return users?.filter((user) => user.type == "teacher");
  }, [users])

  const filteredClasses = classes?.filter(cls =>
    cls.className.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cls.teacher.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredStudents = students?.filter(cls =>
    cls.name.toLowerCase().includes(searchStudent.toLowerCase())
  );

  const filteredTeachers = teachers?.filter(teache =>
    teache.name.toLowerCase().includes(searchTeacher.toLowerCase())
  );

  useEffect(() => {
    if (dispatch) {
      if (!users) {
        dispatch(getUserRedux())
      }
      if (!classes) {
        dispatch(getClassesRedux())
      }
    }
  }, [dispatch]);







  const showToast = (message, type = 'success') => {
    setToast({ message, type });

  };

  const handleAddClass = async () => {

    const response = await apiFunction(createClassesApi, [], newClass, "post", true)
    if (response.success) {
      showToast(response.message, "success")
      dispatch(getClassesRedux())
      setNewClass({ className: 'Class 10', section: '', teacher: "", subject: "" })
      setIsModalOpen(false)
    } else {
      showToast(response.message, "error")
    }
  };

  const handleOpenEdit = (cls) => {
    setNewClass(cls)
    setIsModalOpen(true)
    setEditingClass(true)
    
  }


  const handleDeleteClass = async (id) => {
    const response = await apiFunction(deleteClassApi, [id], {}, "delete", true)
    if (response.success) {
      showToast(response.message, "success")
      dispatch(getClassesRedux())
      setIsModalOpen(false)
    } else {
      showToast(response.message, "error")
    }
  };



  const handleAddStudent = async (studentId, classId) => {
    const response = await apiFunction(addStudentApi, [], { studentId: studentId, classId: classId }, "post", true)
    if (response.success) {
      showToast(response.message, "success")
      dispatch(getClassesRedux())
      dispatch(getUserRedux())
      setOpenStudentModal(false)
      setSelectedClass(null)
    } else {
      showToast(response.message, "error")
    }
  }

  const getClassName = (classID) => {

    const classe = classes?.filter((classs) => classs.id == classID)

    if (classe?.length > 0) {

      return `${classe[0]?.className}- ${classe[0]?.section?.toUpperCase()}`
    }
  }

  const getUserName = (userId) => {

    const user = users?.filter((user) => user.id == userId)
    if (user?.length > 0) {

      return user[0]?.name
    }
  }

  const handleEditClass = async () => {
    const response = await apiFunction(updateClassApi, [], newClass, "put", true)
    if (response.success) {
      showToast(response.message, "success")
      dispatch(getClassesRedux())
      setIsModalOpen(false)
      setSelectedClass(null)
      setNewClass({ className: 'Class 10', section: '', teacher: "", subject: "" })
    } else {
      showToast(response.message, "error")
    }
  }

  const handleAddTeacher = async (classId) => {
    const response = await apiFunction(addTeacherApi, [], {id: classId, subjectTeacher: subjectTeacher}, "put", true)
     if (response.success) {
      showToast(response.message, "success")
      dispatch(getClassesRedux())
      setAddTeacherModal(null)
      setOpenTeacherListModal(null)
      setSubjectTeacher([])
      setSelectedClass(null)
    } else {
      showToast(response.message, "error")
    }
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

      <div className="flex flex-col sm:flex-row justify-between gap-4 items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Class Management</h1>
          <p className="text-slate-600 text-sm">Overview of all classes and sections</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-medium flex items-center gap-2 shadow-sm transition-all active:scale-95"
        >
          <Plus size={20} /> Add New Class
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex flex-wrap gap-4 items-center justify-between">
        <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-lg border border-slate-200 focus-within:border-blue-600 focus-within:ring-1 ring-blue-100 transition-all w-full md:w-96">
          <Search className="text-slate-500" size={18} />
          <input
            type="text"
            placeholder="Search by class or teacher..."
            className="bg-transparent border-none outline-none text-sm w-full text-slate-800 placeholder-slate-400"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredClasses?.length > 0 ? (
          filteredClasses?.map((cls) => (
            <div key={cls.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow group">
              <div className="flex justify-between items-start mb-4">
                <div className='flex flex-row gap-2 justify-start items-center'>
                  <div className="h-12 w-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    <BookOpen size={24} />

                  </div>
                  <h3 className="text-xl font-bold text-slate-900">Class {cls.className} <span className="text-slate-500 font-normal">- {cls.section?.toUpperCase()}</span></h3>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => handleOpenEdit(cls)}
                    className="text-slate-400 hover:text-blue-600 p-2 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Edit"
                  >
                    <Edit size={18} />
                  </button>
                  <button
                    onClick={() => handleDeleteClass(cls.id)}
                    className="text-slate-400 hover:text-rose-600 p-2 hover:bg-rose-50 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>


              <p className="text-slate-600 text-sm mt-1">Teacher: <span className="font-medium text-slate-800">{cls.teacher?.map((teac) => (<span>{getUserName(teac)}</span>))}</span></p>
              <p className="text-slate-600 text-sm mt-1">Subject: <span className="font-medium text-slate-800">{cls.subject}</span></p>
              <div onClick={() => {
                setOpenListModal(true)
                setSelectedClass(cls)
              }} className="flex cursor-pointer items-center gap-2 text-sm text-slate-600">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-100">
                  <Users size={16} className="text-slate-500" />
                </div>
                <span className="font-medium">
                  {cls.student.length} Students
                </span>
              </div>
              <div className="mt-6 flex w-full items-center justify-between border-t border-slate-200 pt-4">

                {/* Students Count */}


                <button onClick={() => {
                  setOpenTeacherListModal(true)
                  setSelectedClass(cls)
                }}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium 
               bg-blue-50 text-blue-600 rounded-lg 
               hover:bg-blue-600 hover:text-white 
               transition-all duration-200 ease-in-out shadow-sm hover:shadow-md">
                  <Plus size={16} />
                  Manage Teacher
                </button>

                {/* Add Student Button */}
                <button
                  onClick={() => {
                    setOpenStudentModal(true)
                    setSelectedClass(cls)
                  }}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium 
               bg-blue-50 text-blue-600 rounded-lg 
               hover:bg-blue-600 hover:text-white 
               transition-all duration-200 ease-in-out shadow-sm hover:shadow-md"
                >
                  <Plus size={16} />
                  Add Student
                </button>

              </div>

            </div>
          ))
        ) : (
          <div className="col-span-full py-12 text-center text-slate-500">
            No classes found matching your search.
          </div>
        )}

        {/* Add New Class Card Placeholder */}
        <button
          onClick={() => setIsModalOpen(!isModalOpen)}
          className="border-2 border-dashed border-slate-300 rounded-2xl p-6 flex flex-col items-center justify-center text-slate-400 hover:border-blue-500 hover:text-blue-600 transition-all min-h-50"
        >
          <Plus size={32} />
          <span className="font-medium mt-2">Create New Class</span>
        </button>
      </div>

      {/* Create/Edit Class Modal */}
      {isModalOpen && (
        <div onClick={() => setIsModalOpen(false)} className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-in fade-in duration-200">
          <div onClick={(e) => e.stopPropagation()} className="bg-white p-6 rounded-2xl shadow-xl w-96 transform scale-100 transition-all">
            <h3 className="text-lg font-bold mb-4 text-slate-900">{editingClass ? 'Edit Class' : 'Create New Class'}</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Class Name</label>
                <select
                  className="w-full p-2.5 border border-slate-300 rounded-lg outline-none focus:border-blue-500 bg-white text-slate-800"
                  value={newClass.className}
                  onChange={(e) =>
                    setNewClass({ ...newClass, className: e.target.value })
                  }
                >
                  <option value="">Select Class</option>

                  {classNames.map((cls, ind) => (
                    <option key={ind} value={cls}>
                      Class {cls}
                    </option>
                  ))}
                </select>

              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Section</label>
                <input
                  type="text"
                  className="w-full p-2.5 border border-slate-300 rounded-lg outline-none focus:border-blue-500 text-slate-800"
                  placeholder="e.g. A"
                  value={newClass.section.toUpperCase()}
                  onChange={(e) => {
                    if (e.target.value.length <= 1) {

                      setNewClass({ ...newClass, section: e.target.value })
                    }
                  }}
                />
              </div>
              <div className='w-full'>
                <label className="block text-sm font-medium text-slate-700 mb-1">Class Teacher</label>
                <select
                  className="w-full p-2.5 border border-slate-300 rounded-lg outline-none focus:border-blue-500 text-slate-800"
                  value={newClass.teacher || ""}
                  onChange={(e) =>
                    setNewClass({ ...newClass, teacher: e.target.value })
                  }
                >
                  <option value="" disabled>
                    Select Teacher
                  </option>

                  {teachers?.map((teacher) => (
                    <option key={teacher.id} value={teacher.id} className='w-full justify-between flex flex-row gap-4'>
                      <p className='font-bold text-lg'>{teacher.name}</p>
                      <p className='font-light text-sm'>{teacher.classes?.length > 0
                        ? ` Class: ${getClassName(teacher.classes[0])}`
                        : ""}</p>
                    </option>
                  ))}
                </select>

                <div className='mt-2'>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Subject</label>
                  <input
                    type="text"
                    className="w-full p-2.5 border border-slate-300 rounded-lg outline-none focus:border-blue-500 text-slate-800"
                    placeholder="e.g. A"
                    value={newClass.subject}
                    onChange={(e) => {
                      setNewClass({ ...newClass, subject: e.target.value })

                    }}
                  />
                </div>

              </div>
            </div>

            <div className="flex justify-end gap-3 mt-8">
              <button
                onClick={() => {
                  setIsModalOpen(false)
                  setNewClass({ className: 'Class 10', section: '', teacher: "", subject: "" })
                }}
                className="px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-lg font-medium"
              >
                Cancel
              </button>
              <button
                onClick={editingClass ? handleEditClass : handleAddClass}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
              >
                {editingClass ? 'Update Class' : 'Create Class'}
              </button>
            </div>
          </div>
        </div>
      )}

      {openStudentModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-200">

          <div className="bg-white w-[420px] max-h-[75vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden">

            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
              <h2 className="text-lg font-semibold text-slate-800">
                Add Student
              </h2>
              <button
                onClick={() => setOpenStudentModal(false)}
                className="text-slate-400 hover:text-red-500 transition"
              >
                ✕
              </button>
            </div>

            {/* Search Input */}
            <div className="px-6 py-4 border-b border-slate-100">
              <input
                type="text"
                placeholder="Search by student name..."
                value={searchStudent}
                onChange={(e) => setSearchStudent(e.target.value)}
                className="w-full px-4 py-2.5 text-sm border border-slate-300 rounded-lg 
                     focus:outline-none focus:ring-2 focus:ring-blue-500 
                     focus:border-blue-500 transition"
              />
            </div>

            {/* Student List */}
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">

              {filteredStudents?.length === 0 && (
                <p className="text-sm text-slate-400 text-center py-6">
                  No students found
                </p>
              )}

              {filteredStudents?.map((stu) => (
                <div
                  key={stu.id}
                  onClick={() => handleAddStudent(stu.id, selectedClass.id)}
                  className="flex justify-between items-center p-3 rounded-xl 
                       cursor-pointer border border-transparent 
                       hover:border-blue-200 hover:bg-blue-50 
                       transition-all duration-200"
                >
                  <div>
                    <p className="text-sm font-medium text-slate-800">
                      {stu.name}
                    </p>
                    <p className="text-xs text-slate-500">
                      Class: {getClassName(stu.classes[0]) || "N/A"}
                    </p>
                  </div>

                  <span className="text-blue-500 text-sm font-medium">
                    Add
                  </span>
                </div>
              ))}

            </div>

          </div>
        </div>
      )}

      {openStudentListModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-200">

          <div className="bg-white w-[95%] sm:w-[600px] md:w-[720px] max-h-[80vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden">

            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
              <h2 className="text-lg font-semibold text-slate-800">
                Class Students
              </h2>
              <button
                onClick={() => setOpenListModal(false)}
                className="text-slate-400 hover:text-red-500 transition"
              >
                ✕
              </button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto">

              {selectedClass?.student?.length === 0 && (
                <div className="text-center text-slate-400 py-10 text-sm">
                  No students enrolled in this class.
                </div>
              )}

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {selectedClass?.student?.map((stu) => (
                  <div
                    key={stu}
                    className="group bg-slate-50 border border-slate-200 
                         rounded-xl p-4 flex flex-col items-center 
                         hover:shadow-lg hover:bg-white 
                         transition-all duration-300 cursor-pointer"
                  >

                    {/* Avatar */}
                    <div className="w-12 h-12 flex items-center justify-center 
                              rounded-full bg-blue-600 text-white 
                              group-hover:bg-blue-700 transition">
                      <User size={20} />
                    </div>

                    {/* Name */}

                    <p className="mt-3 text-sm font-medium text-slate-800 text-center">
                      {getUserName(stu)}
                    </p>

                  </div>
                ))}
              </div>

            </div>

          </div>
        </div>
      )}

      {openTeacherListModal && (
        <div onClick={() => setOpenTeacherListModal(false)} className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-200">

          <div onClick={(e) => e.stopPropagation()} className="bg-white w-[95%] sm:w-[600px] md:w-[720px] max-h-[80vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden">

            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
              <h2 className="text-lg font-semibold text-slate-800">
                Class Teachers
              </h2>
              <button
                onClick={() => setOpenTeacherListModal(null)}
                className="text-slate-400 hover:text-red-500 transition"
              >
                ✕
              </button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto ">

              {selectedClass?.teachersSubject?.length === 0 && (
                <div className="text-center text-slate-400 py-10 text-sm">
                  No Subject teacher in this class.
                </div>
              )}

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {selectedClass?.teachersSubject?.map((teache, ind) => (
                  <div
                    key={ind}
                    className="group bg-slate-50 border border-slate-200 
                         rounded-xl p-4 flex flex-col items-center 
                         hover:shadow-lg hover:bg-white 
                         transition-all duration-300 cursor-pointer"
                  >

                    {/* Avatar */}
                    <div className="w-12 h-12 flex items-center justify-center 
                              rounded-full bg-blue-600 text-white 
                              group-hover:bg-blue-700 transition">
                      <User size={20} />
                     
                    </div>

                     <p  className="mt-3 text-sm font-medium text-slate-800 text-center">{getUserName(teache.teacher)}</p>
                      <p className="mt-3 text-sm font-medium text-slate-800 text-center">{teache.subject}</p>

                    {/* Name */}

                  </div>
                ))}
              </div>

              <button
                onClick={() => {
                  setAddTeacherModal(true)
                  setSubjectTeacher(selectedClass?.teachersSubject)
                }}
                className="border-2 mt-2 border-dashed border-slate-300 rounded-2xl p-6 flex flex-col items-center justify-center text-slate-400 hover:border-blue-500 hover:text-blue-600 transition-all min-h-50"
              >
                <Plus size={32} />
                <span className="font-medium mt-2">Create New Teacher</span>
              </button>

            </div>

          </div>
        </div>
      )}

      {AddTeacherModal && (
        <div
          onClick={() => setAddTeacherModal(false)}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white w-[480px] max-h-[85vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden"
          >

            {/* Added Assignments Preview */}
            {subjectTeacher.length > 0 && (
              <div className="px-6 py-4 border-t border-slate-100 bg-slate-50">
                <h3 className="text-sm font-semibold text-slate-600 mb-3">
                  Added Assignments
                </h3>

                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {subjectTeacher.map((item, index) => {
                    const teacherName = filteredTeachers?.find(
                      (t) => t.id === item.teacher
                    )?.name;

                    return (
                      <div
                        key={index}
                        className="flex justify-between items-center bg-white border border-slate-200 px-3 py-2 rounded-lg"
                      >
                        <div>
                          <p className="text-sm font-medium text-slate-800">
                            {item.subject}
                          </p>
                          <p className="text-xs text-slate-500">
                            {teacherName || "Unknown Teacher"}
                          </p>
                        </div>

                        <button
                          onClick={() =>
                            setSubjectTeacher((prev) =>
                              prev.filter((_, i) => i !== index)
                            )
                          }
                          className="text-red-400 hover:text-red-600 text-sm"
                        >
                          ✕
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-200">
              <h2 className="text-xl font-semibold text-slate-800">
                Assign Teacher
              </h2>

              <button
                onClick={() => {
                  setAddTeacherModal(false);
                  setSubjectTeacherJson({ subject: "", teacher: "" });
                }}
                className="text-slate-400 hover:text-red-500 text-lg transition"
              >
                ✕
              </button>
            </div>

            {/* Search */}
            <div className="px-6 py-4 border-b border-slate-100">
              <input
                type="text"
                placeholder="Search teacher by name..."
                value={searchTeacher}
                onChange={(e) => setSearchTeacher(e.target.value)}
                className="w-full px-4 py-2.5 text-sm border border-slate-300 rounded-xl 
                     focus:outline-none focus:ring-2 focus:ring-blue-500 
                     focus:border-blue-500 transition"
              />
            </div>

            {/* Teacher List */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-2">
              {filteredTeachers?.length === 0 && (
                <p className="text-sm text-slate-400 text-center py-6">
                  No teachers found
                </p>
              )}

              {filteredTeachers?.map((teacher) => {
                const isSelected =
                  subjectTeacherJson.teacher === teacher.id;

                return (
                  <div
                    key={teacher.id}
                    onClick={() =>
                      setSubjectTeacherJson({
                        ...subjectTeacherJson,
                        teacher: teacher.id,
                      })
                    }
                    className={`flex justify-between items-center p-3 rounded-xl cursor-pointer border transition-all
              ${isSelected
                        ? "border-blue-500 bg-blue-50"
                        : "border-transparent hover:border-blue-200 hover:bg-blue-50"
                      }`}
                  >
                    <p className="text-sm font-medium text-slate-800">
                      {teacher.name}
                    </p>

                    <span
                      className={`text-sm font-medium ${isSelected
                        ? "text-blue-600"
                        : "text-slate-400"
                        }`}
                    >
                      {isSelected ? "Selected" : "Select"}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Subject Input */}
            <div className="px-6 py-4 border-t border-slate-100 space-y-3">
              <input
                value={subjectTeacherJson.subject}
                placeholder="Enter Subject..."
                onChange={(e) =>
                  setSubjectTeacherJson({
                    ...subjectTeacherJson,
                    subject: e.target.value,
                  })
                }
                className="w-full px-4 py-2.5 text-sm border border-slate-300 rounded-xl 
                     focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              {/* Add More */}
              <button
                onClick={() => {
                  if (
                    !subjectTeacherJson.subject ||
                    !subjectTeacherJson.teacher
                  ) {
                    alert("Select teacher and enter subject");
                    return;
                  }

                  setSubjectTeacher((prev) => [
                    ...prev,
                    subjectTeacherJson,
                  ]);

                  setSubjectTeacherJson({
                    subject: "",
                    teacher: "",
                  });
                }}
                className="w-full py-2.5 bg-blue-600 text-white rounded-xl 
                     hover:bg-blue-700 transition text-sm font-medium"
              >
                Add Assignment
              </button>

              {/* Submit */}
              <button
                onClick={()=>handleAddTeacher(selectedClass.id)}
                className="w-full py-2.5 bg-green-600 text-white rounded-xl 
                     hover:bg-green-700 transition text-sm font-medium shadow-md"
              >
                Submit
              </button>

              {/* Cancel */}
              <button
                onClick={() => setAddTeacherModal(false)}
                className="w-full py-2 text-sm text-slate-500 hover:text-red-500 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}


    </div>
  );
}

export default ClassManagement;
