'use client';

import { useState, useEffect } from 'react';
import { getWorks } from '@/services/works';
import { getTagsGroupedByCategory } from '@/services/tags';
import { WorkWithTags, Tag } from '@/types';
import Link from 'next/link';

export default function LibraryView() {
    const [works, setWorks] = useState<WorkWithTags[]>([]);
    const [loading, setLoading] = useState(true);
    const [groupedTags, setGroupedTags] = useState<Record<string, Tag[]>>({});

    // Filter States
    const [selectedTagIds, setSelectedTagIds] = useState<number[]>([]);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const pageSize = 6; // 一页显示几个

    const categoryOrder = ['类型', '世界观', '篇幅', '进度', '情感', '剧情', '预警', '人设', '幻想', '设定'];

    // Load Tags on mount
    useEffect(() => {
        getTagsGroupedByCategory().then(setGroupedTags);
    }, []);

    // Load Works when filters change
    useEffect(() => {
        fetchWorks();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedTagIds, page]);

    const fetchWorks = async () => {
        setLoading(true);
        try {
            const { data, total } = await getWorks({
                page,
                pageSize,
                filterTagIds: selectedTagIds
            });
            setWorks(data);
            setTotal(total);
        } catch (error) {
            console.error('Failed to fetch works', error);
        } finally {
            setLoading(false);
        }
    };

    const handleTagClick = (id: number) => {
        setSelectedTagIds(prev => {
            if (prev.includes(id)) {
                return prev.filter(tid => tid !== id);
            } else {
                return [...prev, id];
            }
        });
        setPage(1); // Reset to page 1 whenever filter changes
    };

    const totalPages = Math.ceil(total / pageSize);

    const sortedEntries = Object.entries(groupedTags).sort((a, b) => {
        const indexA = categoryOrder.indexOf(a[0]);
        const indexB = categoryOrder.indexOf(b[0]);
        if (indexA !== -1 && indexB !== -1) return indexA - indexB;
        if (indexA !== -1) return -1;
        if (indexB !== -1) return 1;
        return 0;
    });

    return (
        <div className="flex flex-col lg:flex-row gap-8">
            {/* Left Sidebar: Filters */}
            <aside className={`flex-shrink-0 transition-all duration-300 ${isSidebarOpen ? 'lg:w-64' : 'lg:w-12'}`}>
                <div className={`bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden ${isSidebarOpen ? 'p-4' : 'p-2'}`}>
                    <div className={`flex items-center ${isSidebarOpen ? 'justify-between mb-4' : 'justify-center flex-col gap-4'}`}>
                        {isSidebarOpen && <h2 className="font-bold text-gray-700">标签筛选</h2>}

                        <button
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                            className="p-1.5 rounded-lg hover:bg-gray-50 text-gray-500 transition-colors"
                            title={isSidebarOpen ? "收起" : "展开筛选"}
                        >
                            {isSidebarOpen ? (
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 12l12 6" /></svg>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18" /><path d="M7 12h10" /><path d="M10 18h4" /></svg>
                            )}
                        </button>

                        {isSidebarOpen && selectedTagIds.length > 0 && (
                            <button
                                onClick={() => setSelectedTagIds([])}
                                className="text-xs text-pink-500 hover:underline"
                            >
                                清除
                            </button>
                        )}
                    </div>

                    {isSidebarOpen && (
                        <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2 scrollbar-thin">
                            {sortedEntries.map(([category, tags]) => (
                                <div key={category}>
                                    <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">{category}</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {tags.map(tag => {
                                            const isSelected = selectedTagIds.includes(tag.id);
                                            return (
                                                <button
                                                    key={tag.id}
                                                    onClick={() => handleTagClick(tag.id)}
                                                    className={`
                            text-xs px-2.5 py-1 rounded-full transition-all border
                            ${isSelected
                                                            ? 'bg-pink-500 text-white border-pink-500 shadow-sm scale-105'
                                                            : 'bg-gray-50 text-gray-600 border-gray-100 hover:bg-white hover:border-pink-300'
                                                        }
                        `}
                                                >
                                                    {tag.name}
                                                </button>
                                            )
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </aside>

            {/* Right Content: Work List */}
            <main className="flex-1">

                {/* Status Bar */}
                <div className="mb-4 flex items-center justify-between text-sm text-gray-500 bg-white px-4 py-3 rounded-lg border border-gray-100 shadow-sm">
                    <span>共找到 {total} 部作品</span>
                    {selectedTagIds.length > 0 && (
                        <span className="flex items-center gap-2">
                            <span className="hidden sm:inline">已选标签:</span>
                            <span className="flex flex-wrap gap-1">
                                {selectedTagIds.map(id => {
                                    const tag = Object.values(groupedTags).flat().find(t => t.id === id);
                                    return tag ? (
                                        <span key={id} className="bg-pink-100 text-pink-700 px-2 py-0.5 rounded-full text-xs font-medium">#{tag.name}</span>
                                    ) : null;
                                })}
                            </span>
                        </span>
                    )}
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <div key={i} className="h-40 bg-gray-100 rounded-xl animate-pulse"></div>
                        ))}
                    </div>
                ) : works.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-200">
                        <p className="text-gray-400">没有找到符合条件的作品</p>
                        {selectedTagIds.length > 0 && (
                            <button onClick={() => setSelectedTagIds([])} className="mt-2 text-pink-500 hover:underline">
                                清除筛选条件
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-5">
                        {works.map(work => (
                            <div key={work.id} className="group bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md hover:border-pink-100 transition-all flex flex-col h-full relative overflow-hidden">
                                {/* Decoration: Top colored line */}
                                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-pink-200 to-mint-200"></div>

                                <div className="flex justify-between items-start mb-2">
                                    <span className="text-xs font-medium text-gray-500 bg-green-50 px-2 py-1 rounded">
                                        {work.platform || '未知平台'}
                                    </span>
                                    <a href={work.original_url} target="_blank" className="text-gray-300 hover:text-pink-500 transition-colors" title="直达原址">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-external-link"><path d="M15 3h6v6" /><path d="M10 14 21 3" /><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /></svg>
                                    </a>
                                </div>

                                <h3 className="font-bold text-gray-800 text-lg mb-1 group-hover:text-pink-600 transition-colors line-clamp-1">
                                    <Link href={`/library/${work.id}`}>{work.title}</Link>
                                </h3>
                                <div className="text-sm text-gray-500 mb-3">作者：{work.author_name}</div>

                                {work.summary && (
                                    <p className="text-xs text-gray-400 line-clamp-2 mb-4 flex-grow">
                                        {work.summary}
                                    </p>
                                )}

                                <div className="flex flex-wrap gap-1.5 mt-auto pt-4 border-t border-gray-50">
                                    {work.tags?.slice(0, 5).map(tag => (
                                        <span key={tag.id} className="text-[10px] px-2 py-0.5 bg-gray-50 text-gray-500 rounded-full border border-gray-100">
                                            {tag.name}
                                        </span>
                                    ))}
                                    {(work.tags && work.tags.length > 5) && (
                                        <span className="text-[10px] px-2 py-0.5 text-gray-400">+{work.tags.length - 5}</span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Pagination Controls */}
                {totalPages > 1 && (
                    <div className="mt-8 flex justify-center items-center gap-4">
                        <button
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className="px-4 py-2 rounded-lg border border-gray-200 bg-white text-gray-600 disabled:opacity-50 hover:bg-gray-50 transition"
                        >
                            上一页
                        </button>
                        <span className="text-gray-500 font-medium">
                            第 {page} 页 / 共 {totalPages} 页
                        </span>
                        <button
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages}
                            className="px-4 py-2 rounded-lg border border-gray-200 bg-white text-gray-600 disabled:opacity-50 hover:bg-gray-50 transition"
                        >
                            下一页
                        </button>
                    </div>
                )}

            </main>
        </div>
    );
}
