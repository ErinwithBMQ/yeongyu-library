'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function RadioPage() {
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
            <header className="mb-8">
                <h1 className="text-3xl font-bold text-teal-500 mb-2">真心定格电台</h1>
                <p className="text-gray-600">匿名树洞，留下你的碎碎念或长信。</p>
            </header>

            <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-mint-light/30 rounded-2xl p-6 border border-mint/50">
                    <h2 className="text-xl font-semibold text-teal-700 mb-4">我要留言</h2>
                    <textarea
                        className="w-full h-32 rounded-lg border-gray-200 p-3 focus:ring-mint focus:border-mint"
                        placeholder="写下你想说的话..."
                    ></textarea>
                    <button className="mt-4 px-6 py-2 bg-mint text-teal-900 font-semibold rounded-full hover:bg-mint/80 transition shadow-sm">
                        投递
                    </button>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <h2 className="text-xl font-semibold text-gray-700 mb-4">最新回声</h2>
                    <div className="text-center text-gray-400 py-8">
                        暂无留言
                    </div>
                </div>
            </div>
        </div>
    );
}
