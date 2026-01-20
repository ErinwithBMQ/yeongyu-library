'use client';

import { useState, useEffect, use } from 'react';
import { getWorkById, deleteWork } from '@/services/works';
import { WorkWithTags } from '@/types';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import AddToFavoriteModal from '@/components/AddToFavoriteModal';
import { toast } from 'sonner';
import { showConfirm } from '@/lib/confirm';

export default function WorkDetailPage({ params }: { params: Promise<{ id: string }> }) {
    // Unwrapping params using React.use()
    const { id } = use(params);
    const { user } = useAuth();
    const router = useRouter();
    const [work, setWork] = useState<WorkWithTags | null>(null);
    const [loading, setLoading] = useState(true);
    const [isFavoriteModalOpen, setIsFavoriteModalOpen] = useState(false);

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

    const handleDelete = () => {
        if (!work) return;

        showConfirm('确定要删除这个作品吗？', async () => {
            try {
                await deleteWork(work.id);
                toast.success('已删除');
                router.push('/library');
            } catch (error) {
                toast.error('删除失败');
                console.error(error);
            }
        }, {
            description: '此操作不可撤销',
            confirmText: '删除',
            type: 'danger'
        });
    };

    if (loading) return <div className="p-10 text-center text-gray-500">加载中...</div>;
    if (!work) return <div className="p-10 text-center text-gray-500">找不到该作品</div>;

    return (
        <div className="container mx-auto p-4 sm:p-8 max-w-6xl">
            {/* 顶部导航 */}
            <div className="mb-8">
                <Link href="/library" className="text-gray-400 hover:text-bamguet transition inline-flex items-center gap-1 text-sm">
                    &larr; 返回图书馆
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-16">
                {/* 左侧：元数据与操作区 */}
                <div className="md:col-span-5 lg:col-span-4 space-y-6">
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <span className="inline-block px-3 py-1 bg-hwangchoon-light text-hwangchoon-dark text-xs font-bold tracking-wider rounded border border-hwangchoon/20">
                                {work.platform}
                            </span>
                            <span className="text-sm text-gray-400">
                                加入时间: {new Date(work.created_at).toLocaleDateString()}
                            </span>
                        </div>

                        <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 leading-tight mb-4">
                            {work.title}
                        </h1>

                        <div className="text-lg text-gray-600 mb-6">
                            <span className="text-gray-400 text-sm block mb-1">Author</span>
                            <span className="font-medium text-gray-900 border-b-2 border-bamguet pb-0.5">{work.author_name}</span>
                        </div>
                    </div>

                    {/* 标签区 */}
                    <div>
                        <div className="flex flex-wrap gap-2">
                            {work.tags && work.tags.map(tag => (
                                <span key={tag.id} className="px-3 py-1.5 bg-white text-gray-600 rounded text-sm border border-gray-200 hover:border-mint hover:text-hwangchoon-dark transition-colors cursor-default">
                                    # {tag.name}
                                </span>
                            ))}
                            {!work.tags?.length && <span className="text-gray-400 text-sm">暂无标签</span>}
                        </div>
                    </div>

                    {/* 操作按钮区 */}
                    <div className="pt-4 flex flex-col gap-3">
                        <a
                            href={work.original_url}
                            target="_blank"
                            className="w-full flex items-center justify-center px-6 py-3 bg-bamguet-dark hover:bg-bamguet text-white font-bold rounded-lg transition-all active:scale-95"
                        >
                            点击直达
                            <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
                        </a>

                        {user && (
                            <>
                                <div className='flex gap-3'>
                                    <Link
                                        href={`/library/${work.id}/edit`}
                                        className="w-full flex items-center justify-center px-6 py-3 border border-gray-300 text-gray-700 font-bold rounded-lg hover:bg-gray-50 transition-all active:scale-95"
                                    >
                                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                        编辑信息
                                    </Link>
                                    <button
                                        onClick={() => setIsFavoriteModalOpen(true)}
                                        className="w-full flex items-center justify-center px-6 py-3 border border-bamguet-dark text-bamguet-dark font-bold rounded-lg hover:bg-bamguet-light transition-all active:scale-95"
                                    >
                                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                                        加入收藏
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* 右侧：文章介绍 */}
                <div className="md:col-span-7 lg:col-span-8">
                    <div className="bg-white border border-gray-200 rounded-lg p-6 sm:p-8 transition-shadow">
                        <div className="mb-6 pb-2 border-b border-gray-100 flex items-center justify-between">
                            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-mint"></span>
                                作品简介
                            </h3>
                        </div>

                        <div className="text-gray-600 leading-8 whitespace-pre-line">
                            {work.summary || (
                                <div className="py-10 text-center text-gray-400 italic bg-gray-50 rounded-lg">
                                    作者很懒，没有留下简介。
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {isFavoriteModalOpen && work && (
                <AddToFavoriteModal
                    workId={work.id}
                    isOpen={isFavoriteModalOpen}
                    onClose={() => setIsFavoriteModalOpen(false)}
                />
            )}
        </div>
    );
}
