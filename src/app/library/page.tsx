'use client';

import Link from 'next/link';
import LibraryView from "@/components/LibraryView";
import { useAuth } from '@/context/AuthContext';

export default function LibraryPage() {
    const { user } = useAuth();

    return (
        <div className="container mx-auto p-4 sm:p-8">
            <header className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-bamguet-dark mb-2">图书馆</h1>
                    <p className="text-gray-600">这里是产出整理站，可以通过选择标签进行筛选，也可以使用搜索功能。</p>
                </div>
                {user && (
                    <Link
                        href="/library/add"
                        className="inline-flex items-center px-4 py-2 bg-bamguet-dark text-white rounded-lg font-bold hover:brightness-105 transition-all text-sm"
                    >
                        <span className="mr-2 text-lg">+</span> 添加作品
                    </Link>
                )}
            </header>

            <LibraryView />
        </div>
    );
}
