'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import type { QuizQuestion, QuizAnswer, QuizResult } from '@/types';

const TOTAL_TIME = 600; // 10 分钟

type Phase = 'email' | 'quiz' | 'result';

export default function QuizPage() {
    const router = useRouter();

    // 阶段
    const [phase, setPhase] = useState<Phase>('email');
    const [email, setEmail] = useState('');

    // 答题状态
    const [questions, setQuestions] = useState<QuizQuestion[]>([]);
    const [answers, setAnswers] = useState<Record<number, string>>({});
    const [currentIndex, setCurrentIndex] = useState(0);
    const [timeLeft, setTimeLeft] = useState(TOTAL_TIME);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [token, setToken] = useState('');
    const [warnings, setWarnings] = useState(0);

    // 结果
    const [result, setResult] = useState<QuizResult | null>(null);

    // refs
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const warningTimerRef = useRef<NodeJS.Timeout | null>(null);

    // 清理定时器
    useEffect(() => {
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
            if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
        };
    }, []);

    // 倒计时
    useEffect(() => {
        if (phase !== 'quiz') return;

        timerRef.current = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    // 时间到，自动提交
                    if (timerRef.current) clearInterval(timerRef.current);
                    handleSubmit(true);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [phase]);

    // 切屏警告
    useEffect(() => {
        if (phase !== 'quiz') return;

        const handleVisibility = () => {
            if (document.hidden) {
                setWarnings((prev) => {
                    const next = prev + 1;
                    if (next >= 3) {
                        // 超过3次，自动提交
                        toast.error('多次切换页面，答题已自动提交');
                        handleSubmit(true);
                    } else {
                        toast.warning(`警告（${next}/3）：请勿在答题期间切换页面`);
                    }
                    return next;
                });
            }
        };

        document.addEventListener('visibilitychange', handleVisibility);
        return () => document.removeEventListener('visibilitychange', handleVisibility);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [phase]);

    // 开始答题
    const startQuiz = async () => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setError('请输入有效的邮箱地址');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            // 先检查邮箱是否可用
            const checkRes = await fetch(`/api/quiz/check-email?email=${encodeURIComponent(email)}`);
            const checkData = await checkRes.json();

            if (!checkRes.ok) {
                setError(checkData.error || '检查失败');
                setLoading(false);
                return;
            }

            if (!checkData.available) {
                if (checkData.is_registered) {
                    setError('该邮箱已注册账号，请直接登录');
                } else if (checkData.is_verified) {
                    setError('该邮箱已通过糖点测试，请直接去注册');
                }
                setLoading(false);
                return;
            }

            // 获取题目
            const res = await fetch('/api/quiz/questions');
            const data = await res.json();

            if (!res.ok) {
                setError(data.error || '获取题目失败');
                setLoading(false);
                return;
            }

            setQuestions(data.questions);
            setToken(data.token);
            setPhase('quiz');
            setTimeLeft(TOTAL_TIME);
            setCurrentIndex(0);
            setAnswers({});
            setWarnings(0);
        } catch {
            setError('网络错误，请重试');
        } finally {
            setLoading(false);
        }
    };

    // 提交答案
    const handleSubmit = useCallback(
        async (isAutoSubmit = false) => {
            if (submitting) return;
            setSubmitting(true);

            const answerList: QuizAnswer[] = questions.map((q) => ({
                id: q.id,
                answer: answers[q.id] || '',
            }));

            // 过滤掉未作答的题目
            const validAnswers = answerList.filter((a) => a.answer !== '');

            try {
                const res = await fetch('/api/quiz/submit', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        email,
                        answers: validAnswers,
                        token,
                    }),
                });

                const data = await res.json();

                if (!res.ok) {
                    toast.error(data.error || '提交失败');
                    setSubmitting(false);
                    return;
                }

                setResult(data);
                setPhase('result');

                if (data.passed) {
                    toast.success('恭喜！糖点测试通过！');
                } else {
                    toast.error(`得分 ${data.score} 分，未达到 80 分，可以重新答题`);
                }
            } catch {
                toast.error('网络错误，提交失败');
            } finally {
                setSubmitting(false);
            }
        },
        [questions, answers, email, token, submitting]
    );

    // 选择答案
    const selectAnswer = (questionId: number, option: string) => {
        setAnswers((prev) => ({ ...prev, [questionId]: option }));
    };

    // 格式化倒计时
    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    // 已答题数量
    const answeredCount = Object.keys(answers).filter(
        (k) => answers[Number(k)] !== ''
    ).length;

    const currentQuestion = questions[currentIndex];
    const isLastQuestion = currentIndex === questions.length - 1;

    // ===== 邮箱输入阶段 =====
    if (phase === 'email') {
        return (
            <div className="min-h-[80vh] flex items-center justify-center p-4">
                <div className="bg-white p-8 rounded-2xl border border-gray-200 w-full max-w-md">
                    <h1 className="text-2xl font-bold text-center text-gray-800 mb-2">
                        准奎糖点测试
                    </h1>
                    <p className="text-center text-gray-500 text-sm mb-6">
                        10道选择题 · 限时10分钟 · 80分通过
                    </p>

                    {error && (
                        <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">
                            {error}
                        </div>
                    )}

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                邮箱
                            </label>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => {
                                    setEmail(e.target.value);
                                    setError(null);
                                }}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') startQuiz();
                                }}
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-bamguet focus:border-transparent"
                                placeholder="your@email.com"
                            />
                            <p className="text-xs text-gray-400 mt-1">
                                通过后此邮箱将用于注册账号，请务必确认邮箱正确性！
                            </p>
                        </div>

                        <button
                            onClick={startQuiz}
                            disabled={loading}
                            className="w-full py-2.5 bg-bamguet-dark text-white rounded-lg font-bold hover:brightness-110 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? '加载题目中...' : '开始答题'}
                        </button>
                    </div>

                    <div className="mt-6 text-center text-sm text-gray-500">
                        已有账号？{' '}
                        <Link href="/login" prefetch={false} className="text-bamguet-dark hover:underline">
                            直接登录
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    // ===== 结果阶段 =====
    if (phase === 'result' && result) {
        return (
            <div className="min-h-[80vh] flex items-center justify-center p-4">
                <div className="bg-white p-8 rounded-2xl border border-gray-200 w-full max-w-md text-center">
                    {result.passed ? (
                        <>
                            <div className="text-5xl mb-4">🎉</div>
                            <h2 className="text-2xl font-bold text-green-600 mb-2">测试通过！</h2>
                            <p className="text-gray-500 mb-4">
                                得分 {result.score} 分（{result.correct}/{result.total}）
                            </p>
                            <p className="text-gray-600 text-sm mb-6">
                                你的邮箱 <span className="font-bold">{email}</span> 已通过验证，现在可以使用它注册账号了。
                            </p>
                            <Link
                                href="/register"
                                prefetch={false}
                                className="block w-full py-2.5 bg-bamguet-dark text-white rounded-lg font-bold hover:brightness-110 transition-colors"
                            >
                                去注册
                            </Link>
                        </>
                    ) : (
                        <>
                            <div className="text-5xl mb-4">😢</div>
                            <h2 className="text-2xl font-bold text-red-500 mb-2">未通过</h2>
                            <p className="text-gray-500 mb-4">
                                得分 {result.score} 分（{result.correct}/{result.total}）— 需要 80 分才能通过
                            </p>
                            <p className="text-gray-600 text-sm mb-6">
                                别灰心，你可以重新答题，不限次数哦。
                            </p>
                            <button
                                onClick={() => {
                                    setPhase('email');
                                    setResult(null);
                                    setError(null);
                                }}
                                className="block w-full py-2.5 bg-bamguet-dark text-white rounded-lg font-bold hover:brightness-110 transition-colors"
                            >
                                重新答题
                            </button>
                        </>
                    )}
                </div>
            </div>
        );
    }

    // ===== 答题阶段 =====
    return (
        <div className="min-h-screen bg-gray-50">
            {/* 顶部栏：倒计时 + 进度 */}
            <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 py-3">
                <div className="max-w-4xl mx-auto flex items-center justify-between">
                    <div className="text-sm text-gray-500">
                        已答 <span className="font-bold text-gray-700">{answeredCount}</span>/{questions.length}
                    </div>
                    <div
                        className={`text-lg font-mono font-bold tabular-nums ${
                            timeLeft <= 60 ? 'text-red-500 animate-pulse' : 'text-gray-700'
                        }`}
                    >
                        {formatTime(timeLeft)}
                    </div>
                    <button
                        onClick={() => handleSubmit(false)}
                        disabled={submitting}
                        className="px-4 py-1.5 bg-bamguet-dark text-white text-sm rounded-lg font-bold hover:brightness-110 transition-colors disabled:opacity-50"
                    >
                        {submitting ? '提交中...' : '交卷'}
                    </button>
                </div>
                {/* 进度条 */}
                <div className="max-w-4xl mx-auto mt-2 h-1 bg-gray-100 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-bamguet-dark transition-all duration-300"
                        style={{ width: `${((TOTAL_TIME - timeLeft) / TOTAL_TIME) * 100}%` }}
                    />
                </div>
            </div>

            <div className="max-w-4xl mx-auto p-4 flex flex-col lg:flex-row gap-6">
                {/* 题目区 */}
                <div className="flex-1">
                    {currentQuestion && (
                        <div className="bg-white p-6 rounded-2xl border border-gray-200">
                            <div className="text-sm text-gray-400 mb-2">
                                第 {currentIndex + 1} / {questions.length} 题
                            </div>
                            <h3 className="text-lg font-bold text-gray-800 mb-6">
                                {currentQuestion.question}
                            </h3>
                            <div className="space-y-3">
                                {(['a', 'b', 'c', 'd'] as const).map((opt) => (
                                    <button
                                        key={opt}
                                        onClick={() => selectAnswer(currentQuestion.id, opt)}
                                        className={`w-full text-left px-4 py-3 rounded-xl border-2 transition-all ${
                                            answers[currentQuestion.id] === opt
                                                ? 'border-bamguet-dark bg-bamguet/10'
                                                : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                    >
                                        <span className="font-bold text-bamguet-dark mr-2">
                                            {opt.toUpperCase()}.
                                        </span>
                                        {currentQuestion[`option_${opt}` as keyof QuizQuestion]}
                                    </button>
                                ))}
                            </div>

                            {/* 翻页按钮 */}
                            <div className="flex justify-between mt-6">
                                <button
                                    onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
                                    disabled={currentIndex === 0}
                                    className="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed"
                                >
                                    上一题
                                </button>
                                {isLastQuestion ? (
                                    <button
                                        onClick={() => handleSubmit(false)}
                                        disabled={submitting}
                                        className="px-4 py-2 text-sm bg-bamguet-dark text-white rounded-lg font-bold hover:brightness-110 disabled:opacity-50"
                                    >
                                        {submitting ? '提交中...' : '交卷'}
                                    </button>
                                ) : (
                                    <button
                                        onClick={() =>
                                            setCurrentIndex((prev) => Math.min(questions.length - 1, prev + 1))
                                        }
                                        className="px-4 py-2 text-sm bg-bamguet-dark text-white rounded-lg font-bold hover:brightness-110"
                                    >
                                        下一题
                                    </button>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* 侧边导航：题目编号 */}
                <div className="lg:w-48 flex-shrink-0">
                    <div className="bg-white p-4 rounded-2xl border border-gray-200 sticky top-24">
                        <h4 className="text-sm font-bold text-gray-500 mb-3">题目导航</h4>
                        <div className="grid grid-cols-5 lg:grid-cols-4 gap-2">
                            {questions.map((q, idx) => {
                                const isAnswered = answers[q.id] && answers[q.id] !== '';
                                const isCurrent = idx === currentIndex;
                                return (
                                    <button
                                        key={q.id}
                                        onClick={() => setCurrentIndex(idx)}
                                        className={`w-9 h-9 rounded-lg text-sm font-bold transition-all ${
                                            isCurrent
                                                ? 'bg-bamguet-dark text-white ring-2 ring-bamguet/30'
                                                : isAnswered
                                                  ? 'bg-green-100 text-green-700 border border-green-300'
                                                  : 'bg-gray-100 text-gray-400 border border-gray-200 hover:border-gray-300'
                                        }`}
                                    >
                                        {idx + 1}
                                    </button>
                                );
                            })}
                        </div>
                        <div className="mt-3 text-xs text-gray-400 space-y-1">
                            <div className="flex items-center gap-1.5">
                                <span className="w-3 h-3 rounded bg-green-100 border border-green-300" />
                                已作答
                            </div>
                            <div className="flex items-center gap-1.5">
                                <span className="w-3 h-3 rounded bg-gray-100 border border-gray-200" />
                                未作答
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
