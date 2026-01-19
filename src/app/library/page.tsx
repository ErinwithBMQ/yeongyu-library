import Link from 'next/link';
import LibraryView from "@/components/LibraryView";

export default function LibraryPage() {
    return (
        <div className="container mx-auto p-4 sm:p-8">
            <header className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-pink-600 mb-2">图书馆</h1>
                    <p className="text-gray-600">这里是产出整理站，所有作品一视同仁。</p>
                </div>
                <Link
                    href="/library/add"
                    className="inline-flex items-center px-4 py-2 bg-sakura text-pink-900 rounded-lg font-bold shadow-sm hover:brightness-105 transition-all text-sm"
                >
                    <span className="mr-2 text-lg">+</span> 添加作品
                </Link>
            </header>

            <LibraryView />
        </div>
    );
}
