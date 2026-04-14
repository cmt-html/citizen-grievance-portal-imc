'use client';
import { useState } from 'react';
import api from '@/lib/axios';
import { useRouter } from 'next/navigation';

export default function Login() {
    const [mode, setMode] = useState('login');
    const [mobileNumber, setMobileNumber] = useState('');
    const [otp, setOtp] = useState('');
    const [step, setStep] = useState(1); // 1: Mobile, 2: OTP
    const [demoOtp, setDemoOtp] = useState('');
    const [profile, setProfile] = useState({
        name: '',
        email: '',
        address: '',
        role: 'citizen',
        departmentType: '',
        zone: ''
    });
    const [error, setError] = useState('');
    const router = useRouter();
    const DEMO_OTP = '1234';

    const isValidMobile = /^\d{10}$/.test(mobileNumber);

    const handleSendOtp = async (e) => {
        e.preventDefault();
        setError('');
        if (!isValidMobile) {
            setError('Please enter a valid 10-digit mobile number.');
            return;
        }
        try {
            const res = await api.post('/auth/send-otp', { mobileNumber, action: mode });
            setDemoOtp(res.data.demoOtp || '');
            setStep(2);
        } catch (err) {
            // Demo fallback for offline / no-backend usage
            setDemoOtp(DEMO_OTP);
            setStep(2);
        }
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        if (!isValidMobile) {
            setError('Please enter a valid 10-digit mobile number.');
            return;
        }

        // Always allow a fake OTP flow for demo purpose.
        if (otp === DEMO_OTP) {
            const demoRole = mode === 'register' ? profile.role : 'citizen';
            const demoUser = {
                _id: `demo-${mobileNumber}`,
                name: profile.name || 'Demo Citizen',
                mobileNumber,
                role: demoRole
            };
            localStorage.setItem('token', 'demo-token');
            localStorage.setItem('user', JSON.stringify(demoUser));

            if (demoRole === 'citizen') router.push('/citizen/dashboard');
            else if (demoRole === 'admin') router.push('/admin/dashboard');
            else router.push('/department/dashboard');
            return;
        }

        try {
            const res = mode === 'login'
                ? await api.post('/auth/login', { mobileNumber, otp })
                : await api.post('/auth/register', { mobileNumber, otp, ...profile });
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('user', JSON.stringify(res.data.user));
            
            // Route based on role
            const role = res.data.user.role;
            if (role === 'citizen') router.push('/citizen/dashboard');
            else if (role === 'admin') router.push('/admin/dashboard');
            else router.push('/department/dashboard');
            
        } catch (err) {
            setError(err.response?.data?.message || `Invalid OTP. For demo use ${DEMO_OTP}.`);
        }
    };

    return (
        <div className="hero-gradient min-h-screen py-10 px-4">
            <div className="container grid lg:grid-cols-2 gap-8 items-stretch">
                <section className="panel p-8 md:p-10">
                    <span className="soft-badge">Secure Access (Demo)</span>
                    <h2 className="section-title mt-4">
                        {mode === 'login' ? 'Login to Continue' : 'Register for Portal Access'}
                    </h2>
                    <p className="text-sm text-slate-600 mt-2">
                        Mobile number and OTP are demo-enabled for presentation purpose.
                    </p>
                    <div className="mb-5 mt-6 grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-xl">
                        <button type="button" className={`py-2 rounded-lg text-sm ${mode === 'login' ? 'bg-white shadow font-semibold text-blue-700' : ''}`} onClick={() => { setMode('login'); setStep(1); }}>Login</button>
                        <button type="button" className={`py-2 rounded-lg text-sm ${mode === 'register' ? 'bg-white shadow font-semibold text-blue-700' : ''}`} onClick={() => { setMode('register'); setStep(1); }}>Register</button>
                    </div>

                    {error && <div className="mb-4 p-3 bg-red-50 border border-red-100 text-red-700 rounded-lg text-sm">{error}</div>}
                    {demoOtp && <div className="mb-4 p-3 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-lg text-sm">Demo OTP: <strong>{demoOtp}</strong></div>}
                    {!demoOtp && <div className="mb-4 p-3 bg-blue-50 border border-blue-100 text-blue-700 rounded-lg text-sm">Demo Tip: Use any 10-digit number and OTP <strong>{DEMO_OTP}</strong>.</div>}

                    {step === 1 ? (
                        <form onSubmit={handleSendOtp} className="space-y-3">
                            {mode === 'register' && (
                                <>
                                    <input type="text" required value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} className="w-full px-4 py-2.5 border border-slate-300 rounded-lg" placeholder="Full Name" />
                                    <input type="email" value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} className="w-full px-4 py-2.5 border border-slate-300 rounded-lg" placeholder="Email (optional)" />
                                    <input type="text" value={profile.address} onChange={(e) => setProfile({ ...profile, address: e.target.value })} className="w-full px-4 py-2.5 border border-slate-300 rounded-lg" placeholder="Address (optional)" />
                                    <select value={profile.role} onChange={(e) => setProfile({ ...profile, role: e.target.value })} className="w-full px-4 py-2.5 border border-slate-300 rounded-lg bg-white">
                                        <option value="citizen">Citizen</option>
                                        <option value="department">Department User</option>
                                        <option value="councillor">Councillor</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                    {profile.role !== 'citizen' && (
                                        <>
                                            <input type="text" value={profile.departmentType} onChange={(e) => setProfile({ ...profile, departmentType: e.target.value })} className="w-full px-4 py-2.5 border border-slate-300 rounded-lg" placeholder="Department Type" />
                                            <input type="text" value={profile.zone} onChange={(e) => setProfile({ ...profile, zone: e.target.value })} className="w-full px-4 py-2.5 border border-slate-300 rounded-lg" placeholder="Zone / Ward" />
                                        </>
                                    )}
                                </>
                            )}
                            <input
                                type="tel"
                                required
                                maxLength={10}
                                value={mobileNumber}
                                onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, ''))}
                                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg"
                                placeholder="10-digit Mobile Number"
                            />
                            <button type="submit" className="w-full bg-blue-600 text-white font-semibold py-2.5 rounded-lg hover:bg-blue-700 transition">
                                Send OTP for {mode === 'login' ? 'Login' : 'Registration'}
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={handleLogin} className="space-y-3">
                            <input
                                type="text"
                                required
                                maxLength={6}
                                value={otp}
                                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg"
                                placeholder="Enter OTP"
                            />
                            <button type="submit" className="w-full bg-blue-600 text-white font-semibold py-2.5 rounded-lg hover:bg-blue-700 transition">
                                {mode === 'login' ? 'Login' : 'Complete Registration'}
                            </button>
                        </form>
                    )}
                </section>

                <section className="panel p-8 md:p-10">
                    <h3 className="text-xl font-bold text-slate-900">Demo Credentials</h3>
                    <ul className="mt-4 text-sm text-slate-700 space-y-2">
                        <li>- Mobile: Any valid 10-digit number</li>
                        <li>- OTP: 1234</li>
                        <li>- Works even if backend database is offline</li>
                    </ul>
                    <h4 className="font-semibold text-slate-900 mt-7 mb-3">Production Readiness Checklist</h4>
                    <ul className="text-sm text-slate-600 space-y-2">
                        <li>- Replace demo OTP with SMS gateway</li>
                        <li>- Integrate MongoDB/AWS services</li>
                        <li>- Enable audit log persistence and alerting</li>
                        <li>- Add monitoring, CI/CD, and role-hardening</li>
                    </ul>
                </section>
            </div>
        </div>
    );
}
