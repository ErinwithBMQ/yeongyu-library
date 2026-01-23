'use client';

import { use, useEffect, useState } from 'react';
import AddWorkForm from '@/components/AddWorkForm';
import { getWorkById } from '@/services/works';
import { WorkWithTags } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function EditWorkPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [work, setWork] = useState<WorkWithTags | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
            return;
        }

        const fetchWork = async () => {
            try {
                const data = await getWorkById(parseInt(id));
                setWork(data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchWork();
    }, [id, user, authLoading, router]);

    if (authLoading || loading) return <div className="p-10 text-center text-gray-500">加载中...</div>;
    if (!work) return <div className="p-10 text-center text-gray-500">找不到该作品</div>;

    return (
        <div className="container mx-auto p-4 sm:p-8">
            <header className="mb-8 max-w-4xl mx-auto">
                <div className="mb-6">
                    <Link href={`/library/${id}`} className="text-gray-400 hover:text-bamguet transition inline-flex items-center gap-1 text-sm">
                        &larr; 返回作品
                    </Link>
                </div>
                <h1 className="text-3xl font-bold text-bamguet-dark mb-2">编辑作品</h1>
            </header>

            <AddWorkForm initialData={work} isEditMode={true} />
        </div>
    );
}