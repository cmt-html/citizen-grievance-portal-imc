'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/axios';
import AssignmentModal from '@/components/AssignmentModal';
import AuthGuard from '@/components/AuthGuard';

const STATUS_STEPS = ['Submitted', 'Assigned', 'In Progress', 'Resolved', 'Closed'];

export default function DepartmentDashboard() {
    return (
        <AuthGuard roles={['department', 'admin']}>
            <DepartmentDashboardContent />
        </AuthGuard>
    );
}

function DepartmentDashboardContent() {
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({ category: 'All', status: 'All' });
    const [user, setUser] = useState(null);

    // Assignment & Resolution state
    const [isAssigningId, setIsAssigningId] = useState(null);
    const [resolvingId, setResolvingId] = useState(null);
    const [remarks, setRemarks] = useState('');
    const [proofImage, setProofImage] = useState(null);

    useEffect(() => {
        const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
        setUser(storedUser);
        fetchDashboard();
    }, []);

    const fetchDashboard = async () => {
        try {
            setLoading(true);
            const res = await api.get('complaints/all');
            setComplaints(res.data);
        } catch (error) {
            console.error('Fetch error:', error);
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (id, status) => {
        try {
            await api.put(`complaints/${id}/status`, { status });
            fetchDashboard();
        } catch (error) {
            alert('Failed to update status');
        }
    };

    const submitResolution = async () => {
        if (!remarks) return alert('Remarks are mandatory.');
        try {
            await api.put(`complaints/${resolvingId}/status`, { status: 'Resolved', remarks });
            setResolvingId(null);
            setRemarks('');
            fetchDashboard();
            alert('Complaint marked as Resolved.');
        } catch(err) {
            const msg = err.response?.data?.message || 'Failed to resolve.';
            alert(msg);
        }
    };

    const handleAssignSuccess = (id, newAssign) => {
        setComplaints(complaints.map(c => c.complaintId === id ? { ...c, ...newAssign, status: 'Assigned' } : c));
        setIsAssigningId(null);
    };

    const visibleComplaints = complaints.filter((c) => {
        const categoryMatch = filters.category === 'All' || c.category === filters.category;
        const statusMatch = filters.status === 'All' || c.status === filters.status;
        return categoryMatch && statusMatch;
    });

    const pendingCount = complaints.filter((c) => ['Submitted', 'Assigned', 'In Progress'].includes(c.status)).length;
    const resolvedCount = complaints.filter((c) => ['Resolved', 'Closed'].includes(c.status)).length;

    return (
        <div className="hero-gradient p-4 md:p-8 min-h-screen">
            <div className="container fade-up max-w-6xl">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
                    <div>
                        <span className="soft-badge">Operations Central</span>
                        <h1 className="text-3xl font-extrabold text-slate-800 mt-2">Department Gateway</h1>
                    </div>
                    <div className="flex gap-4 mt-4 md:mt-0">
                        <div className="metric-card px-6 py-2">
                            <p className="text-[0.65rem] uppercase font-bold text-slate-400">Pending</p>
                            <p className="text-xl font-bold text-amber-600">{pendingCount}</p>
                        </div>
                        <div className="metric-card px-6 py-2">
                            <p className="text-[0.65rem] uppercase font-bold text-slate-400">Resolved</p>
                            <p className="text-xl font-bold text-emerald-600">{resolvedCount}</p>
                        </div>
                    </div>
                </div>
            
                <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="glass-panel p-1 rounded-xl flex">
                        <select value={filters.category} onChange={(e) => setFilters({ ...filters, category: e.target.value })} className="w-full bg-transparent px-4 py-2 text-sm outline-none">
                            <option>All Categories</option>
                            <option>Sanitation</option>
                            <option>Traffic</option>
                            <option>Police</option>
                            <option>Civic Infrastructure</option>
                            <option>Others</option>
                        </select>
                    </div>
                    <div className="glass-panel p-1 rounded-xl flex">
                        <select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })} className="w-full bg-transparent px-4 py-2 text-sm outline-none">
                            <option>All Statuses</option>
                            {STATUS_STEPS.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>
                </div>
            
                <div className="grid gap-6">
                    {loading ? (
                        <div className="p-20 text-center animate-pulse text-slate-400 font-medium">Synchronizing Dataset...</div>
                    ) : visibleComplaints.length === 0 ? (
                        <div className="panel p-20 text-center text-slate-400">No active tickets matching the selected criteria.</div>
                    ) : visibleComplaints.map((c) => (
                        <div key={c._id} className="panel overflow-hidden border-l-4 border-l-blue-500 shadow-xl hover:shadow-blue-500/10 transition-all duration-300">
                            {/* Pipeline Header */}
                            <div className="bg-slate-50/50 border-bottom px-6 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-mono font-bold text-slate-400">#{c.complaintId}</span>
                                    <div className="h-1.5 w-1.5 rounded-full bg-slate-300"></div>
                                    <span className="text-xs font-bold text-blue-600 uppercase tracking-wide">{c.category}</span>
                                </div>
                                <div className="flex items-center gap-1 w-full md:w-auto max-w-md">
                                    {STATUS_STEPS.map((step, idx) => {
                                        const isCurrent = c.status === step;
                                        const isPast = STATUS_STEPS.indexOf(c.status) > idx;
                                        return (
                                            <div key={step} className="flex-1 flex items-center group">
                                                <div className={`h-2 flex-grow rounded-full transition-colors ${isCurrent ? 'bg-blue-600' : isPast ? 'bg-emerald-500' : 'bg-slate-200'}`}></div>
                                                {idx < STATUS_STEPS.length - 1 && <div className="w-1"></div>}
                                            </div>
                                        )
                                    })}
                                </div>
                                <div className="text-[0.6rem] font-black uppercase text-slate-500">{c.status}</div>
                            </div>

                            <div className="p-6">
                                <div className="flex flex-col md:flex-row gap-6">
                                    <div className="flex-1">
                                        <h3 className="text-xl font-bold text-slate-800 mb-2">{c.title}</h3>
                                        <p className="text-sm text-slate-600 leading-relaxed mb-4">{c.description}</p>
                                        
                                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
                                            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                                                <p className="text-[0.6rem] uppercase font-bold text-slate-400 mb-0.5">Location</p>
                                                <p className="text-xs font-semibold text-slate-700 truncate">{c.address || 'GPS Tagged'}</p>
                                            </div>
                                            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                                                <p className="text-[0.6rem] uppercase font-bold text-slate-400 mb-0.5">Assigned To</p>
                                                <p className="text-xs font-semibold text-slate-700 truncate">{c.assignedToDepartment || 'Unassigned'}</p>
                                            </div>
                                            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 column-span-2">
                                                <p className="text-[0.6rem] uppercase font-bold text-slate-400 mb-0.5">SLA Deadline</p>
                                                <p className="text-xs font-semibold text-red-600 truncate">48 Hours (Resolution Gap)</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Panel */}
                                    <div className="w-full md:w-64 flex flex-col gap-3 justify-center">
                                        {c.status === 'Submitted' && (
                                            <button onClick={() => updateStatus(c.complaintId, 'Assigned')} className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold shadow-lg shadow-blue-500/20 hover:scale-[1.02] transition">Accept Ticket</button>
                                        )}
                                        {c.status === 'Assigned' && (
                                            <button onClick={() => updateStatus(c.complaintId, 'In Progress')} className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold shadow-lg shadow-indigo-500/20 hover:scale-[1.02] transition">⚡ Start Progress</button>
                                        )}
                                        {c.status === 'In Progress' && (
                                            <button onClick={() => setResolvingId(c.complaintId)} className="w-full bg-emerald-600 text-white py-3 rounded-xl font-bold shadow-lg shadow-emerald-500/20 hover:scale-[1.02] transition">✅ Mark Resolved</button>
                                        )}
                                        {c.status === 'Resolved' && (
                                            <div className="text-center p-3 bg-emerald-50 text-emerald-700 rounded-xl text-xs font-bold border border-emerald-100">Pending Citizen Closure</div>
                                        )}
                                        
                                        {user?.role === 'admin' && (
                                            <button onClick={() => setIsAssigningId(c.complaintId)} className="w-full border border-slate-200 text-slate-500 py-2.5 rounded-xl text-xs font-bold hover:bg-slate-50 transition">🔄 Reassign Ticket</button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Assignment Modal */}
            <AssignmentModal 
                isOpen={!!isAssigningId} 
                onClose={() => setIsAssigningId(null)} 
                complaint={complaints.find(c => c.complaintId === isAssigningId)}
                onAssign={handleAssignSuccess}
            />

            {/* Internal Resolution Modal */}
            {resolvingId && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="panel w-full max-w-md p-6 md:p-8 bg-white shadow-2xl scale-in-center">
                        <h2 className="text-xl font-bold text-slate-800 mb-2">Finalize Resolution</h2>
                        <p className="text-sm text-slate-500 mb-6">Provide conclusive details of the work performed.</p>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Action Taken Remarks</label>
                                <textarea 
                                    required
                                    rows="4"
                                    value={remarks}
                                    onChange={(e) => setRemarks(e.target.value)}
                                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
                                    placeholder="Briefly describe how the issue was resolved..."
                                />
                            </div>
                            <div className="pt-4 flex gap-3">
                                <button onClick={submitResolution} className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-emerald-500/20 transition-all active:scale-95">
                                    Confirm Resolution
                                </button>
                                <button onClick={() => setResolvingId(null)} className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold rounded-xl transition">
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
