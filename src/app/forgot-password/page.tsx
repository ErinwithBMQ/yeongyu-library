'use client';

import { useState } from 'react';
import { sendPasswordResetEmail } from '@/services/auth';
import { toast } from 'sonner';
import Link from 'next/link';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await sendPasswordResetEmail(email);
            setSuccess(true);
            toast.success('重置邮件已发送，请检查收件箱');
        } catch (error: any) {
            console.error('Reset password error:', error);
            // Translate common Supabase errors
            let msg = error.message;
            if (msg === 'For security purposes, you can only request this once every 60 seconds.') {
                msg = '请求过于频繁，请60秒后再试';
            }
            toast.error(msg || '发送失败，请稍后重试');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-[80vh] flex items-center justify-center p-4">
                <div className="bg-white p-8 rounded-2xl border border-gray-200 w-full max-w-md text-center">
                    <h1 className="text-2xl font-bold text-gray-800 mb-4">邮件已发送</h1>
                    <p className="text-gray-600 mb-6">
                        我们已向 <strong>{email}</strong> 发送了重置密码的链接，请查收邮件并按提示操作。
                    </p>
                    <Link href="/login" className="text-bamguet-dark hover:underline font-medium">
                        返回登录
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-[80vh] flex items-center justify-center p-4">
            <div className="bg-white p-8 rounded-2xl border border-gray-200 w-full max-w-md">
                <h1 className="text-2xl font-bold text-center text-gray-800 mb-2">忘记密码</h1>
                <p className="text-sm text-center text-gray-500 mb-6">输入您的注册邮箱，我们将发送重置链接给您</p>

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
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-2.5 bg-bamguet-dark text-white rounded-lg font-bold hover:brightness-110 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                    >
                        {loading ? '发送重置邮件' : '发送重置邮件'}
                    </button>

                    <div className="text-center mt-4">
                        <Link href="/login" className="text-sm text-gray-500 hover:text-bamguet-dark">
                            想起密码了？返回登录
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
}
