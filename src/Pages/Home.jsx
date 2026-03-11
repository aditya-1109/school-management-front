import React, { useState } from 'react';
import AddEventModal from '../Components/AddEventModal';
import { Users, GraduationCap, Banknote, TrendingUp, UserPlus, FileText, Megaphone, AlertCircle, Clock, CheckCircle, XCircle, Calendar, Award, BookOpen, DollarSign } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, Legend } from 'recharts';
import axios from "axios"
import { useDispatch, useSelector } from 'react-redux';
import { useEffect } from 'react';
import { getClassesRedux, getFeesRedux, getNewUserRedux, getUserRedux } from '../../redux/getData';

const revenueData = [
  { name: 'Jan', amount: 4000, expenses: 2800 },
  { name: 'Feb', amount: 3000, expenses: 2200 },
  { name: 'Mar', amount: 5000, expenses: 3100 },
  { name: 'Apr', amount: 2780, expenses: 2100 },
  { name: 'May', amount: 1890, expenses: 1500 },
  { name: 'Jun', amount: 2390, expenses: 1800 },
  { name: 'Jul', amount: 3490, expenses: 2400 },
];

const admissionData = [
  { name: '2019', applicants: 150, admitted: 120 },
  { name: '2020', applicants: 200, admitted: 150 },
  { name: '2021', applicants: 180, admitted: 160 },
  { name: '2022', applicants: 250, admitted: 200 },
  { name: '2023', applicants: 300, admitted: 240 },
];

const classDistribution = [
  { name: 'Class 10', value: 240, color: '#3b82f6' },
  { name: 'Class 9', value: 220, color: '#8b5cf6' },
  { name: 'Class 8', value: 195, color: '#ec4899' },
  { name: 'Class 7', value: 180, color: '#f59e0b' },
  { name: 'Class 6', value: 165, color: '#10b981' },
];

const recentActivities = [
  { id: 1, type: 'admission', user: 'John Doe', action: 'New student admitted to Class 10-A', time: '5 mins ago', icon: UserPlus, color: 'blue' },
  { id: 2, type: 'fee', user: 'Sarah Wilson', action: 'Fee payment received - $500', time: '12 mins ago', icon: DollarSign, color: 'green' },
  { id: 3, type: 'exam', user: 'Mike Johnson', action: 'Published results for Mid-Term Physics', time: '1 hour ago', icon: Award, color: 'purple' },
  { id: 4, type: 'class', user: 'Emily Davis', action: 'Created new class: Class 11-C', time: '2 hours ago', icon: BookOpen, color: 'orange' },
  { id: 5, type: 'user', user: 'Admin', action: 'Added new teacher: Robert Brown', time: '3 hours ago', icon: Users, color: 'slate' },
];

const initialEvents = [
  { id: 1, title: 'Parent-Teacher Meeting', date: '2026-02-15', time: '10:00 AM', attendees: 45, status: 'confirmed' },
  { id: 2, title: 'Annual Sports Day', date: '2026-02-20', time: '9:00 AM', attendees: 320, status: 'confirmed' },
  { id: 3, title: 'Science Fair', date: '2026-02-25', time: '2:00 PM', attendees: 150, status: 'pending' },
  { id: 4, title: 'Board Meeting', date: '2026-03-01', time: '3:00 PM', attendees: 12, status: 'confirmed' },
];

const topPerformers = [
  { id: 1, name: 'Alice Johnson', class: '10-A', score: 98.5, rank: 1 },
  { id: 2, name: 'Bob Smith', class: '10-B', score: 97.2, rank: 2 },
  { id: 3, name: 'Charlie Davis', class: '9-A', score: 96.8, rank: 3 },
  { id: 4, name: 'Diana Prince', class: '10-A', score: 95.9, rank: 4 },
  { id: 5, name: 'Evan Wright', class: '9-B', score: 95.1, rank: 5 },
];

