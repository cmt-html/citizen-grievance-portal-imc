'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/axios';
import AssignmentModal from '@/components/AssignmentModal';

const STATUS_STEPS = ['Submitted', 'Assigned', 'In Progress', 'Resolved', 'Closed'];

export default function AdminDashboard() {
    const [complaints, setComplaints] = useState([]);
    const [metrics, setMetrics] = useState({
        total: 0, pending: 0, resolved: 0, slaBreached: 0
    });
    const [loading, setLoading] = useState(true);
    const [masterConfig, setMasterConfig] = useState(null);
    const [filters, setFilters] = useState({ category: 'All', status: 'All' });
    const [isAssigningId, setIsAssigningId] = useState(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [metricsRes, complaintsRes, configRes] = await Promise.all([
                api.get('departments/dashboard-metrics'),
                api.get('complaints/all'),
                api.get('departments/master-config')
            ]);
            setMetrics(metricsRes.data);
            setComplaints(complaintsRes.data);
            setMasterConfig(configRes.data);
        } catch (error) {
            console.error('Failed to fetch admin data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAssignSuccess = () => {
        setIsAssigningId(null);
        fetchData();
    };

    const visibleComplaints = complaints.filter((c) => {
        const categoryMatch = filters.category === 'All' || c.category === filters.category;
        const statusMatch = filters.status === 'All' || c.status === filters.status;
        return categoryMatch && statusMatch;
    });

    return (
        <div className="hero-gradient min-h-screen p-4 md:p-8">
            <div className="container max-w-6xl mx-auto fade-up">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
                    <div>
                        <span className="soft-badge">Governance Control</span>
                        <h1 className="text-3xl font-extrabold text-slate-800 mt-2">Executive Admin Dashboard</h1>
                    </div>
                </div>
                
                {/* Global Metrics Panel */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-10">
                    <div className="panel p-6 border-l-4 border-l-blue-500">
                        <p className="text-[0.65rem] uppercase font-black text-slate-400 mb-1">Total Dataset</p>
                        <p className="text-3xl font-bold text-slate-800">{metrics.total}</p>
                    </div>
                    <div className="panel p-6 border-l-4 border-l-amber-500">
                        <p className="text-[0.65rem] uppercase font-black text-slate-400 mb-1">Active Pending</p>
                        <p className="text-3xl font-bold text-amber-600">{metrics.pending}</p>
                    </div>
                    <div className="panel p-6 border-l-4 border-l-emerald-500">
                        <p className="text-[0.65rem] uppercase font-black text-slate-400 mb-1">Total Resolved</p>
                        <p className="text-3xl font-bold text-emerald-600">{metrics.resolved}</p>
                    </div>
                    <div className="panel p-6 border-l-4 border-l-red-500">
                        <p className="text-[0.65rem] uppercase font-black text-slate-400 mb-1">SLA Breached</p>
                        <p className="text-3xl font-bold text-red-600">{metrics.slaBreached}</p>
                    </div>
                </div>

                {/* Ticket Management Section */}
                <div className="mb-6 flex flex-col md:flex-row gap-4">
                    <div className="flex-1 glass-panel px-4 py-2 rounded-xl">
                        <select value={filters.category} onChange={(e) => setFilters({ ...filters, category: e.target.value })} className="w-full bg-transparent text-sm font-semibold outline-none">
                            <option>All Categories</option>
                            {masterConfig?.categories.map(c => <option key={c}>{c}</option>)}
                        </select>
                    </div>
                    <div className="flex-1 glass-panel px-4 py-2 rounded-xl">
                        <select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })} className="w-full bg-transparent text-sm font-semibold outline-none">
                            <option>All Statuses</option>
                            {STATUS_STEPS.map(s => <option key={s}>{s}</option>)}
                        </select>
                    </div>
                </div>

                <div className="grid gap-6">
                    {loading ? (
                        <div className="p-20 text-center animate-pulse text-slate-400">Loading Governance Data...</div>
                    ) : visibleComplaints.map((c) => (
                        <div key={c._id} className="panel overflow-hidden border border-slate-200">
                            <div className="bg-slate-50 border-b px-6 py-3 flex justify-between items-center bg-white">
                                <div className="flex items-center gap-3">
                                    <span className="text-xs font-bold text-slate-400">#{c.complaintId}</span>
                                    <span className="text-xs font-black text-blue-600 uppercase">{c.category}</span>
                                </div>
                                <div className="flex items-center gap-1 w-32">
                                    {STATUS_STEPS.map((step, idx) => (
                                        <div key={idx} className={`h-1.5 flex-1 rounded-full ${STATUS_STEPS.indexOf(c.status) >= idx ? 'bg-blue-600' : 'bg-slate-200'}`}></div>
                                    ))}
                                </div>
                                <span className="text-[0.6rem] font-bold text-slate-500 uppercase">{c.status}</span>
                            </div>
                            <div className="p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                                <div className="flex-1">
                                    <h3 className="text-lg font-bold text-slate-800 mb-1">{c.title}</h3>
                                    <p className="text-sm text-slate-500 mb-4 line-clamp-1">{c.description}</p>
                                    <div className="flex gap-4">
                                        <div className="text-[0.65rem] font-bold text-slate-400">
                                            DEPT: <span className="text-slate-600">{c.assignedToDepartment || 'UNASSIGNED'}</span>
                                        </div>
                                        <div className="text-[0.65rem] font-bold text-slate-400">
                                            ZONE: <span className="text-slate-600">{c.assignedToZone || 'UNMAPPED'}</span>
                                        </div>
                                    </div>
                                </div>
                                <button onClick={() => setIsAssigningId(c.complaintId)} className="w-full md:w-auto px-6 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold shadow-lg hover:shadow-slate-900/20 transition active:scale-95">
                                    Manage Assignment
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <AssignmentModal 
                isOpen={!!isAssigningId} 
                onClose={() => setIsAssigningId(null)} 
                complaint={complaints.find(c => c.complaintId === isAssigningId)}
                onAssign={handleAssignSuccess}
            />
        </div>
    );
}
