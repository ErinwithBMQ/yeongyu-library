'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { signOut, updatePassword } from '@/services/auth';

export default function MePage() {
    const { user, loading } = useAuth();
    const router = useRouter();

    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [isUpdating, setIsUpdating] = useState(false);

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
        }
    }, [user, loading, router]);

    const handleLogout = async () => {
        const confirmLogout = window.confirm('确定要退出登录吗？');
        if (!confirmLogout) return;

        try {
            await signOut();
            router.push('/');
            router.refresh();
        } catch (error) {
            console.error('Logout failed', error);
        }
    };

    const handleUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword.length < 6) {
            setMessage({ type: 'error', text: '密码长度至少需要6位' });
            return;
        }

        if (newPassword !== confirmPassword) {
            setMessage({ type: 'error', text: '两次输入的密码不一致' });
            return;
        }

        setIsUpdating(true);
        setMessage(null);

        try {
            await updatePassword(newPassword);
            setMessage({ type: 'success', text: '密码修改成功' });
            setNewPassword('');
            setConfirmPassword('');
        } catch (error: any) {
            console.error(error); // Add this line to use the error variable
            setMessage({ type: 'error', text: error.message || '修改失败' });
        } finally {
            setIsUpdating(false);
        }
    };

    if (loading) return null;
    if (!user) return null;

    return (
        <div className="container mx-auto p-4 sm:p-8 max-w-2xl min-h-[70vh]">
            <h1 className="text-3xl font-bold text-gray-800 mb-8">个人中心</h1>

            <div className="space-y-6">
                {/* User Info Card */}
                <div className="bg-white rounded-2xl p-6 border border-gray-200 flex items-center gap-4">
                    <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center text-3xl">
                        🐙
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-gray-800">
                            {user.user_metadata?.username || '小章鱼'}
                        </h2>
                        <p className="text-gray-500">{user.email}</p>
                    </div>
                </div>

                {/* Change Password Card */}
                <div className="bg-white rounded-2xl p-6 border border-gray-200">
                    <h3 className="text-lg font-bold text-gray-700 mb-4 border-b border-gray-50 pb-2">修改密码</h3>

                    {message && (
                        <div className={`p-3 rounded-lg mb-4 text-sm ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                            {message.text}
                        </div>
                    )}

                    <form onSubmit={handleUpdatePassword} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">新密码</label>
                            <input
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300"
                                placeholder="输入新密码"
                                minLength={6}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">确认新密码</label>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300"
                                placeholder="再次输入新密码"
                                minLength={6}
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={isUpdating || !newPassword}
                            className="px-6 py-2 bg-bamguet text-white rounded-lg font-medium hover:bg-bamguet-dark transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isUpdating ? '修改中...' : '确认修改'}
                        </button>
                    </form>
                </div>

                {/* Logout Button */}
                <div className="bg-white rounded-2xl p-6 border border-gray-200">
                    <h3 className="text-lg font-bold text-gray-700 mb-4 border-b border-gray-50 pb-2">账号操作</h3>
                    <button
                        onClick={handleLogout}
                        className="w-full sm:w-auto px-6 py-2 border border-red-200 text-red-600 rounded-lg font-medium hover:bg-red-50 transition"
                    >
                        退出登录
                    </button>
                </div>
            </div>
        </div>
    );
}
