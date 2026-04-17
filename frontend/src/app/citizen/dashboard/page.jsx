'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/axios';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AuthGuard from '@/components/AuthGuard';

export default function CitizenDashboard() {
    return (
        <AuthGuard roles={['citizen']}>
            <CitizenDashboardContent />
        </AuthGuard>
    );
}

function CitizenDashboardContent() {
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const fetchHistory = async () => {
            const localComplaints = JSON.parse(localStorage.getItem('demoComplaints') || '[]');
            try {
                const res = await api.get('complaints/my-history');
                setComplaints(res.data);
            } catch (err) {
                if (err.response?.status === 401) {
                    router.push('/login');
                }
            } finally {
                setLoading(false);
            }
        };
        fetchHistory();
    }, [router]);

    const submitFeedback = async (complaintId, decision) => {
        try {
            await api.put(`complaints/${complaintId}/feedback`, { decision });
            const res = await api.get('complaints/my-history');
            setComplaints(res.data);
        } catch (error) {
            alert(error.response?.data?.message || 'Unable to submit feedback');
        }
    };

    return (
        <div className="hero-gradient min-h-screen p-4 md:p-8">
            <div className="container max-w-5xl mx-auto fade-up">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 md:mb-8">
                    <div>
                        <span className="soft-badge">Citizen Dashboard</span>
                        <h1 className="text-2xl md:text-3xl font-bold text-slate-800 mt-2">My Complaints</h1>
                    </div>
                    <Link href="/citizen/new-complaint" className="w-full sm:w-auto text-center bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-semibold shadow transition">
                        + New Complaint
                    </Link>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4 mb-6 md:mb-8">
                    <div className="metric-card">
                        <p className="metric-title">Total Complaints</p>
                        <p className="metric-value">{complaints.length}</p>
                    </div>
                    <div className="metric-card">
                        <p className="metric-title">In Progress</p>
                        <p className="metric-value">{complaints.filter((c) => c.status === 'In Progress').length}</p>
                    </div>
                    <div className="metric-card">
                        <p className="metric-title">Resolved/Closed</p>
                        <p className="metric-value">{complaints.filter((c) => ['Resolved', 'Closed'].includes(c.status)).length}</p>
                    </div>
                </div>

                {loading ? (
                    <div className="text-center py-10">Loading...</div>
                ) : complaints.length === 0 ? (
                    <div className="panel p-10 text-center text-gray-500">
                        No complaints filed yet.
                    </div>
                ) : (
                    <div className="grid gap-4 md:gap-6">
                        {complaints.map(c => (
                            <div key={c._id} className="panel p-5 md:p-6 flex flex-col md:flex-row justify-between items-start md:items-center hover:shadow-md transition gap-4 md:gap-0">
                                <div>
                                    <div className="text-xs text-slate-500 mb-1">{new Date(c.createdAt).toLocaleDateString()} • {c.complaintId}</div>
                                    <h3 className="text-lg md:text-xl font-semibold text-slate-800">{c.title}</h3>
                                    <span className="inline-block mt-2 px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-medium">
                                        {c.category}
                                    </span>
                                    <p className="mt-2 text-xs text-slate-500">Zone: {c.assignedToZone || '-'} | Dept: {c.assignedToDepartment || '-'}</p>
                                </div>
                                <div className="w-full md:w-auto text-left md:text-right border-t md:border-none border-slate-100 pt-3 md:pt-0">
                                    <div className={`inline-block px-4 py-1.5 rounded-full text-xs md:text-sm font-medium ${
                                        c.status === 'Resolved' ? 'bg-green-100 text-green-700' :
                                        c.status === 'In Progress' ? 'bg-blue-100 text-blue-700' :
                                        'bg-yellow-100 text-yellow-700'
                                    }`}>
                                        {c.status}
                                    </div>
                                    <div className="text-[0.7rem] md:text-xs text-slate-400 mt-2 font-medium">Escalation Level: {c.escalationLevel || 0}</div>
                                    {c.status === 'Resolved' && (
                                        <div className="mt-3 flex gap-2 justify-start md:justify-end">
                                            <button onClick={() => submitFeedback(c.complaintId, 'accept')} className="flex-1 md:flex-none px-4 py-2 md:px-3 md:py-1 text-xs md:text-sm font-semibold bg-green-600 text-white rounded-lg">Accept</button>
                                            <button onClick={() => submitFeedback(c.complaintId, 'reject')} className="flex-1 md:flex-none px-4 py-2 md:px-3 md:py-1 text-xs md:text-sm font-semibold bg-orange-600 text-white rounded-lg">Re-open</button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
