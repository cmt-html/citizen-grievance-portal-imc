'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AuthGuard({ children, roles = [] }) {
    const [authorized, setAuthorized] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        
        if (!storedUser) {
            router.push('/login');
            return;
        }

        const user = JSON.parse(storedUser);
        
        // If roles are specified, check if user has permission
        if (roles.length > 0 && !roles.includes(user.role)) {
            // Redirect to their own dashboard or home if unauthorized
            if (user.role === 'admin') router.push('/admin/dashboard');
            else if (user.role === 'citizen') router.push('/citizen/dashboard');
            else if (user.role === 'department') router.push('/department/dashboard');
            else router.push('/');
            return;
        }

        setAuthorized(true);
    }, [router, roles]);

    if (!authorized) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="animate-pulse text-slate-400 font-medium">Verifying Access...</div>
            </div>
        );
    }

    return children;
}
