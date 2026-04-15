'use client';
import { useState, useEffect } from 'react';
import api from '@/lib/axios';

export default function AssignmentModal({ isOpen, onClose, complaint, onAssign }) {
    const [config, setConfig] = useState(null);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        assignedToDepartment: '',
        assignedToZone: '',
        assignedToCouncillor: ''
    });

    useEffect(() => {
        if (!isOpen) return;
        const fetchConfig = async () => {
            try {
                const res = await api.get('/departments/master-config');
                setConfig(res.data);
                if (complaint) {
                    setFormData({
                        assignedToDepartment: complaint.assignedToDepartment || '',
                        assignedToZone: complaint.assignedToZone || '',
                        assignedToCouncillor: complaint.assignedToCouncillor || ''
                    });
                }
            } catch (err) {
                console.error('Failed to load config');
            } finally {
                setLoading(false);
            }
        };
        fetchConfig();
    }, [isOpen, complaint]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.put(`/complaints/${complaint.complaintId}/reassign`, formData);
            onAssign(complaint.complaintId, formData);
            onClose();
        } catch (err) {
            alert('Failed to reassign ticket');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="panel w-full max-w-md p-6 md:p-8 bg-white shadow-2xl scale-in-center">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-slate-800">Assign Ticket</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition text-2xl">&times;</button>
                </div>

                {loading ? <p className="text-center py-4">Loading options...</p> : (
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 mb-4">
                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Current Ticket</p>
                            <p className="text-sm font-medium text-slate-800">{complaint?.title}</p>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Target Department</label>
                            <select 
                                required
                                value={formData.assignedToDepartment} 
                                onChange={(e) => setFormData({...formData, assignedToDepartment: e.target.value})}
                                className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition"
                            >
                                <option value="">Select Department</option>
                                {config?.departments.map(d => <option key={d} value={d}>{d}</option>)}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Zone / Ward</label>
                            <select 
                                required
                                value={formData.assignedToZone} 
                                onChange={(e) => setFormData({...formData, assignedToZone: e.target.value})}
                                className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition"
                            >
                                <option value="">Select Zone</option>
                                {config?.zones.map(z => <option key={z} value={z}>{z}</option>)}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Assigned Councillor</label>
                            <select 
                                required
                                value={formData.assignedToCouncillor} 
                                onChange={(e) => setFormData({...formData, assignedToCouncillor: e.target.value})}
                                className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition"
                            >
                                <option value="">Select Councillor</option>
                                {config?.councillors.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>

                        <div className="pt-4 flex gap-3">
                            <button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-blue-500/20 transition-all active:scale-95">
                                Update Assignment
                            </button>
                            <button type="button" onClick={onClose} className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold rounded-xl transition">
                                Cancel
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}
