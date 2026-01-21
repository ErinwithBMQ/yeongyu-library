'use client';

import { useState } from 'react';
import Link from 'next/link';
import LibraryView from "@/components/LibraryView";
import { useAuth } from '@/context/AuthContext';

export default function LibraryPage() {
    const { user } = useAuth();
    const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');

    const toggleSort = () => {
        setSortOrder(prev => prev === 'newest' ? 'oldest' : 'newest');
    };

    return (
        <div className="container mx-auto p-4 sm:p-8">
            <header className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-bamguet-dark mb-2">图书馆</h1>
                    <p className="text-gray-600">这里是产出整理站，可以通过选择标签进行筛选，也可以使用搜索功能。</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={toggleSort}
                        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:text-bamguet-dark transition-colors"
                        title={sortOrder === 'newest' ? "当前按最新排序，点击切换" : "当前按最早排序，点击切换"}
                    >
                        {sortOrder === 'newest' ? (
                            <>
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18H3M21 6H3M17 12H3" /></svg>
                                <span>最新</span>
                            </>
                        ) : (
                            <>
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18M3 12h14M3 18h10" /></svg>
                                <span>最早</span>
                            </>
                        )}
                    </button>

                    {user && (
                        <Link
                            href="/library/add"
                            className="flex items-center justify-center w-[38px] h-[38px] bg-bamguet-dark text-white rounded-full hover:brightness-105 transition-all shadow-sm"
                            title="添加作品"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="M12 5v14" /></svg>
                        </Link>
                    )}
                </div>
            </header>

            <LibraryView sortOrder={sortOrder} />
        </div>
    );
}
