'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { getRadioMessages, postRadioMessage, toggleReaction, getMessageReactions } from '@/services/radio';
import { RadioMessage } from '@/types';
import RadioMessageCard from '@/components/RadioMessageCard';
// import { getWorks } from '@/services/works';

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

    const [messages, setMessages] = useState<MessageWithReactions[]>([]);
    const [nickname, setNickname] = useState('');
    const [content, setContent] = useState('');
    // const [linkedWorkId, setLinkedWorkId] = useState<number | undefined>();
    // const [works, setWorks] = useState<Work[]>([]);
    // const [showWorkSelector, setShowWorkSelector] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [loadingMessages, setLoadingMessages] = useState(true);

    // Filter & Pagination & UI States
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const pageSize = 6;
    const [isFormExpanded, setIsFormExpanded] = useState(false);

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
        }
    }, [user, loading, router]);

    // 加载留言列表
    // 使用 user?.id 作为依赖，避免因 user 对象引用变化导致频繁刷新
    useEffect(() => {
        if (user?.id) {
            loadMessages();
        }
    }, [user?.id, page]);

    const loadMessages = async () => {
        try {
            setLoadingMessages(true);
            const { data, total } = await getRadioMessages(page, pageSize);

            // 为每条留言加载表情统计
            const messagesWithReactions = await Promise.all(
                data.map(async (msg) => {
                    const reactions = await getMessageReactions(msg.id);
                    return {
                        ...msg,
                        reactions
                    };
                })
            );

            setMessages(messagesWithReactions);
            setTotal(total);
        } catch (error) {
            console.error('加载留言失败:', error);
            // 避免在用户切换页面时频繁弹窗，改为console log或者静默失败
        } finally {
            setLoadingMessages(false);
        }
    };

    /* const loadWorks = async () => {
        try {
            const { data } = await getWorks({ page: 1, pageSize: 100 });
            setWorks(data);
        } catch (error) {
            console.error('加载作品列表失败:', error);
        }
    }; */

    const handleSubmit = async () => {
        if (!content.trim()) {
            alert('请输入留言内容');
            return;
        }

        if (!nickname.trim()) {
            alert('请输入昵称');
            return;
        }

        try {
            setSubmitting(true);
            await postRadioMessage({
                nickname: nickname.trim(),
                content: content.trim(),
                // linked_work_id: linkedWorkId
            });

            // 清空表单
            setNickname('');
            setContent('');
            // setLinkedWorkId(undefined);

            // 重新加载留言列表
            await loadMessages();

            alert('留言发送成功！');
        } catch (error) {
            console.error('发送留言失败:', error);
            alert('发送留言失败，请稍后再试');
        } finally {
            setSubmitting(false);
        }
    };

    const handleReact = async (messageId: number, emoji: string) => {
        try {
            await toggleReaction(messageId, emoji);

            // 更新该留言的表情统计
            const reactions = await getMessageReactions(messageId);
            setMessages(prev => prev.map(msg =>
                msg.id === messageId ? { ...msg, reactions } : msg
            ));
        } catch (error) {
            console.error('表情操作失败:', error);
            alert('操作失败，请稍后再试');
        }
    };

    // const selectedWork = works.find(w => w.id === linkedWorkId);

    if (loading) return null;
    if (!user) return null;

    return (
        <div className="container mx-auto p-4 sm:p-8 max-w-6xl">
            <header className="mb-8">
                <h1 className="text-3xl sm:text-3xl font-bold text-teal-500 mb-2">真心定格电台</h1>
                <p className="text-gray-600">有什么想说的话都可以在这里留下来~</p>
            </header>

            <div className="flex flex-col lg:flex-row gap-6 items-start">
                {/* 左侧：发送留言表单 (侧边栏模式) */}
                <aside className={`flex-shrink-0 transition-all duration-500 ease-in-out ${isFormExpanded ? 'lg:w-80' : 'lg:w-16'} sticky top-4 z-20`}>
                    <div className={`
                        border shadow-sm overflow-hidden transition-all relative
                        ${isFormExpanded
                            ? 'rounded-xl bg-gradient-to-br from-pink-50/80 to-mint-50/80 border-pink-200/50 p-5'
                            : 'rounded-full w-12 h-12 flex items-center justify-center bg-white border-gray-200 hover:bg-pink-50 hover:border-pink-300 hover:text-pink-500 cursor-pointer mx-auto mt-2'
                        }
                    `}
                        onClick={() => !isFormExpanded && setIsFormExpanded(true)}
                        title={!isFormExpanded ? "写留言" : ""}
                    >
                        {/* 顶部控制栏 */}
                        <div className={`flex items-center ${isFormExpanded ? 'justify-between mb-6' : 'justify-center w-full h-full'}`}>
                            {isFormExpanded ? (
                                <h2 className="text-lg font-bold text-teal-700">我要留言</h2>
                            ) : (
                                // 收起状态：显示笔图标
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9" /><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" /></svg>
                            )}

                            {isFormExpanded && (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setIsFormExpanded(!isFormExpanded);
                                    }}
                                    className="p-2 rounded-lg hover:bg-black/5 text-gray-500 transition-colors"
                                    title="收起"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 12l12 6" /></svg>
                                </button>
                            )}
                        </div>

                        {/* 表单内容 */}
                        {isFormExpanded && (
                            <div className="animate-in slide-in-from-left-2 fade-in duration-300">
                                {/* 昵称输入 */}
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                        昵称
                                    </label>
                                    <input
                                        type="text"
                                        value={nickname}
                                        onChange={(e) => setNickname(e.target.value)}
                                        className="w-full rounded-lg border-gray-200 p-2.5 focus:ring-2 focus:ring-mint focus:border-mint text-sm bg-white"
                                        placeholder="给自己起个可爱的名字..."
                                        maxLength={20}
                                    />
                                </div>

                                {/* 内容输入 */}
                                <div className="mb-5">
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                        内容 <span className="text-xs text-gray-400 font-normal">({content.length}字)</span>
                                    </label>
                                    <textarea
                                        value={content}
                                        onChange={(e) => setContent(e.target.value)}
                                        className="w-full h-48 rounded-lg border-gray-200 p-2.5 focus:ring-2 focus:ring-mint focus:border-mint resize-none text-sm bg-white leading-relaxed"
                                        placeholder="写下你想说的话..."
                                    ></textarea>
                                </div>

                                {/* 提交按钮 */}
                                <button
                                    onClick={handleSubmit}
                                    disabled={submitting}
                                    className="w-full px-4 py-2.5 bg-gradient-to-r from-pink-400 to-teal-400 text-white font-bold rounded-lg shadow-sm hover:shadow-md transition active:translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                                >
                                    {submitting ? '投递中...' : '📮 投递留言'}
                                </button>
                            </div>
                        )}
                    </div>
                </aside>

                {/* 右侧：留言列表 */}
                <main className="flex-1 w-full">
                    <div className="bg-white rounded-xl p-6 md:p-8 shadow-sm border border-gray-100 min-h-[500px]">
                        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-50">
                            <h2 className="text-xl font-bold text-gray-700">最新回声</h2>
                            <span className="text-sm text-gray-400 bg-gray-50 px-2 py-0.5 rounded-md">共 {total} 条</span>
                        </div>

                        {loadingMessages ? (
                            <div className="text-center text-gray-400 py-20">
                                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-teal-500 mx-auto mb-4"></div>
                                <p className="text-sm">接收电波中...</p>
                            </div>
                        ) : messages.length === 0 ? (
                            <div className="text-center text-gray-400 py-20">
                                <p>暂无留言，快来抢沙发~</p>
                            </div>
                        ) : (
                            <>
                                <div className="columns-1 md:columns-2 gap-5 space-y-5">
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
                                {Math.ceil(total / pageSize) > 1 && (
                                    <div className="mt-12 flex justify-center items-center gap-4">
                                        <button
                                            onClick={() => setPage(p => Math.max(1, p - 1))}
                                            disabled={page === 1}
                                            className="px-4 py-2 rounded-lg border border-gray-200 bg-white text-gray-600 disabled:opacity-50 hover:bg-gray-50 transition text-sm font-medium"
                                        >
                                            上一页
                                        </button>
                                        <span className="text-gray-400 font-medium text-xs">
                                            Page {page} of {Math.ceil(total / pageSize)}
                                        </span>
                                        <button
                                            onClick={() => setPage(p => Math.min(Math.ceil(total / pageSize), p + 1))}
                                            disabled={page === Math.ceil(total / pageSize)}
                                            className="px-4 py-2 rounded-lg border border-gray-200 bg-white text-gray-600 disabled:opacity-50 hover:bg-gray-50 transition text-sm font-medium"
                                        >
                                            下一页
                                        </button>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
}
