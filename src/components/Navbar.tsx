'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { signOut } from '@/services/auth';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function Navbar() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        let lastScrollY = window.scrollY;

        const controlNavbar = () => {
            const currentScrollY = window.scrollY;

            // 向下滚动超过100px且当前位置大于上次位置 -> 隐藏
            // 向上滚动 -> 显示
            if (currentScrollY > lastScrollY && currentScrollY > 100) {
                setIsVisible(false);
            } else {
                setIsVisible(true);
            }

            lastScrollY = currentScrollY;
        };

        window.addEventListener('scroll', controlNavbar);

        return () => {
            window.removeEventListener('scroll', controlNavbar);
        };
    }, []);

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
        <nav className={`flex items-center justify-between p-4 bg-bamguet-light/70 backdrop-blur-sm sticky top-0 z-50 border-b border-bamguet-light transition-transform duration-300 ${isVisible ? 'translate-y-0' : '-translate-y-full'}`}>
            <div className="text-xl font-bold text-bamguet-dark">
                <Link href="/">小章鱼存档地</Link>
            </div>
            <div className="flex gap-6 font-medium text-gray-600 items-center">
                <Link href="/library" className="hover:text-bamguet-dark transition-colors">图书馆</Link>
                {loading ? (
                    // Optional: Skeleton loader or just empty
                    <span className="text-gray-300 text-sm">...</span>
                ) : user ? (
                    <>
                        <Link href="/radio" className="hover:text-hwangchoon-dark transition-colors">电台</Link>
                        <Link href="/favorites" className="hover:text-bamguet-dark transition-colors">收藏夹</Link>
                        <Link href="/me" className="hover:text-hwangchoon-dark transition-colors">我</Link>
                        {/* Optionally add a logout button here or keep it in "Me" page, asking for "Navbar" changes usually implies visibility of main links */}
                    </>
                ) : (
                    <Link href="/login" className="px-4 py-1.5 bg-bamguet-dark text-white rounded-full text-sm font-bold hover:bg-bamguet-dark/90 transition-colors">
                        登录
                    </Link>
                )}
            </div>
        </nav>
    );
}
