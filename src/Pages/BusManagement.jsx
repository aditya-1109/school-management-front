import React, { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getBusRedux } from '../../redux/getData';
import { apiFunction } from '../../api/apiFunction';
import { createBusApi, updateBusApi, deleteBusApi } from '../../api/apis';
import Toast from '../Components/Toast';
import { Edit, Trash2, Plus, Search, Bus, User, Phone, Users, MapPin, X } from 'lucide-react';

const BusManagement = () => {
    const schoolId = localStorage.getItem('schoolId');
    const dispatch = useDispatch();
    const { buses } = useSelector((state) => state.getData);

    const [toast, setToast] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingBus, setEditingBus] = useState(null);
    const [newStop, setNewStop] = useState('');

    const [busForm, setBusForm] = useState({
        busNumber: '',
        driverName: '',
        driverPhone: '',
        capacity: 0,
        route: [],
        schoolId: schoolId || ''
    });

    useEffect(() => {
        if (!buses) {
            dispatch(getBusRedux());
        }
    }, [dispatch, buses]);

    const showToast = (message, type = 'success') => setToast({ message, type });

    const filteredBuses = useMemo(() => {
        let list = buses || [];
        // Filter by current schoolId
        list = list.filter(bus => String(bus.schoolId) === String(schoolId));
        
        if (searchQuery.trim() !== '') {
            const query = searchQuery.toLowerCase();
            return list.filter(bus => 
                bus.busNumber.toLowerCase().includes(query) ||
                bus.driverName.toLowerCase().includes(query) ||
                bus.driverPhone.includes(query)
            );
        }
        return list;
    }, [buses, searchQuery, schoolId]);

    const handleOpenCreateModal = () => {
        setEditingBus(null);
        setBusForm({
            busNumber: '',
            driverName: '',
            driverPhone: '',
            capacity: 0,
            route: [],
            schoolId: schoolId || ''
        });
        setNewStop('');
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (bus) => {
        setEditingBus(bus);
        setBusForm({
            busNumber: bus.busNumber,
            driverName: bus.driverName,
            driverPhone: bus.driverPhone,
            capacity: bus.capacity,
            route: Array.isArray(bus.route) ? [...bus.route] : [],
            schoolId: schoolId || ''
        });
        setNewStop('');
        setIsModalOpen(true);
    };

    const handleAddStop = () => {
        if (newStop.trim() !== '') {
            setBusForm(prev => ({
                ...prev,
                route: [...prev.route, newStop.trim()]
            }));
            setNewStop('');
        }
    };

    const handleRemoveStop = (index) => {
        setBusForm(prev => ({
            ...prev,
            route: prev.route.filter((_, idx) => idx !== index)
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!busForm.busNumber || !busForm.driverName || !busForm.driverPhone) {
            showToast('Please fill all required fields', 'error');
            return;
        }

        const payload = {
            data: {
                busNumber: busForm.busNumber,
                driverName: busForm.driverName,
                driverPhone: busForm.driverPhone,
                capacity: parseInt(busForm.capacity) || 0,
                route: busForm.route,
                schoolId: schoolId
            }
        };

        let response;
        if (editingBus) {
            response = await apiFunction(updateBusApi, [editingBus.id], payload, 'put', true);
        } else {
            response = await apiFunction(createBusApi, [], payload, 'post', true);
        }

        if (response.success) {
            showToast(response.message || 'Success', 'success');
            dispatch(getBusRedux());
            setIsModalOpen(false);
        } else {
            showToast(response.message || 'Error occurred', 'error');
        }
    };

    const handleDelete = async (id) => {
        if (confirm('Are you sure you want to delete this bus?')) {
            const response = await apiFunction(deleteBusApi, [id], {}, 'delete', true);
            if (response.success) {
                showToast(response.message || 'Bus deleted successfully', 'success');
                dispatch(getBusRedux());
            } else {
                showToast(response.message || 'Error occurred', 'error');
            }
        }
    };

    return (
        <div className="p-6 space-y-6">
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Bus Management</h1>
                    <p className="text-slate-600 text-sm">Manage school transport buses and routing schedules</p>
                </div>
                <button
                    onClick={handleOpenCreateModal}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-medium flex items-center gap-2 shadow-sm transition-all duration-300"
                >
                    <Plus size={20} /> Add Bus
                </button>
            </div>

            {/* Search Bar */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 flex items-center justify-between">
                <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-xl text-slate-600 border border-slate-200 w-full max-w-md focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
                    <Search className="text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search by bus number, driver..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="bg-transparent border-none outline-none text-sm w-full text-slate-900 placeholder-slate-400"
                    />
                </div>
                <div className="text-sm text-slate-500 font-medium">
                    Total: {filteredBuses.length} {filteredBuses.length === 1 ? 'Bus' : 'Buses'}
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-700">
                        <thead className="bg-slate-50 text-slate-600 uppercase font-semibold text-xs border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-4">Bus Details</th>
                                <th className="px-6 py-4">Driver info</th>
                                <th className="px-6 py-4 text-center">Capacity</th>
                                <th className="px-6 py-4">Route Stops</th>
                                <th className="px-6 py-4 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredBuses.map((bus) => (
                                <tr key={bus.id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 border border-blue-100 shadow-sm">
                                                <Bus size={20} />
                                            </div>
                                            <div>
                                                <div className="font-semibold text-slate-900">{bus.busNumber}</div>
                                                <div className="text-xs text-slate-400">ID: {bus.id}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-1.5 font-medium text-slate-800">
                                                <User size={14} className="text-slate-400" />
                                                {bus.driverName}
                                            </div>
                                            <div className="flex items-center gap-1.5 text-xs text-slate-500">
                                                <Phone size={12} className="text-slate-400" />
                                                {bus.driverPhone}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100">
                                            <Users size={12} />
                                            {bus.capacity} seats
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 max-w-xs">
                                        {Array.isArray(bus.route) && bus.route.length > 0 ? (
                                            <div className="flex flex-wrap gap-1.5">
                                                {bus.route.map((stop, idx) => (
                                                    <span
                                                        key={idx}
                                                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-medium bg-slate-100 text-slate-600 border border-slate-200"
                                                    >
                                                        <MapPin size={10} className="text-slate-400" />
                                                        {stop}
                                                    </span>
                                                ))}
                                            </div>
                                        ) : (
                                            <span className="text-xs text-slate-400 italic">No route registered</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex justify-center gap-2">
                                            <button
                                                onClick={() => handleOpenEditModal(bus)}
                                                className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                                title="Edit Bus"
                                            >
                                                <Edit size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(bus.id)}
                                                className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                                                title="Delete Bus"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredBuses.length === 0 && (
                                <tr>
                                    <td colSpan="5" className="text-center py-12 text-slate-400 italic">
                                        No buses registered. Click "Add Bus" to create one.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div
                    onClick={() => setIsModalOpen(false)}
                    className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4"
                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200"
                    >
                        {/* Modal Header */}
                        <div className="flex justify-between items-center p-6 border-b border-slate-100">
                            <div>
                                <h2 className="text-xl font-bold text-slate-900">
                                    {editingBus ? 'Edit Bus' : 'Add New Bus'}
                                </h2>
                                <p className="text-xs text-slate-500 mt-0.5">
                                    Provide transport details to register bus
                                </p>
                            </div>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="text-slate-400 hover:text-slate-600 bg-slate-50 hover:bg-slate-100 p-2 rounded-xl transition-all"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs font-semibold text-slate-600">Bus Number *</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. MH-12-AB-1234"
                                        value={busForm.busNumber}
                                        onChange={(e) => setBusForm({ ...busForm, busNumber: e.target.value })}
                                        className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm text-slate-800"
                                        required
                                    />
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs font-semibold text-slate-600">Passenger Capacity</label>
                                    <input
                                        type="number"
                                        placeholder="e.g. 40"
                                        value={busForm.capacity || ''}
                                        onChange={(e) => setBusForm({ ...busForm, capacity: parseInt(e.target.value) || 0 })}
                                        className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm text-slate-800"
                                    />
                                </div>
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-semibold text-slate-600">Driver Name *</label>
                                <input
                                    type="text"
                                    placeholder="Enter driver's name"
                                    value={busForm.driverName}
                                    onChange={(e) => setBusForm({ ...busForm, driverName: e.target.value })}
                                    className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm text-slate-800"
                                    required
                                />
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-semibold text-slate-600">Driver Phone *</label>
                                <input
                                    type="tel"
                                    placeholder="Enter driver's phone"
                                    value={busForm.driverPhone}
                                    onChange={(e) => setBusForm({ ...busForm, driverPhone: e.target.value })}
                                    className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm text-slate-800"
                                    required
                                />
                            </div>

                            {/* Route Stops Section */}
                            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Route Stops</label>
                                
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        placeholder="Add bus stop..."
                                        value={newStop}
                                        onChange={(e) => setNewStop(e.target.value)}
                                        className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-lg outline-none text-xs"
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault();
                                                handleAddStop();
                                            }
                                        }}
                                    />
                                    <button
                                        type="button"
                                        onClick={handleAddStop}
                                        className="px-3.5 py-2 bg-slate-800 text-white rounded-lg text-xs font-semibold hover:bg-slate-900 transition-colors"
                                    >
                                        Add
                                    </button>
                                </div>

                                <div className="space-y-1.5 max-h-36 overflow-y-auto scrollbar-thin">
                                    {busForm.route.map((stop, index) => (
                                        <div
                                            key={index}
                                            className="flex justify-between items-center px-3 py-1.5 bg-white border border-slate-100 rounded-lg text-xs"
                                        >
                                            <span className="flex items-center gap-1.5 font-medium text-slate-700">
                                                <span className="text-[10px] text-slate-400 font-bold bg-slate-100 px-1.5 py-0.5 rounded">
                                                    {index + 1}
                                                </span>
                                                {stop}
                                            </span>
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveStop(index)}
                                                className="text-rose-500 hover:text-rose-700 transition-colors"
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    ))}
                                    {busForm.route.length === 0 && (
                                        <p className="text-[11px] text-slate-400 italic text-center py-2">
                                            No stops added yet.
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Modal Footer */}
                            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-5 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold shadow-md transition-all"
                                >
                                    {editingBus ? 'Update Bus' : 'Create Bus'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BusManagement;
