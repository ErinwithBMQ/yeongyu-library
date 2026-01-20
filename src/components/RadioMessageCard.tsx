'use client';

import { useState } from 'react';
import { RadioMessage } from '@/types';
import Link from 'next/link';

interface RadioMessageCardProps {
    message: RadioMessage & {
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
    };
    onReact: (messageId: number, emoji: string) => void;
}

const EMOJI_OPTIONS = ['❤️', '😭', '😂', '👍', '🎉', '💕'];

export default function RadioMessageCard({ message, onReact }: RadioMessageCardProps) {
    const [expanded, setExpanded] = useState(false);
    const isShort = message.content.length <= 150;
    const messageType = isShort ? '留言' : '来信';
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);

    // 信封模式下截取前150字
    const getPreview = () => {
        if (isShort) return message.content;
        return message.content.slice(0, 150);
    };

    return (
        <div
            className={`relative ${isShort
                ? 'bg-sakura-light border-sakura'
                : 'bg-hwangchoon-light border-hwangchoon'
                } border rounded-lg p-4 transition-all`}
        >
            {/* 头部：昵称 + 类型标签 */}
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-700">
                        来自 {message.nickname} 的{messageType}
                    </span>
                </div>
                <span className="text-xs text-gray-400">
                    {new Date(message.created_at).toLocaleDateString('zh-CN', {
                        month: 'numeric',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                    })}
                </span>
            </div>

            {/* 正文内容 */}
            <div className="mb-3">
                {isShort ? (
                    <p className="text-gray-800 whitespace-pre-wrap">{message.content}</p>
                ) : (
                    <>
                        <p className="text-gray-800 whitespace-pre-wrap">
                            {expanded ? message.content : getPreview() + '...'}
                        </p>
                        <button
                            onClick={() => setExpanded(!expanded)}
                            className="text-sm text-hwangchoon-dark hover:text-hwangchoon mt-2 font-medium"
                        >
                            {expanded ? '收起' : '展开阅读'}
                        </button>
                    </>
                )}
            </div>

            {/* 引用的作品 - 暂时移除 */}
            {/* {message.linked_work && (
                <Link
                    href={`/library/${message.linked_work.id}`}
                    className="inline-flex items-center gap-2 px-3 py-1.5 bg-mint/20 text-teal-700 rounded-full text-sm hover:bg-mint/30 transition"
                >
                    <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                        />
                    </svg>
                    <span>{message.linked_work.title}</span>
                    <span className="text-xs text-gray-500">by {message.linked_work.author_name}</span>
                </Link>
            )} */}

            {/* 表情反应区 */}
            <div className="flex items-center gap-2 mt-4 flex-wrap">
                {message.reactions?.map((reaction, idx) => (
                    <button
                        key={idx}
                        onClick={() => onReact(message.id, reaction.emoji)}
                        className={`px-2 py-1 rounded-full text-sm transition ${reaction.userReacted
                            ? 'bg-pink-100 ring-2 ring-pink-300'
                            : 'bg-gray-100 hover:bg-gray-200'
                            }`}
                    >
                        {reaction.emoji} {reaction.count}
                    </button>
                ))}

                {/* 添加表情按钮 */}
                <div className="relative">
                    <button
                        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                        className="px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded-full text-sm transition"
                        title="添加表情"
                    >
                        +
                    </button>
                    {showEmojiPicker && (
                        <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 bg-white border border-gray-200 rounded-lg shadow-lg p-2 flex gap-1 z-10 w-max">
                            {EMOJI_OPTIONS.map((emoji) => (
                                <button
                                    key={emoji}
                                    onClick={() => {
                                        onReact(message.id, emoji);
                                        setShowEmojiPicker(false);
                                    }}
                                    className="hover:bg-gray-100 rounded px-2 py-1 text-lg"
                                >
                                    {emoji}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
