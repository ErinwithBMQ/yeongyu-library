'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { getRadioMessages, postRadioMessage, toggleReaction, getMessageReactions } from '@/services/radio';
import { RadioMessage } from '@/types';
import RadioMessageCard from '@/components/RadioMessageCard';
import Pagination from '@/components/Pagination';
import { toast } from 'sonner';
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
    const pageSize = 8;

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
                // linked_work_id: linkedWorkId
            });

            // 清空表单
            setNickname('');
            setContent('');
            // setLinkedWorkId(undefined);

            // 重新加载留言列表
            await loadMessages();

            toast.success('留言发送成功！');
        } catch (error) {
            console.error('发送留言失败:', error);
            toast.error('发送留言失败，请稍后再试');
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
            toast.error('操作失败，请稍后再试');
        }
    };

    // const selectedWork = works.find(w => w.id === linkedWorkId);

    if (loading) return null;
    if (!user) return null;

    return (
        <div className="container mx-auto p-4 sm:p-8 max-w-6xl">
            <header className="mb-5">
                <h1 className="text-2xl sm:text-2xl font-bold text-bamguet-dark mb-2">真心定格电台</h1>
                <p className="text-gray-500">电台来信、贴表情等功能可能加载较慢，敬请谅解</p>
            </header>
            <div className="border-b border-gray-200 my-5"></div>
            <div className="flex flex-col gap-10">
                {/* 上方：留言列表 */}
                <main className="w-full">
                    <div className="">
                        <div className="flex items-center gap-3 mb-5 pb-4 border-b border-gray-50">
                            <div className="text-gray-500">电台目前共收到 <div className="inline text-bamguet-dark font-bold">{total}</div> 条留言/来信，持续接收中...</div>
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
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                    内容 <span className="text-xs text-gray-400 font-normal">({content.length}字)</span>
                                </label>
                                <textarea
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                    className="w-full h-32 md:h-40 rounded-md border-gray-200 p-3 focus:ring-2 focus:ring-gray-400 focus:border-transparent resize-none text-sm bg-gray-50 leading-relaxed"
                                    placeholder="写下你想说的话..."
                                ></textarea>
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
                                    <span>投递留言</span>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
