'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { signOut } from '@/services/auth';
import { useRouter } from 'next/navigation';

export default function Navbar() {
    const { user, loading } = useAuth();
    const router = useRouter();

    const handleLogout = async () => {
        try {
            await signOut();
            router.push('/');
            router.refresh();
        } catch (error) {
            console.error('Logout failed', error);
        }
    };

    return (
        <nav className="flex items-center justify-between p-4 bg-sakura-light/50 backdrop-blur-sm sticky top-0 z-50 border-b border-sakura/20">
            <div className="text-xl font-bold text-pink-600">
                <Link href="/">小章鱼存档地</Link>
            </div>
            <div className="flex gap-6 font-medium text-gray-600 items-center">
                <Link href="/library" className="hover:text-pink-500 transition-colors">图书馆</Link>

                {loading ? (
                    // Optional: Skeleton loader or just empty
                    <span className="text-gray-300 text-sm">...</span>
                ) : user ? (
                    <>
                        <Link href="/radio" className="hover:text-pink-500 transition-colors">电台</Link>
                        <Link href="/favorites" className="hover:text-pink-500 transition-colors">收藏夹</Link>
                        <Link href="/me" className="hover:text-pink-500 transition-colors">我</Link>
                        {/* Optionally add a logout button here or keep it in "Me" page, asking for "Navbar" changes usually implies visibility of main links */}
                    </>
                ) : (
                    <Link href="/login" className="px-4 py-1.5 bg-pink-500 text-white rounded-full text-sm font-bold hover:bg-pink-600 transition-colors">
                        登录
                    </Link>
                )}
            </div>
        </nav>
    );
}
