'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { getRadioMessages, postRadioMessage, toggleReaction } from '@/services/radio';
import { RadioMessage } from '@/types';
import RadioMessageCard from '@/components/RadioMessageCard';
import Pagination from '@/components/Pagination';
import { toast } from 'sonner';
import useSWR from 'swr';
import { getWorks } from '@/services/works';
import { WorkWithTags } from '@/types';

interface MessageWithReactions extends RadioMessage {
    linked_work?: {
        id: number;
        title: string;
        author_name: string;
    };
    reactions?: Array<{
        emoji: string;
        count: number;
        userReacted: boolean;
    }>;
}

export default function RadioPage() {
    const { user, loading } = useAuth();
    const router = useRouter();

    // const [messages, setMessages] = useState<MessageWithReactions[]>([]); // Replaced by SWR
    const [nickname, setNickname] = useState('');
    const [content, setContent] = useState('');
    const [submitting, setSubmitting] = useState(false);
    // const [loadingMessages, setLoadingMessages] = useState(true); // Replaced by SWR

    // Filter & Pagination & UI States
    const [page, setPage] = useState(1);
    // const [total, setTotal] = useState(0); // Replaced by SWR
    const pageSize = 9;


    // Work Citation States
    const [linkedWork, setLinkedWork] = useState<WorkWithTags | undefined>(undefined);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<WorkWithTags[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showResults, setShowResults] = useState(false);

    // Search Works Effect
    useEffect(() => {
        const timer = setTimeout(async () => {
            if (searchQuery.trim()) {
                setIsSearching(true);
                try {
                    const { data } = await getWorks({
                        searchQuery: searchQuery,
                        pageSize: 20
                    });
                    setSearchResults(data);
                    setShowResults(true);
                } catch (error) {
                    console.error('Failed to search works', error);
                } finally {
                    setIsSearching(false);
                }
            } else {
                setSearchResults([]);
                setShowResults(false);
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [searchQuery]);

    const handleSelectWork = (work: WorkWithTags) => {
        setLinkedWork(work);
        setSearchQuery('');
        setShowResults(false);
    };

    const handleKeydown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
        }
    };

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
        }
    }, [user, loading, router]);

    // SWR Fetcher
    const { data: swrData, isLoading: loadingMessages, isValidating, mutate } = useSWR(
        user?.id ? ['/api/radio/messages', page] : null,
        async () => {
            const { data, total } = await getRadioMessages(page, pageSize);
            return { messages: data, total };
        },
        {
            keepPreviousData: true,
            revalidateOnFocus: false
        }
    );

    const messages = swrData?.messages || [];
    const total = swrData?.total || 0;

    /* Removed manual loadMessages */

    const handleSubmit = async () => {
        if (!content.trim()) {
            toast.warning('请输入留言内容');
            return;
        }

        if (!nickname.trim()) {
            toast.warning('请输入昵称');
            return;
        }

        try {
            setSubmitting(true);
            await postRadioMessage({
                nickname: nickname.trim(),
                content: content.trim(),
                linked_work_id: linkedWork?.id
            });

            // 清空表单
            setNickname('');
            setContent('');
            setLinkedWork(undefined);

            // 重新加载留言列表
            await mutate();

            toast.success('留言发送成功！');
        } catch (error) {
            console.error('发送留言失败:', error);
            toast.error('发送留言失败，请稍后再试');
        } finally {
            setSubmitting(false);
        }
    };

    const handleReact = async (messageId: number, emoji: string) => {
        // 1. 找到当前要操作的留言及其原始状态（用于回滚）
        const messageIndex = messages.findIndex(m => m.id === messageId);
        if (messageIndex === -1) return;

        const originalMessage = messages[messageIndex];
        const originalReactions = originalMessage.reactions || [];

        // 2. 构造新的 reactions 数组（乐观更新逻辑）
        let newReactions = [...originalReactions];
        const infoIndex = newReactions.findIndex(r => r.emoji === emoji);

        if (infoIndex > -1) {
            // 已存在该表情记录
            const info = newReactions[infoIndex];
            const wasReacted = info.userReacted;

            // 切换状态: 如果之前点了，现在就是取消（-1）；没点就是点赞（+1）
            const newCount = wasReacted ? info.count - 1 : info.count + 1;

            if (newCount > 0) {
                newReactions[infoIndex] = {
                    ...info,
                    count: newCount,
                    userReacted: !wasReacted
                };
            } else {
                // 如果数量归零，直接从数组中移除，实现“消失”效果
                newReactions.splice(infoIndex, 1);
            }
        } else {
            // 不存在该表情记录，说明是新的点赞
            newReactions.push({
                emoji,
                count: 1,
                userReacted: true
            });
        }

        // 3. 构造新的消息列表用于乐观更新
        const newMessages = messages.map(msg =>
            msg.id === messageId ? { ...msg, reactions: newReactions } : msg
        );

        const newData = { messages: newMessages, total };

        // 4. 立即应用乐观更新 (mutate with optimistic data, do not revalidate yet)
        mutate(newData, false);

        // 5. 发送请求
        try {
            await toggleReaction(messageId, emoji);
            // 请求成功，可以选择静默，或者后台静默重新校验以确保数据一致性
            // 这里我们选择静默，因为我们很自信，或者可以 mutate() 触发重新拉取
            // 但为了防止表情跳变（重新拉取会重置 count），我们可以只在出错时回滚
        } catch (error) {
            console.error('表情操作失败:', error);

            // 6. 请求失败，回滚状态 (trigger revalidation to restore truth)
            mutate();

            // 提示用户
            toast.error('网络开小差了，点赞失败');
        }
    };

    // const selectedWork = works.find(w => w.id === linkedWorkId);

    if (loading) return null;
    if (!user) return null;

    return (
        <div className="container mx-auto p-4 sm:p-8 max-w-6xl">
            <header className="mb-4">
                <h1 className="text-2xl sm:text-2xl font-bold text-bamguet-dark mb-2">真心定格电台</h1>
            </header>
            <div className="border-b border-gray-200 my-5"></div>
            <div className="flex flex-col gap-10">
                {/* 上方：留言列表 */}
                <main className="w-full">
                    <div className="">
                        <div className="flex items-center gap-3 mb-5 pb-4 border-b border-gray-50">
                            <div className="text-gray-500">电台目前共收到 <div className="inline text-bamguet-dark font-bold">{total}</div> 条留言/来信，持续接收中...</div>
                            <button
                                onClick={() => {
                                    mutate();
                                    toast.success('已刷新');
                                }}
                                className="p-1.5 text-gray-400 hover:text-bamguet-dark hover:bg-gray-100 rounded-full transition-all"
                                title="刷新留言"
                                disabled={isValidating}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={isValidating ? "animate-spin" : ""}><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" /><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" /><path d="M16 16h5v5" /></svg>
                            </button>
                        </div>

                        {loadingMessages ? (
                            <div className="text-center text-gray-400 py-20">
                                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-bamguet mx-auto mb-4"></div>
                                <p className="text-sm">接收电台信号中...</p>
                            </div>
                        ) : messages.length === 0 ? (
                            <div className="text-center text-gray-400 py-20">
                                <p>暂无留言，快来抢沙发~</p>
                            </div>
                        ) : (
                            <>
                                <div className="columns-1 md:columns-2 lg:columns-3 gap-5 space-y-5">
                                    {messages.map(msg => (
                                        <div key={msg.id} className="break-inside-avoid">
                                            <RadioMessageCard
                                                message={msg}
                                                onReact={handleReact}
                                            />
                                        </div>
                                    ))}
                                </div>

                                {/* Pagination Controls */}
                                <Pagination
                                    currentPage={page}
                                    totalCount={total}
                                    pageSize={pageSize}
                                    onPageChange={setPage}
                                />
                            </>
                        )}
                    </div>
                </main>

                {/* 下方：发送留言表单 */}
                <div className="w-full max-w-5xl mx-auto py-12">
                    <div className="flex flex-col md:flex-row gap-10 md:gap-20 items-start">
                        {/* 左侧：大标题 */}
                        <div className="md:w-1/3 pt-2">
                            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 leading-tight">
                                在这里留下<br className="hidden md:block" />你想说的话吧
                            </h2>
                            <div className="mt-5 text-gray-500">希望你的今日也是开心的一天！</div>
                        </div>

                        {/* 右侧：表单 */}
                        <div className="flex-1 w-full animate-in slide-in-from-bottom-2 fade-in duration-500">
                            {/* 昵称输入 */}
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                    昵称
                                </label>
                                <input
                                    type="text"
                                    value={nickname}
                                    onChange={(e) => setNickname(e.target.value)}
                                    className="w-full rounded-md border-gray-200 p-3 focus:ring-2 focus:ring-gray-400 focus:border-transparent text-sm bg-gray-50 transition-all"
                                    placeholder="给自己起个可爱的名字..."
                                    maxLength={20}
                                />
                            </div>

                            {/* 内容输入 */}
                            <div className="mb-3">
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                    内容 <span className="text-xs text-gray-400 font-normal">({content.length}字)</span>
                                </label>
                                <textarea
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                    className="w-full h-32 md:h-40 rounded-md border-gray-200 p-3 focus:ring-2 focus:ring-gray-400 focus:border-transparent resize-none text-sm bg-gray-50 leading-relaxed"
                                    placeholder="写下你想说的话...（小于80字显示为留言，超过80字显示为来信）"
                                ></textarea>
                            </div>

                            {/* 引用作品 (可选) */}
                            <div className="mb-6 relative">
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                    推荐作品 <span className="text-xs text-gray-400 font-normal">(可选，输入标题或作者搜索)</span>
                                </label>

                                {linkedWork ? (
                                    <div className="flex items-center gap-2 p-2 bg-pink-50 border border-pink-200 rounded-md text-sm text-pink-700">
                                        <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                                        </svg>
                                        <span className="flex-1 truncate font-medium">
                                            {linkedWork.title} <span className="text-pink-400 font-normal text-xs ml-1">by {linkedWork.author_name}</span>
                                        </span>
                                        <button
                                            onClick={() => setLinkedWork(undefined)}
                                            className="p-1 hover:bg-pink-200 rounded-full transition"
                                            title="取消选择"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    </div>
                                ) : (
                                    <div className="relative">
                                        <div className="relative">
                                            <input
                                                type="text"
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                onKeyDown={handleKeydown}
                                                className="w-full rounded-md border-gray-200 p-3 pl-9 focus:ring-2 focus:ring-gray-400 focus:border-transparent text-sm bg-gray-50 transition-all"
                                                placeholder="搜索作品..."
                                            />
                                            <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                            </svg>
                                            {isSearching && (
                                                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                                    <div className="animate-spin h-4 w-4 border-2 border-gray-300 border-t-gray-600 rounded-full"></div>
                                                </div>
                                            )}
                                        </div>

                                        {/* 下拉搜索结果 */}
                                        {showResults && searchQuery && (
                                            <div className="absolute bottom-full left-0 right-0 mb-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-60 overflow-y-auto z-50">
                                                {searchResults.length > 0 ? (
                                                    <ul className="py-1">
                                                        {searchResults.map(work => (
                                                            <li
                                                                key={work.id}
                                                                onClick={() => handleSelectWork(work)}
                                                                className="px-4 py-2 hover:bg-pink-50 cursor-pointer transition border-b border-gray-50 last:border-0"
                                                            >
                                                                <div className="text-sm font-medium text-gray-800">{work.title}</div>
                                                                <div className="text-xs text-gray-500">作者: {work.author_name}</div>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                ) : (
                                                    <div className="px-4 py-3 text-sm text-gray-500 text-center">
                                                        未找到相关作品
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* 提交按钮 */}
                            <button
                                onClick={handleSubmit}
                                disabled={submitting}
                                className="w-full md:w-auto px-8 py-3 bg-bamguet-dark text-white font-medium rounded-md hover:bg-bamguet transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed text-base flex justify-center items-center gap-2"
                            >
                                {submitting ? (
                                    <>
                                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        <span>投递中...</span>
                                    </>
                                ) : (
                                    <span>点击投递</span>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
