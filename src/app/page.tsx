import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] text-center p-4">
      <h1 className="text-4xl md:text-6xl font-bold mb-6 text-pink-500">
        小章鱼存档地
      </h1>
      <p className="text-xl text-gray-600 mb-12 max-w-2xl">
        这里是产出整理站，也是你的匿名树洞。
        <br />
        简约、可爱、平等。
      </p>

      <div className="flex flex-wrap gap-6 justify-center">
        <Link href="/library"
          className="px-8 py-4 bg-white border-2 border-sakura text-pink-600 rounded-2xl shadow-sm hover:bg-sakura-light hover:-translate-y-1 transition-all font-bold text-lg">
          进入图书馆
        </Link>
        <Link href="/radio"
          className="px-8 py-4 bg-white border-2 border-mint text-teal-600 rounded-2xl shadow-sm hover:bg-mint-light hover:-translate-y-1 transition-all font-bold text-lg">
          前往电台
        </Link>
      </div>
    </div>
  );
}
