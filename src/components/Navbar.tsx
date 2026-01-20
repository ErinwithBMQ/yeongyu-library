'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { signOut } from '@/services/auth';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { LibraryBig, Radio, Heart, User, LogIn } from 'lucide-react';

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
                <Link href="/">🐙小章鱼存档地</Link>
            </div>
            <div className="flex gap-6 items-center">
                <Link href="/library" className="group flex flex-col items-center gap-0.5 text-xs font-medium text-gray-600 hover:text-bamguet-dark transition-colors">
                    <LibraryBig className="w-6 h-6 group-hover:scale-110 transition-transform" strokeWidth={1.5} />
                    <span>图书馆</span>
                </Link>
                {loading ? (
                    // Optional: Skeleton loader or just empty
                    <span className="text-gray-300 text-sm">...</span>
                ) : user ? (
                    <>
                        <Link href="/radio" className="group flex flex-col items-center gap-0.5 text-xs font-medium text-gray-600 hover:text-hwangchoon-dark transition-colors">
                            <Radio className="w-6 h-6 group-hover:scale-110 transition-transform" strokeWidth={1.5} />
                            <span>电台</span>
                        </Link>
                        <Link href="/favorites" className="group flex flex-col items-center gap-0.5 text-xs font-medium text-gray-600 hover:text-bamguet-dark transition-colors">
                            <Heart className="w-6 h-6 group-hover:scale-110 transition-transform" strokeWidth={1.5} />
                            <span>收藏夹</span>
                        </Link>
                        <Link href="/me" className="group flex flex-col items-center gap-0.5 text-xs font-medium text-gray-600 hover:text-hwangchoon-dark transition-colors">
                            <User className="w-6 h-6 group-hover:scale-110 transition-transform" strokeWidth={1.5} />
                            <span>我</span>
                        </Link>
                        {/* Optionally add a logout button here or keep it in "Me" page, asking for "Navbar" changes usually implies visibility of main links */}
                    </>
                ) : (
                    <Link href="/login" className="group flex flex-col items-center gap-0.5 text-xs font-medium text-gray-600 hover:text-bamguet-dark transition-colors">
                        <LogIn className="w-6 h-6 group-hover:scale-110 transition-transform" strokeWidth={1.5} />
                        <span>登录</span>
                    </Link>
                )}
            </div>
        </nav>
    );
}
