import Link from 'next/link';

export default function Navbar() {
    return (
        <nav className="flex items-center justify-between p-4 bg-sakura-light/50 backdrop-blur-sm sticky top-0 z-50 border-b border-sakura/20">
            <div className="text-xl font-bold text-pink-600">
                <Link href="/">小章鱼存档地</Link>
            </div>
            <div className="flex gap-6 font-medium text-gray-600">
                <Link href="/library" className="hover:text-pink-500 transition-colors">图书馆</Link>
                <Link href="/radio" className="hover:text-pink-500 transition-colors">电台</Link>
                <Link href="/favorites" className="hover:text-pink-500 transition-colors">收藏夹</Link>
                <Link href="/me" className="hover:text-pink-500 transition-colors">我</Link>
            </div>
        </nav>
    );
}
