'use client';

import { useState, useEffect } from 'react';
import { FavoriteFolder } from '@/types';
import { getMyFolders, createFolder, addWorkToFolder, removeWorkFromFolder, checkWorkInFolders } from '@/services/favorites';

interface AddToFavoriteModalProps {
    workId: number;
    isOpen: boolean;
    onClose: () => void;
}

export default function AddToFavoriteModal({ workId, isOpen, onClose }: AddToFavoriteModalProps) {
    const [folders, setFolders] = useState<FavoriteFolder[]>([]);
    const [selectedFolderIds, setSelectedFolderIds] = useState<number[]>([]);
    const [newFolderName, setNewFolderName] = useState('');
    const [loading, setLoading] = useState(false);
    const [creating, setCreating] = useState(false);

    // 初始化：加载收藏夹列表 和 当前作品的收藏状态
    useEffect(() => {
        if (isOpen) {
            loadData();
        }
    }, [isOpen, workId]);

    const loadData = async () => {
        setLoading(true);
        try {
            const [myFolders, inFolders] = await Promise.all([
                getMyFolders(),
                checkWorkInFolders(workId)
            ]);
            setFolders(myFolders);
            setSelectedFolderIds(inFolders);
        } catch (error) {
            console.error('加载收藏夹信息失败', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateFolder = async () => {
        if (!newFolderName.trim()) return;
        setCreating(true);
        try {
            const newFolder = await createFolder(newFolderName.trim());
            setFolders([newFolder, ...folders]);
            setNewFolderName('');
            // 自动选中新建的文件夹
            // setSelectedFolderIds(prev => [...prev, newFolder.id]); 
            // 还是不要自动选比较好，让用户自己决定，或者看需求。这里先不自动选。
        } catch (error) {
            console.error('创建收藏夹失败', error);
            alert('创建失败');
        } finally {
            setCreating(false);
        }
    };

    const toggleFolder = async (folderId: number) => {
        try {
            const isSelected = selectedFolderIds.includes(folderId);
            if (isSelected) {
                await removeWorkFromFolder(folderId, workId);
                setSelectedFolderIds(prev => prev.filter(id => id !== folderId));
            } else {
                await addWorkToFolder(folderId, workId);
                setSelectedFolderIds(prev => [...prev, folderId]);
            }
        } catch (error) {
            console.error('操作失败', error);
            alert('操作失败');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden animate-fade-in-up">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-pink-50/50">
                    <h3 className="text-lg font-bold text-gray-800">添加到收藏夹</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                <div className="p-6 max-h-[60vh] overflow-y-auto">
                    {loading ? (
                        <div className="text-center py-8 text-gray-500">加载中...</div>
                    ) : (
                        <div className="space-y-3">
                            {folders.length === 0 && (
                                <p className="text-center text-gray-500 py-4 text-sm">还没有收藏夹，新建一个吧~</p>
                            )}

                            {folders.map(folder => {
                                const isSelected = selectedFolderIds.includes(folder.id);
                                return (
                                    <button
                                        key={folder.id}
                                        onClick={() => toggleFolder(folder.id)}
                                        className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all ${isSelected
                                            ? 'bg-pink-50 border-pink-200 text-pink-700'
                                            : 'bg-white border-gray-100 text-gray-600 hover:bg-gray-50'
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <span className="text-xl">
                                                {/* 简单的图标逻辑：有选中的就是实心星，没选中就是文件夹 */}
                                                {isSelected ? '★' : '📁'}
                                            </span>
                                            <span className="font-medium">{folder.name}</span>
                                        </div>
                                        {isSelected && (
                                            <svg className="w-5 h-5 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>

                <div className="p-6 bg-gray-50 border-t border-gray-100">
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={newFolderName}
                            onChange={(e) => setNewFolderName(e.target.value)}
                            placeholder="新建收藏夹名称..."
                            className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300 text-sm"
                            onKeyDown={(e) => e.key === 'Enter' && handleCreateFolder()}
                        />
                        <button
                            onClick={handleCreateFolder}
                            disabled={creating || !newFolderName.trim()}
                            className="px-4 py-2 bg-pink-400 text-white rounded-lg hover:bg-pink-500 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition"
                        >
                            {creating ? '...' : '新建'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
