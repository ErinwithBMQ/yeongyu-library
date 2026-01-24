'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { FavoriteFolder, Work, Tag } from '@/types';
import { getMyFolders, createFolder, deleteFolder, getFolderWorks, removeWorkFromFolder } from '@/services/favorites';
import Link from 'next/link';
import { toast } from 'sonner';
import { showConfirm } from '@/lib/confirm';
import useSWR from 'swr';

export default function FavoritesPage() {
    const { user, loading } = useAuth();
    const router = useRouter();

    // const [folders, setFolders] = useState<FavoriteFolder[]>([]);
    const [selectedFolderId, setSelectedFolderId] = useState<number | null>(null);
    // const [works, setWorks] = useState<(Work & { added_at: string, tags?: Tag[] })[]>([]);

    // const [loadingFolders, setLoadingFolders] = useState(true);
    // const [loadingWorks, setLoadingWorks] = useState(false);

    // 创建收藏夹状态
    const [isCreating, setIsCreating] = useState(false);
    const [newFolderName, setNewFolderName] = useState('');

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
        }
    }, [user, loading, router]);

    // SWR for Folders
    const { data: folders = [], isLoading: loadingFolders, mutate: mutateFolders } = useSWR(
        user?.id ? '/api/favorites/folders' : null,
        getMyFolders,
        {
            revalidateOnFocus: false,
            onSuccess: (data) => {
                // 默认选中第一个文件夹 (如果有)
                if (data.length > 0 && !selectedFolderId) {
                    setSelectedFolderId(data[0].id);
                }
            }
        }
    );

    // SWR for Works in selected folder
    const { data: works = [], isLoading: loadingWorks, mutate: mutateWorks } = useSWR(
        selectedFolderId ? ['/api/favorites/folder/works', selectedFolderId] : null,
        ([, id]) => getFolderWorks(id as number),
        {
            keepPreviousData: true
        }
    );

    /* Removed manual loadFolders, loadFolderWorks useEffects */

    const handleCreateFolder = async () => {
        if (!newFolderName.trim()) return;
        try {
            const newFolder = await createFolder(newFolderName.trim());
            // 乐观更新或由于使用了SWR，可以直接mutate更新
            await mutateFolders([newFolder, ...folders], false); // Optimistic update (optional) or just revalidate
            // Or simple revalidate: await mutateFolders();

            setNewFolderName('');
            setIsCreating(false);
            // 切换到新创建的文件夹
            setSelectedFolderId(newFolder.id);
        } catch (error) {
            console.error('创建收藏夹失败', error);
            toast.error('创建失败，请稍后重试');
            mutateFolders(); // Revert/Fetch true data
        }
    };

    const handleDeleteFolder = (folderId: number, folderName: string) => {
        showConfirm(`确定要删除收藏夹 "${folderName}" 吗？`, async () => {
            try {
                // Optimistic UI for delete
                const newFolders = folders.filter(f => f.id !== folderId);
                mutateFolders(newFolders, false);

                await deleteFolder(folderId);

                // Trigger revalidation to be safe
                mutateFolders();

                // 如果删除的是当前选中的，切换选中状态
                if (selectedFolderId === folderId) {
                    setSelectedFolderId(newFolders.length > 0 ? newFolders[0].id : null);
                }
                toast.success('收藏夹已删除');
            } catch (error) {
                console.error('删除收藏夹失败', error);
                toast.error('删除失败');
                mutateFolders(); // Revert
            }
        }, {
            description: '此操作不可恢复，且会移除其中的所有收藏记录。',
            confirmText: '删除',
            type: 'danger'
        });
    };

    const handleRemoveWork = (workId: number, workTitle: string) => {
        if (!selectedFolderId) return;

        toast(`确定要将 "${workTitle}" 从此收藏夹移除吗？`, {
            action: {
                label: '移除',
                onClick: async () => {
                    try {
                        const newWorks = works.filter(w => w.id !== workId);
                        mutateWorks(newWorks, false); // Optimistic UI

                        await removeWorkFromFolder(selectedFolderId, workId);

                        mutateWorks(); // Revalidate
                        toast.success('已移除');
                    } catch (error) {
                        console.error('移出失败', error);
                        toast.error('操作失败');
                        mutateWorks(); // Revert
                    }
                }
            },
            cancel: {
                label: '取消',
                onClick: () => { }
            }
        });
    };

    const selectedFolder = folders.find(f => f.id === selectedFolderId);

    if (loading) return null;
    if (!user) return null;

    return (
        <div className="container mx-auto p-4 sm:p-8 max-w-6xl min-h-[calc(100vh-200px)]">
            <header className="mb-8">
                <h1 className="text-2xl font-bold text-bamguet-dark mb-2">我的收藏夹</h1>
            </header>

            <div className="grid lg:grid-cols-4 gap-8">
                {/* 左侧：收藏夹列表 */}
                <div className="lg:col-span-1 border-r border-gray-100 pr-4">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="font-semibold text-gray-700">文件夹</h2>
                        <button
                            onClick={() => setIsCreating(!isCreating)}
                            className="text-bamguet-dark hover:bg-bamguet-light p-1 rounded-md transition"
                            title="新建收藏夹"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                        </button>
                    </div>

                    {isCreating && (
                        <div className="mb-4 animate-fade-in-down">
                            <input
                                type="text"
                                value={newFolderName}
                                onChange={(e) => setNewFolderName(e.target.value)}
                                placeholder="输入文件夹名称..."
                                className="w-full px-3 py-2 border border-bamguet-light rounded-lg text-sm focus:ring-2 focus:ring-bamguet-light outline-none mb-2"
                                autoFocus
                                onKeyDown={(e) => e.key === 'Enter' && handleCreateFolder()}
                            />
                            <div className="flex gap-2 justify-end">
                                <button onClick={() => setIsCreating(false)} className="text-xs text-gray-500 hover:text-gray-700">取消</button>
                                <button
                                    onClick={handleCreateFolder}
                                    className="px-3 py-1 bg-bamguet-dark text-white text-xs rounded-md hover:bg-bamguet"
                                    disabled={!newFolderName.trim()}
                                >
                                    创建
                                </button>
                            </div>
                        </div>
                    )}

                    {loadingFolders ? (
                        <div className="space-y-2">
                            {[1, 2, 3].map(i => <div key={i} className="h-10 bg-gray-100 rounded-lg animate-pulse"></div>)}
                        </div>
                    ) : folders.length === 0 ? (
                        <div className="text-center py-8 text-gray-400 text-sm bg-gray-50 rounded-lg">
                            还没有创建收藏夹
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {folders.map(folder => (
                                <button
                                    key={folder.id}
                                    onClick={() => setSelectedFolderId(folder.id)}
                                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all text-left group ${selectedFolderId === folder.id
                                        ? 'bg-bamguet-dark text-white'
                                        : 'bg-white hover:bg-bamguet-light text-gray-700'
                                        }`}
                                >
                                    <div className="flex items-center gap-3 truncate">
                                        <svg className={`w-5 h-5 flex-shrink-0 ${selectedFolderId === folder.id ? 'text-white' : 'text-bamguet'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" /></svg>
                                        <span className="font-medium truncate">{folder.name}</span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* 右侧：作品列表 */}
                <div className="lg:col-span-3 min-h-[400px]">
                    {!selectedFolderId ? (
                        <div className="h-full flex flex-col items-center justify-center text-gray-300 border-2 border-dashed border-gray-100 rounded-3xl">
                            <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z" /></svg>
                            <p>选择文件夹查看收藏</p>
                        </div>
                    ) : (
                        <div className="bg-white rounded-2xl border border-gray-200 p-6 min-h-full">
                            <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-50">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-800">{selectedFolder?.name}</h2>
                                    <p className="text-sm text-gray-400 mt-1">共 {works.length} 个作品</p>
                                </div>
                                <button
                                    onClick={() => handleDeleteFolder(selectedFolder!.id, selectedFolder!.name)}
                                    className="px-4 py-2 text-red-400 hover:bg-red-50 hover:text-red-500 rounded-lg text-sm transition flex items-center gap-2"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                    删除此收藏夹
                                </button>
                            </div>

                            {loadingWorks ? (
                                <div className="text-center py-12">
                                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-bamguet mx-auto mb-4"></div>
                                    <p className="text-gray-400">正在搬运书本...</p>
                                </div>
                            ) : works.length === 0 ? (
                                <div className="text-center py-16 text-gray-400">
                                    <p className="text-lg">这里空空如也</p>
                                    <p className="text-sm mt-2">快去图书馆添加喜欢的作品吧</p>
                                    <Link href="/library" className="mt-6 inline-block px-6 py-2 bg-bamguet-light text-bamguet-dark rounded-xl hover:bg-bamguet transition">
                                        前往图书馆
                                    </Link>
                                </div>
                            ) : (
                                <div className="flex flex-col gap-2">
                                    {works.map((work) => {
                                        const typeTag = work.tags?.find(t => t.category === '类型');
                                        return (
                                            <div key={work.id} className="group flex items-center justify-between p-3 rounded-lg border border-gray-200 bg-white hover:border-bamguet/50 transition-all">
                                                <Link href={`/library/${work.id}`} className="flex-1 min-w-0 flex items-center gap-2 sm:gap-3">
                                                    <span className="font-bold text-gray-700 truncate group-hover:text-bamguet-dark max-w-[5rem] sm:max-w-none">{work.title}</span>
                                                    <span className="px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-500 font-medium whitespace-nowrap shrink-0">
                                                        {typeTag ? typeTag.name : work.platform}
                                                    </span>
                                                    <span className="text-sm text-gray-400 truncate border-l border-gray-200 pl-2 sm:pl-3 max-w-[3rem] sm:max-w-none">{work.author_name}</span>
                                                </Link>

                                                <div className="ml-2 flex items-center gap-1">
                                                    <a
                                                        href={work.original_url}
                                                        target="_blank"
                                                        onClick={(e) => e.stopPropagation()}
                                                        className="p-1.5 text-gray-400 hover:text-bamguet-dark hover:bg-bamguet-light/20 rounded-full transition-all"
                                                        title="直达原址"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h6v6" /><path d="M10 14 21 3" /><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /></svg>
                                                    </a>
                                                    <button
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            e.stopPropagation();
                                                            handleRemoveWork(work.id, work.title);
                                                        }}
                                                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
                                                        title="移除"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}