'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/axios';

export default function AdminDashboard() {
    const [metrics, setMetrics] = useState({
        total: 0, pending: 0, resolved: 0, slaBreached: 0
    });
    const [loading, setLoading] = useState(true);
    const [report, setReport] = useState(null);
    const [masterConfig, setMasterConfig] = useState(null);

    useEffect(() => {
        const fetchMetrics = async () => {
            try {
                const [metricsRes, reportRes, configRes] = await Promise.all([
                    api.get('/departments/dashboard-metrics'),
                    api.get('/departments/reports/summary'),
                    api.get('/departments/master-config')
                ]);
                setMetrics(metricsRes.data);
                setReport(reportRes.data);
                setMasterConfig(configRes.data);
            } catch (error) {
                console.error('Failed to fetch metrics:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchMetrics();
    }, []);

    return (
        <div className="hero-gradient min-h-screen p-4 md:p-8">
            <div className="container max-w-6xl mx-auto fade-up">
                <span className="soft-badge">Admin Governance</span>
                <h1 className="text-2xl md:text-3xl font-bold text-slate-800 mt-2 mb-6 md:mb-8">Admin Overview Dashboard</h1>
                
                {loading ? (
                    <div className="text-center py-10">Loading Metrics...</div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8 md:mb-10">
                        <div className="panel p-5 md:p-6 flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500 mb-1">Total Complaints</p>
                                <p className="text-3xl font-bold text-gray-800">{metrics.total}</p>
                            </div>
                            <div className="bg-primary-50 p-3 rounded-lg text-primary-600 text-xl">📊</div>
                        </div>

                        <div className="panel p-5 md:p-6 flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500 mb-1">Pending Resolution</p>
                                <p className="text-3xl font-bold text-yellow-600">{metrics.pending}</p>
                            </div>
                            <div className="bg-yellow-50 p-3 rounded-lg text-yellow-600 text-xl">⏳</div>
                        </div>

                        <div className="panel p-5 md:p-6 flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500 mb-1">Successfully Resolved</p>
                                <p className="text-3xl font-bold text-green-600">{metrics.resolved}</p>
                            </div>
                            <div className="bg-green-50 p-3 rounded-lg text-green-600 text-xl">✅</div>
                        </div>

                        <div className="panel p-5 md:p-6 flex items-center justify-between relative overflow-hidden border-red-200">
                            <div className="absolute top-0 right-0 w-2 h-full bg-red-500"></div>
                            <div>
                                <p className="text-sm font-medium text-gray-500 mb-1">SLA Breaches (48h+)</p>
                                <p className="text-3xl font-bold text-red-600">{metrics.slaBreached}</p>
                            </div>
                            <div className="bg-red-50 p-3 rounded-lg text-red-600 text-xl">⚠️</div>
                        </div>
                    </div>
                )}

                <div className="panel p-8 text-center text-gray-500">
                    <p className="font-semibold text-gray-700 mb-6">Master Configuration</p>
                    {masterConfig ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-left">
                            <div>
                                <p className="text-sm font-medium mb-2">Departments</p>
                                <ul className="text-sm text-gray-600 space-y-1">{masterConfig.departments.map((item) => <li key={item}>- {item}</li>)}</ul>
                            </div>
                            <div>
                                <p className="text-sm font-medium mb-2">Zones / Wards</p>
                                <ul className="text-sm text-gray-600 space-y-1">{masterConfig.zones.map((item) => <li key={item}>- {item}</li>)}</ul>
                            </div>
                        </div>
                    ) : <p className="text-sm">Unable to load master config.</p>}
                </div>
                <div className="panel p-8 mt-6 text-left">
                    <p className="font-semibold text-gray-700 mb-6">Reporting & Analytics (POC)</p>
                    {!report ? <p className="text-sm text-gray-500">Loading report...</p> : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <p className="text-sm font-medium mb-2">Department-wise</p>
                                <ul className="text-sm text-gray-600 space-y-1">{Object.entries(report.byDepartment).map(([key, value]) => <li key={key}>{key}: {value}</li>)}</ul>
                            </div>
                            <div>
                                <p className="text-sm font-medium mb-2">Category-wise</p>
                                <ul className="text-sm text-gray-600 space-y-1">{Object.entries(report.byCategory).map(([key, value]) => <li key={key}>{key}: {value}</li>)}</ul>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
