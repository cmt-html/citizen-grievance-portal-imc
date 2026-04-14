'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/axios';

export default function DepartmentDashboard() {
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({ category: 'All', status: 'All' });

    // Active resolution state tracking for inline forms
    const [resolvingId, setResolvingId] = useState(null);
    const [remarks, setRemarks] = useState('');
    const [proofImage, setProofImage] = useState(null);

    useEffect(() => {
        const fetchDashboard = async () => {
            try {
                const res = await api.get('/complaints/all');
                setComplaints(res.data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchDashboard();
    }, []);

    const updateStatus = async (id, status) => {
        try {
            await api.put(`/complaints/${id}/status`, { status });
            // refresh list locally
            setComplaints(complaints.map(c => c.complaintId === id ? { ...c, status } : c));
        } catch (error) {
            alert('Failed to update status');
        }
    };

    const submitResolution = async (id) => {
        if (!remarks) return alert('Remarks are mandatory for resolution.');
        if (!proofImage) return alert('Proof of resolution (image) is required.');
        
        try {
            // Simulated multipart upload
            const data = new FormData();
            data.append('status', 'Resolved');
            data.append('remarks', remarks);
            data.append('proof', proofImage);

            await api.put(`/complaints/${id}/status`, { status: 'Resolved', remarks });
            setComplaints(complaints.map(c => c.complaintId === id ? { ...c, status: 'Resolved' } : c));
            setResolvingId(null);
            setRemarks('');
            setProofImage(null);
            alert('Complaint Resolved successfully with proof!');
        } catch(err) {
            alert('Failed to submit resolution proof.');
        }
    };

    const decision = async (id, action) => {
        try {
            await api.put(`/complaints/${id}/decision`, { action });
            const res = await api.get('/complaints/all');
            setComplaints(res.data);
        } catch (error) {
            alert('Failed to process complaint');
        }
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
            <div className="container fade-up max-w-5xl">
            <span className="soft-badge">Department Operations</span>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-800 mt-2 mb-6 md:mb-8">Department Dashboard</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4 mb-6">
                <div className="metric-card">
                    <p className="metric-title">Total Assigned</p>
                    <p className="metric-value">{complaints.length}</p>
                </div>
                <div className="metric-card">
                    <p className="metric-title">Pending Tasks</p>
                    <p className="metric-value text-amber-600">{pendingCount}</p>
                </div>
                <div className="metric-card">
                    <p className="metric-title">Resolved/Closed</p>
                    <p className="metric-value text-emerald-600">{resolvedCount}</p>
                </div>
            </div>
            
            <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-3">
                <select value={filters.category} onChange={(e) => setFilters({ ...filters, category: e.target.value })} className="w-full px-3 py-2.5 border border-slate-300 rounded-lg bg-white text-sm">
                    <option>All</option>
                    <option>Sanitation</option>
                    <option>Traffic</option>
                    <option>Police</option>
                    <option>Civic Infrastructure</option>
                    <option>Others</option>
                </select>
                <select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })} className="w-full px-3 py-2.5 border border-slate-300 rounded-lg bg-white text-sm">
                    <option>All</option>
                    <option>Submitted</option>
                    <option>Assigned</option>
                    <option>In Progress</option>
                    <option>Resolved</option>
                    <option>Closed</option>
                </select>
            </div>
            
            <div className="grid gap-4 md:gap-6">
                {loading ? <p className="text-center py-10 opacity-70">Loading dataset...</p> : visibleComplaints.map((c) => {
                    const isResolving = resolvingId === c.complaintId;
                    
                    return (
                    <div key={c._id} className="panel p-5 md:p-6">
                        <div className="flex flex-col md:flex-row md:justify-between items-start mb-4 gap-3 md:gap-0">
                            <div className="w-full">
                                <div className="flex justify-between items-start w-full">
                                    <h3 className="text-lg md:text-xl font-semibold mb-1 pr-2">{c.title}</h3>
                                    <span className={`px-2.5 py-1 rounded-full text-[0.7rem] uppercase font-bold border whitespace-nowrap self-start ${
                                        c.status === 'Resolved' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-yellow-50 text-yellow-700 border-yellow-200'
                                    }`}>
                                        {c.status}
                                    </span>
                                </div>
                                <p className="text-xs md:text-sm text-gray-500">ID: {c.complaintId} &bull; Category: {c.category}</p>
                                <p className="text-xs text-gray-500 mt-1">Location: {c.assignedToZone || '-'} | Area: {c.address || '-'}</p>
                                <div className="flex items-center gap-2 mt-2">
                                    <span className="text-[0.65rem] px-2 py-0.5 bg-red-100 text-red-700 rounded font-medium">SLA: 48h Limit</span>
                                    <span className="text-xs text-slate-500">Escalation: Level {c.escalationLevel || 0}</span>
                                </div>
                            </div>
                        </div>
                        <p className="text-sm text-gray-700 mb-4 bg-slate-50 p-3 rounded-lg border border-slate-100 break-words">{c.description}</p>
                        
                        {/* Resolution Flow Interface */}
                        {isResolving ? (
                            <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-100 mt-4 animate-fadeUp">
                                <h4 className="text-sm font-semibold text-emerald-800 mb-2">Complete Resolution</h4>
                                <div className="space-y-3">
                                    <textarea 
                                        placeholder="Add resolution remarks..." 
                                        rows="2" 
                                        value={remarks}
                                        onChange={(e) => setRemarks(e.target.value)}
                                        className="w-full p-2 text-sm border border-emerald-200 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500" 
                                    />
                                    <div>
                                        <label className="block text-xs font-medium text-emerald-700 mb-1">Upload Work Completion Proof (Image)</label>
                                        <input type="file" accept="image/*" onChange={(e) => setProofImage(e.target.files[0])} className="w-full text-xs file:mr-2 file:py-1.5 file:px-3 file:rounded file:border-0 file:bg-emerald-600 file:text-white" />
                                    </div>
                                    <div className="flex gap-2 pt-2">
                                        <button onClick={() => submitResolution(c.complaintId)} className="flex-1 bg-emerald-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-emerald-700 transition">Submit Proof & Resolve</button>
                                        <button onClick={() => setResolvingId(null)} className="px-3 bg-white text-emerald-700 border border-emerald-200 rounded-lg text-sm font-medium">Cancel</button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            c.status !== 'Resolved' && (
                                <div className="flex flex-wrap gap-2 mt-4">
                                    <button onClick={() => updateStatus(c.complaintId, 'Assigned')} className="flex-1 md:flex-none px-4 py-2 border border-slate-200 text-slate-700 bg-white rounded-lg text-xs md:text-sm font-medium hover:bg-slate-50 transition">Accept Ticket</button>
                                    <button onClick={() => updateStatus(c.complaintId, 'In Progress')} className="flex-1 md:flex-none px-4 py-2 bg-blue-50 text-blue-700 border border-blue-100 rounded-lg text-xs md:text-sm font-medium hover:bg-blue-100 transition">Mark In Progress</button>
                                    <button onClick={() => setResolvingId(c.complaintId)} className="w-full md:w-auto px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-semibold hover:bg-emerald-700 transition order-first md:order-last">Resolve Issue</button>
                                </div>
                            )
                        )}
                    </div>
                )})}
            </div>
            </div>
        </div>
    );
}
