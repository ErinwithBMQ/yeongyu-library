'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { updatePassword } from '@/services/auth';
import { toast } from 'sonner';

export default function ResetPasswordPage() {
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await updatePassword(password);
            toast.success('密码修改成功，请重新登录');
            // Allow session to propagate or clear it?
            // Usually after password reset, the user stays logged in. 
            // Depending on req, we might want to redirect to home or login.
            // Let's redirect to library.
            router.push('/library');
        } catch (error: any) {
            console.error('Update password error:', error);
            toast.error(error.message || '重置密码失败，请重试');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center p-4">
            <div className="bg-white p-8 rounded-2xl border border-gray-200 w-full max-w-md">
                <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">重置新密码</h1>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">新密码</label>
                        <input
                            type="password"
                            required
                            minLength={6}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-bamguet focus:border-transparent"
                            placeholder="请输入新密码"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-2.5 bg-bamguet-dark text-white rounded-lg font-bold hover:brightness-110 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                    >
                        {loading ? '保存密码' : '保存密码'}
                    </button>
                </form>
            </div>
        </div>
    );
}
