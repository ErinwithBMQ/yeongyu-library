'use client';

import { useState, useEffect, use } from 'react';
import { getWorkById, deleteWork } from '@/services/works';
import { WorkWithTags } from '@/types';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function WorkDetailPage({ params }: { params: Promise<{ id: string }> }) {
    // Unwrapping params using React.use()
    const { id } = use(params);
    const { user } = useAuth();
    const router = useRouter();
    const [work, setWork] = useState<WorkWithTags | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchWork = async () => {
            if (!id) return;
            try {
                const data = await getWorkById(parseInt(id));
                setWork(data);
            } catch (error) {
                console.error('Failed to fetch work details', error);
            } finally {
                setLoading(false);
            }
        };
        fetchWork();
    }, [id]);

    const handleDelete = async () => {
        if (!work) return;
        const confirm = window.confirm('确定要删除这个作品吗？此操作不可撤销。');
        if (!confirm) return;

        try {
            await deleteWork(work.id);
            alert('已删除');
            router.push('/library');
        } catch (error) {
            alert('删除失败');
            console.error(error);
        }
    };

    if (loading) return <div className="p-10 text-center text-gray-500">加载中...</div>;
    if (!work) return <div className="p-10 text-center text-gray-500">找不到该作品</div>;

    return (
        <div className="container mx-auto p-4 sm:p-8 max-w-4xl">
            {/* 顶部导航 */}
            <div className="mb-6 flex items-center justify-between">
                <Link href="/library" className="text-gray-500 hover:text-pink-600 transition flex items-center gap-1">
                    &larr; 返回图书馆
                </Link>
                <div className="flex gap-4">
                    {/* 这里的操作一般需要权限验证，暂时放开 */}
                    {user && (
                        <button onClick={handleDelete} className="text-red-400 hover:text-red-600 font-medium text-sm">
                            删除作品
                        </button>
                    )}
                </div>
            </div>

            <div className="bg-white rounded-3xl shadow-sm border border-sakura/20 overflow-hidden relative">
                {/* 装饰背景条 */}
                <div className="h-4 bg-gradient-to-r from-pink-200 via-purple-100 to-mint-200"></div>

                <div className="p-8 sm:p-12">

                    {/* 标题与平台 */}
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
                        <div>
                            <span className="inline-block px-3 py-1 bg-gray-100 text-gray-600 text-sm font-medium rounded-full mb-3">
                                {work.platform}
                            </span>
                            <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 leading-tight">
                                {work.title}
                            </h1>
                            <p className="text-lg text-gray-500 mt-2">作者：<span className="text-gray-900 font-medium">{work.author_name}</span></p>
                        </div>

                        <a
                            href={work.original_url}
                            target="_blank"
                            className="inline-flex items-center justify-center px-6 py-3 bg-pink-500 hover:bg-pink-600 text-white font-bold rounded-xl shadow-md transition-all hover:-translate-y-1"
                        >
                            阅读原文
                            <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
                        </a>
                    </div>

                    {/* 标签墙 */}
                    <div className="flex flex-wrap gap-2 mb-10">
                        {work.tags && work.tags.map(tag => (
                            <span key={tag.id} className="px-3 py-1 bg-pink-50 text-pink-700 rounded-lg text-sm border border-pink-100">
                                {tag.name}
                            </span>
                        ))}
                        {!work.tags?.length && <span className="text-gray-400 text-sm">暂无标签</span>}
                    </div>

                    {/* 简介部分 */}
                    <div className="bg-gray-50 rounded-2xl p-6 sm:p-8 border border-gray-100">
                        <h3 className="text-lg font-bold text-gray-700 mb-4 border-l-4 border-pink-400 pl-3">作品简介</h3>
                        <div className="text-gray-600 leading-relaxed whitespace-pre-line">
                            {work.summary || '作者很懒，没有留下简介。'}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
