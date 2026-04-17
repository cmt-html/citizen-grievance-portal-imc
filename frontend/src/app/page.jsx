'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function Home() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  // Determine dashboard link based on role
  const getDashboardLink = () => {
    if (!user) return '/login';
    if (user.role === 'admin') return '/admin/dashboard';
    if (user.role === 'department') return '/department/dashboard';
    return '/citizen/dashboard';
  };

  return (
    <div className="hero-gradient flex-1 flex flex-col justify-center py-16 px-4 md:px-8 relative overflow-hidden">
      {/* Abstract background decorative blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-300 mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-emerald-300 mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" style={{animationDelay: '2s'}}></div>

      <section className="container max-w-6xl mx-auto relative z-10 text-center">
        <div className="max-w-4xl mx-auto fade-up">
          <span className="soft-badge mb-6 inline-flex shadow-sm">✨ Smart Governance Platform</span>
          <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 mt-4 leading-tight tracking-tight">
            Next-Gen <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">Citizen Grievance</span> Portal
          </h1>
          <p className="text-slate-600 text-lg md:text-xl mt-6 mx-auto leading-relaxed max-w-2xl font-medium">
            Report civic issues seamlessly with AI-verified geo-tagging. Track resolutions in real-time, backed by a strict 48-hour municipal SLA.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10">
            {user ? (
               <Link href={getDashboardLink()} className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:-translate-y-1 transition-all duration-300 font-semibold text-lg border border-transparent">
               Go to My Dashboard
             </Link>
            ) : (
              <>
                <Link href="/citizen/new-complaint" className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:-translate-y-1 transition-all duration-300 font-semibold text-lg border border-transparent">
                  Raise a Complaint
                </Link>
                <Link href="/login" className="w-full sm:w-auto px-8 py-3.5 bg-white/80 backdrop-blur-md text-slate-800 border border-slate-200/50 rounded-full shadow-sm hover:bg-white hover:-translate-y-1 transition-all duration-300 font-semibold text-lg">
                  Citizen Login
                </Link>
              </>
            )}
          </div>
          
          {!user && (
            <div className="mt-6">
              <Link href="/login" className="text-sm font-medium text-slate-500 hover:text-indigo-600 transition underline underline-offset-4 decoration-slate-300 hover:decoration-indigo-600">
                Department / Admin Access
              </Link>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-20 text-left">
          <div className="panel p-6 bg-white/60 hover:bg-white transition-colors duration-300">
            <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center mb-5 shadow-sm text-2xl">📸</div>
            <p className="text-lg text-slate-800 font-bold mb-2">Smart Geo-tagging</p>
            <p className="text-sm text-slate-600 leading-relaxed">Instant upload interface for image/video evidence, automatically synchronized with high-precision GPS coordinates.</p>
          </div>
          <div className="panel p-6 bg-white/60 hover:bg-white transition-colors duration-300 border-t-4 border-t-indigo-500">
            <div className="w-12 h-12 bg-indigo-100 rounded-2xl flex items-center justify-center mb-5 shadow-sm text-2xl">⚡</div>
            <p className="text-lg text-slate-800 font-bold mb-2">48-Hr Guaranteed SLA</p>
            <p className="text-sm text-slate-600 leading-relaxed">Automated routing to local wards ensuring critical issues are immediately assigned. Escapes to higher authorities post 48 hours.</p>
          </div>
          <div className="panel p-6 bg-white/60 hover:bg-white transition-colors duration-300">
            <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center mb-5 shadow-sm text-2xl">🤝</div>
            <p className="text-lg text-slate-800 font-bold mb-2">Transparent Feedback</p>
            <p className="text-sm text-slate-600 leading-relaxed">Citizens retain final closure rights. Reject incomplete resolutions directly from your dashboard forcing case re-evaluations.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
