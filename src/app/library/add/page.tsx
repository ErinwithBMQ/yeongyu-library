import AddWorkForm from '@/components/AddWorkForm';

export default function AddWorkPage() {
    return (
        <div className="container mx-auto p-4 sm:p-8 bg-gray-50 min-h-screen">
            <header className="mb-8 max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold text-pink-600 mb-2">添加新作品</h1>
                <p className="text-gray-600">请协助完善小章鱼的存档库，所有信息一经提交将永久保存。</p>
            </header>

            <AddWorkForm />
        </div>
    );
}
