'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

export default function Home() {
  const { user, loading } = useAuth();

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] text-center p-4">
      <div className="mb-8">
        <img src="/jjukkyumi_logo.png" alt="小章鱼存档地" className="h-24 md:h-32 w-auto object-contain" />
      </div>
      <p className="text text-gray-600 mb-12 max-w-2xl">
        欢迎来到专属于小章鱼们的产出存档地~大家一起开心吃饭吧！
        <br />
        Only For Yeonjun and Beomgyu.
      </p>

      <div className="flex flex-wrap gap-6 justify-center">
        <Link href="/library"
          className="px-8 py-4 bg-white border-2 border-sakura text-bamguet-dark rounded-2xl hover:bg-sakura-light hover:-translate-y-1 transition-all font-bold text-lg">
          进入图书馆
        </Link>

        {!loading && (
          user ? (
            <Link href="/radio"
              className="px-8 py-4 bg-white border-2 border-mint text-hwangchoon-dark rounded-2xl hover:bg-mint-light hover:-translate-y-1 transition-all font-bold text-lg">
              前往电台
            </Link>
          ) : (
            <div className="flex gap-4">
              <Link href="/login"
                className="px-8 py-4 bg-bamguet-dark text-white border-2 border-bamguet-dark rounded-2xl hover:bg-bamguet hover:-translate-y-1 transition-all font-bold text-lg">
                登录
              </Link>
              <Link href="/register"
                className="px-8 py-4 bg-white border-2 border-gray-200 text-gray-600 rounded-2xl hover:bg-gray-50 hover:-translate-y-1 transition-all font-bold text-lg">
                注册
              </Link>
            </div>
          )
        )}
      </div>
    </div>
  );
}