const StatCard = ({ title, value, icon, color, trend, footer, subtitle }) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-all hover:scale-[1.02] cursor-pointer">
    <div className="flex justify-between items-start">
      <div>
        <p className="text-slate-600 text-sm font-medium">{title}</p>
        <h3 className="text-3xl font-bold text-slate-900 mt-2">{value}</h3>
        {subtitle && <p className="text-xs text-slate-500 mt-1">{subtitle}</p>}
      </div>
      <div className={`p-3 rounded-xl ${color}`}>
        <div className="text-white">{icon}</div>
      </div>
    </div>
    {footer && (
      <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-2">
        <span className="text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 border border-emerald-200">
          <TrendingUp size={12} /> {trend}
        </span>
        <span className="text-slate-500 text-xs">{footer}</span>
      </div>
    )}
  </div>
);

function Home() {

  const { users, classes, fees, newUsers } = useSelector((state) => state.getData)
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [events, setEvents] = useState(initialEvents);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);

  const dispatch = useDispatch()

  useEffect(() => {
    if (!users) {
      dispatch(getUserRedux())
    }
    if (!classes) {
      dispatch(getClassesRedux())
    }
    if (!fees) {
      dispatch(getFeesRedux())
    }
    if (!newUsers) {
      dispatch(getNewUserRedux())
    }
  }, [dispatch])

  const getTotalFee = () => {
    if (!users || !fees) return { totalFees: 0, pendingFee: 0 };

    // ✅ Get only students
    const students = users?.filter((u) => u.type === "student");

    let totalFees = 0;
    let pendingFee = 0;

    students.forEach((stu) => {
      if (!Array.isArray(stu.fees)) return;

      stu.fees.forEach((fe) => {
        const mainFee = fees?.find((f) => f.id == fe.feeId);
        if (!mainFee) return;

        const totalAmount = Number(mainFee.totalAmount) || 0;
        const paidAmount = Number(fe.paidAmount) || 0;

        totalFees += totalAmount;

        if (fe.status === "pending") {
          pendingFee += totalAmount - paidAmount;
        }
      });
    });

    return { totalFees, pendingFee };
  };


  const handleSaveEvent = (eventData) => {
    if (editingEvent) {
      setEvents(events.map(e => e.id === editingEvent.id ? { ...e, ...eventData } : e));
    } else {
      const event = {
        id: events.length + 1,
        ...eventData
      };
      setEvents([...events, event]);
    }
    setIsModalOpen(false);
    setEditingEvent(null);
  };

  const handleEditEvent = (event) => {
    setEditingEvent(event);
    setIsModalOpen(true);
  };

  const getActivityColor = (color) => {
    const colors = {
      blue: 'bg-blue-100 text-blue-600',
      green: 'bg-emerald-100 text-emerald-600',
      purple: 'bg-purple-100 text-purple-600',
      orange: 'bg-orange-100 text-orange-600',
      slate: 'bg-slate-100 text-slate-600',
    };
    return colors[color] || colors.slate;
  };

  const handleApi = async () => {
    const response = await axios.post("http://localhost:3000/createNewUser");
    console.log(response)
  }

  console.log(newUsers)

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">School Overview</h1>
          <p className="text-slate-600 text-sm">Executive Dashboard • Last updated: {new Date().toLocaleTimeString()}</p>
        </div>
        <div className="flex gap-3">
          <select
            className="bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-xl text-sm font-medium hover:bg-slate-50 outline-none cursor-pointer"
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
          >
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="year">This Year</option>
          </select>
          <button onClick={handleApi} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors">
            Download Reports
          </button>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Students"
          value={users?.length}
          subtitle="Across 24 classes"
          icon={<Users size={24} />}
          color="bg-blue-600"
          trend="+12%"
          footer="vs last year"
        />
        <StatCard
          title="Total Staff"
          value={users?.filter((u) => u.type != "parent" && u.type != "student")?.length}
          subtitle="62 Teachers, 22 Admin"
          icon={<GraduationCap size={24} />}
          color="bg-purple-600"
          trend="+2%"
          footer="Stable"
        />
        <StatCard
          title="Fee Collection"
          value={getTotalFee()?.totalFees}
          subtitle={`${((getTotalFee()?.totalFees - getTotalFee()?.pendingFee) / getTotalFee()?.totalFees).toFixed(2)}% collected`}
          icon={<Banknote size={24} />}
          color="bg-emerald-600"
          trend="+8%"
          footer="Current Month"
        />
        <StatCard
          title="New Admissions"
          value={newUsers?.length || 0}
          subtitle="42 pending approval"
          icon={<UserPlus size={24} />}
          color="bg-orange-600"
          trend="+15%"
          footer="Applications"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-slate-900">Financial Overview</h3>
            <div className="flex gap-2 text-xs">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                <span className="text-slate-600">Revenue</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-rose-500"></div>
                <span className="text-slate-600">Expenses</span>
              </div>
            </div>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Area type="monotone" dataKey="amount" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" />
                <Area type="monotone" dataKey="expenses" stroke="#ef4444" strokeWidth={2} fillOpacity={1} fill="url(#colorExpenses)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Class Distribution Pie Chart */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <h3 className="text-lg font-bold text-slate-900 mb-6">Student Distribution</h3>
          <div className="h-72 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={classDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {classDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  iconType="circle"
                  formatter={(value, entry) => `${value}: ${entry.payload.value}`}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Admissions Growth */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <h3 className="text-lg font-bold text-slate-900 mb-6">Annual Admission Growth</h3>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={admissionData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
              <Tooltip cursor={{ fill: '#f1f5f9' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
              <Bar dataKey="applicants" fill="#94a3b8" radius={[4, 4, 0, 0]} name="Applicants" />
              <Bar dataKey="admitted" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Admitted" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Activities & Upcoming Events */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activities */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-slate-900">Recent Activities</h3>
            <button className="text-blue-600 text-sm font-medium hover:underline">View All</button>
          </div>
          <div className="space-y-3">
            {users?.find((u) => u.type === "principal")?.activity?.length > 0 ? (
              users
                ?.find((u) => u.type === "principal")
                ?.activity?.map((acti, ind) => (
                  <div
                    key={ind}
                    className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors"
                  >
                    {/* Timeline Dot */}
                    <div className="flex flex-col items-center">
                      <div className="w-3 h-3 rounded-full bg-blue-500" />
                      {ind !==
                        users?.find((u) => u.type === "principal")?.activity?.length - 1 && (
                          <div className="w-[1px] flex-1 bg-slate-200 mt-1" />
                        )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-slate-900 font-medium">
                        {acti?.title}
                      </p>

                      {acti?.message && (
                        <p className="text-xs text-slate-500 mt-0.5">
                          {acti.message}
                        </p>
                      )}

                      <p className="text-[11px] text-slate-400 mt-1">
                        {acti?.date
                          ? new Date(acti.date).toLocaleString()
                          : ""}
                      </p>
                    </div>
                  </div>
                ))
            ) : (
              <p className="text-sm text-slate-400 text-center py-6">
                No recent activity
              </p>
            )}
          </div>
        </div>

        {/* Upcoming Events */}
        {/* <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-slate-900">Upcoming Events</h3>
            <button
              onClick={() => {
                setEditingEvent(null);
                setIsModalOpen(true);
              }}
              className="text-blue-600 text-sm font-medium hover:underline flex items-center gap-1"
            >
              <Calendar size={14} /> Add Event
            </button>
          </div>
          <div className="space-y-3">
            {events.map((event) => (
              <div
                key={event.id}
                className="flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:border-blue-300  text-slate-600 transition-colors cursor-pointer group"
                onClick={() => handleEditEvent(event)}
              >
                <div className="flex items-center gap-3">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-slate-900">{new Date(event.date).getDate()}</div>
                    <div className="text-xs text-slate-500 uppercase">{new Date(event.date).toLocaleString('default', { month: 'short' })}</div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 text-sm">{event.title}</h4>
                    <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-2">
                      <Clock size={12} /> {event.time} • {event.attendees} attendees
                    </p>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${event.status === 'confirmed'
                  ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                  : 'bg-amber-100 text-amber-700 border border-amber-200'
                  }`}>
                  {event.status === 'confirmed' ? <CheckCircle size={12} className="inline mr-1" /> : <Clock size={12} className="inline mr-1" />}
                  {event.status}
                </span>
              </div>
            ))}
          </div>
        </div> */}
      </div>

      {/* Top Performers & Notice Board */}
      {/* <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
     
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-slate-900">Top Performers</h3>
            <Award className="text-amber-500" size={20} />
          </div>
          <div className="space-y-3">
            {topPerformers.map((student) => (
              <div key={student.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${student.rank === 1 ? 'bg-amber-100 text-amber-700' :
                    student.rank === 2 ? 'bg-slate-200 text-slate-700' :
                      student.rank === 3 ? 'bg-orange-100 text-orange-700' :
                        'bg-slate-100 text-slate-600'
                    }`}>
                    #{student.rank}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 text-sm">{student.name}</p>
                    <p className="text-xs text-slate-500">Class {student.class}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-slate-900">{student.score}%</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-slate-900">Notice Board</h3>
            <button className="text-blue-600 text-sm font-medium hover:underline flex items-center gap-1">
              <Megaphone size={16} /> Post New
            </button>
          </div>
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-xl border border-blue-200 flex gap-4">
              <div className="h-10 w-10 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center shrink-0">
                <FileText size={20} />
              </div>
              <div>
                <h4 className="font-semibold text-slate-900">Parent-Teacher Meeting Scheduled</h4>
                <p className="text-sm text-slate-700 mt-1">The quarterly PTM is scheduled for next Saturday, 15th Feb. All staff attendance is mandatory.</p>
                <p className="text-xs text-slate-500 mt-2">Posted by Principal • 2 hours ago</p>
              </div>
            </div>
            <div className="p-4 bg-orange-50 rounded-xl border border-orange-200 flex gap-4">
              <div className="h-10 w-10 bg-orange-100 text-orange-600 rounded-lg flex items-center justify-center shrink-0">
                <AlertCircle size={20} />
              </div>
              <div>
                <h4 className="font-semibold text-slate-900">Fee Submission Deadline Extended</h4>
                <p className="text-sm text-slate-700 mt-1">The deadline for Term 2 fees has been extended by 5 days due to bank holidays.</p>
                <p className="text-xs text-slate-500 mt-2">Posted by Admin • 1 day ago</p>
              </div>
            </div>
          </div>
        </div>
      </div> */}

      {/* Quick Governance */}
      {/* <div className="bg-slate-900 p-6 rounded-2xl shadow-lg text-white">
        <h3 className="text-lg font-bold mb-4">Quick Governance</h3>
        <p className="text-slate-400 text-sm mb-6">Direct access to administrative oversight tools.</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <button className="text-left p-4 rounded-xl bg-slate-800 hover:bg-slate-700 transition-colors flex items-center justify-between group">
            <div>
              <span className="font-medium block">Approve Admissions</span>
              <span className="text-slate-400 text-xs">Review pending applications</span>
            </div>
            <span className="bg-blue-600 text-xs px-3 py-1.5 rounded-full group-hover:bg-blue-500">5 Pending</span>
          </button>
          <button className="text-left p-4 rounded-xl bg-slate-800 hover:bg-slate-700 transition-colors flex items-center justify-between group">
            <div>
              <span className="font-medium block">Staff Leave Requests</span>
              <span className="text-slate-400 text-xs">Approve or reject requests</span>
            </div>
            <span className="bg-slate-600 text-gray-300 text-xs px-3 py-1.5 rounded-full group-hover:bg-slate-500">2 New</span>
          </button>
          <button className="text-left p-4 rounded-xl bg-slate-800 hover:bg-slate-700 transition-colors flex items-center justify-between">
            <div>
              <span className="font-medium block">Publish Results</span>
              <span className="text-slate-400 text-xs">Mid-Term examinations</span>
            </div>
            <span className="text-slate-400 text-xs">Ready</span>
          </button>
        </div>
      </div> */}
      <AddEventModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingEvent(null);
        }}
        onSave={handleSaveEvent}
        eventToEdit={editingEvent}
      />
    </div>
  );
}

export default Home;