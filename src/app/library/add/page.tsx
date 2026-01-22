'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AddWorkForm from '@/components/AddWorkForm';
import { useAuth } from '@/context/AuthContext';

export default function AddWorkPage() {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
        }
    }, [user, loading, router]);

    if (loading) {
        return <div className="p-8 text-center text-gray-500">加载中...</div>;
    }

    if (!user) {
        return null; // Or a message while redirecting
    }

    return (
        <div className="container mx-auto p-4 sm:p-8 min-h-screen">
            <header className="mb-8 max-w-4xl mx-auto">
                <div className="mb-6">
                    <Link href="/library" className="text-gray-400 hover:text-bamguet transition inline-flex items-center gap-1 text-sm">
                        &larr; 返回图书馆
                    </Link>
                </div>
                <h1 className="text-3xl font-bold text-bamguet-dark mb-2">添加新作品</h1>
            </header>

            <AddWorkForm />
        </div>
    );
}
