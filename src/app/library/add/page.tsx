'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
                <h1 className="text-3xl font-bold text-bamguet-dark mb-2">添加新作品</h1>
                <p className="text-gray-600">请小章鱼们注意，提交后可修改，不可删除哦</p>
            </header>

            <AddWorkForm />
        </div>
    );
}
