'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import Image from 'next/image';

export default function Navbar() {
    const [user, setUser] = useState(null);
    const [isOpen, setIsOpen] = useState(false);
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        const checkUser = () => {
            const storedUser = localStorage.getItem('user');
            if (storedUser) {
                setUser(JSON.parse(storedUser));
            } else {
                setUser(null);
            }
        };

        checkUser();
    }, [pathname]);

    // Close menu when route changes automatically
    useEffect(() => {
        setIsOpen(false);
    }, [pathname]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        router.push('/login');
    };

    const linkBaseClass = "text-slate-700 font-medium px-4 py-2 hover:bg-slate-100/80 hover:text-blue-600 rounded-full transition-all duration-300";

    return (
        <header className="site-header bg-white/70 backdrop-blur-xl border-b border-white/20 sticky top-0 z-50 shadow-sm">
            <div className="container">
                <div className="brand-row flex items-center justify-between py-2 md:py-0">
                    <div className="brand-left">
                        <Link href="/">
                            <Image src="/images/imc-indore-logo.svg" alt="IMC Indore Logo" width={220} height={50} className="brand-logo drop-shadow-sm transition-transform hover:scale-[1.02]" />
                        </Link>
                    </div>

                    {/* Mobile Menu Toggle Button */}
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="md:hidden p-2 text-slate-700 hover:bg-slate-100 rounded-lg focus:outline-none transition-colors"
                    >
                        {isOpen ? <X size={26} /> : <Menu size={26} />}
                    </button>

                    {/* Navigation - Desktop & Mobile */}
                    <nav className={`${isOpen ? 'flex' : 'hidden'} md:flex flex-col md:flex-row absolute md:relative top-[72px] md:top-auto left-0 w-full md:w-auto bg-white/95 md:bg-transparent backdrop-blur-xl md:backdrop-blur-none shadow-xl md:shadow-none p-6 md:p-0 gap-4 md:gap-1 lg:gap-2 z-50 border-b md:border-none border-slate-200 items-start md:items-center`}>
                        <Link href="/" className={linkBaseClass}>Home</Link>
                        {!user && <Link href="/login" className={linkBaseClass}>Login / Register</Link>}

                        {user && user.role === 'citizen' && (
                            <>
                                <Link href="/citizen/dashboard" className={linkBaseClass}>My Dashboard</Link>
                                <Link href="/citizen/new-complaint" className={`px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-full shadow-md shadow-blue-500/20 hover:shadow-blue-500/40 hover:-translate-y-0.5 transition-all duration-300 ml-0 md:ml-2`}>Raise Complaint</Link>
                            </>
                        )}

                        {user && user.role === 'department' && (
                            <Link href="/department/dashboard" className={linkBaseClass}>Dept Dashboard</Link>
                        )}

                        {user && user.role === 'admin' && (
                            <Link href="/admin/dashboard" className={linkBaseClass}>Admin Dashboard</Link>
                        )}

                        {user && (
                            <div className="mt-4 md:mt-0 md:ml-4 flex items-center gap-3 md:border-l pl-0 md:pl-5 border-slate-200 w-full md:w-auto pt-4 md:pt-0 border-t md:border-t-0">
                                <span className="text-sm font-semibold text-slate-800 hidden md:inline">{user.name}</span>
                                <button onClick={handleLogout} className="px-5 py-2 md:px-4 md:py-2 w-full md:w-auto text-center md:text-left text-sm text-red-600 hover:text-red-700 hover:bg-red-50 font-semibold md:font-medium bg-red-50/50 md:bg-transparent rounded-full transition-colors">
                                    Logout
                                </button>
                            </div>
                        )}
                    </nav>
                </div>
            </div>
        </header>
    );
}
