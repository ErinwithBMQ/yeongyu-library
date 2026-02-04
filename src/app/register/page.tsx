'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signUpWithInviteCode } from '@/services/auth';
import { toast } from 'sonner';

export default function RegisterPage() {
    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [inviteCode, setInviteCode] = useState('');

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        if (password !== confirmPassword) {
            setError('两次输入的密码不一致');
            setLoading(false);
            return;
        }

        try {
            const { session } = await signUpWithInviteCode(email, password, inviteCode, username);

            if (!session) {
                toast.success('注册成功！现在可以登录啦！', { duration: 6000 });
                router.push('/login');
            } else {
                // If email confirmation is disabled or auto-confirmed
                toast.success('注册成功！');
                router.push('/');
                router.refresh();
            }
        } catch (err: any) {
            console.error(err);
            setError(err.message || '注册失败，请检查邀请码或其他信息');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center p-4">
            <div className="bg-white p-8 rounded-2xl border border-gray-200 w-full max-w-md">
                <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">加入小章鱼存档地</h1>

                {error && (
                    <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">邮箱</label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-bamguet focus:border-transparent"
                            placeholder="your@email.com"
                        />
                        <p className="text-xs text-gray-400 mt-1">需与申请邀请码时填写的邮箱一致</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">用户名</label>
                        <input
                            type="text"
                            required
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-bamguet focus:border-transparent"
                            placeholder="给自己起个名字吧"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">密码</label>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-bamguet focus:border-transparent"
                            placeholder="••••••••"
                            minLength={6}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">确认密码</label>
                        <input
                            type="password"
                            required
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-bamguet focus:border-transparent"
                            placeholder="••••••••"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">邀请码</label>
                        <input
                            type="text"
                            required
                            value={inviteCode}
                            onChange={(e) => setInviteCode(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-bamguet focus:border-transparent font-mono"
                            placeholder="粘贴您的邀请码"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-2.5 bg-bamguet-dark text-white rounded-lg font-bold hover:brightness-110 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-4"
                    >
                        {loading ? '注册中...' : '注册'}
                    </button>
                </form>

                <div className="mt-6 text-center text-sm text-gray-500">
                    已有账号？{' '}
                    <Link href="/login" className="text-bamguet-dark hover:underline">
                        直接登录
                    </Link>
                </div>
            </div>
        </div>
    );
}
