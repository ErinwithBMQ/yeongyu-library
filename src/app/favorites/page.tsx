'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function FavoritesPage() {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
        }
    }, [user, loading, router]);

    if (loading) return null;
    if (!user) return null;

    return (
        <div className="container mx-auto p-4 sm:p-8">
            <h1 className="text-3xl font-bold text-pink-500 mb-6">我的收藏夹</h1>
            <div className="bg-white rounded-2xl p-8 shadow-sm text-center border border-gray-100">
                <p className="text-gray-500">这里只有你能看见。</p>
            </div>
        </div>
    );
}
