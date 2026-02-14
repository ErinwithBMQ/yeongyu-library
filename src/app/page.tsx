'use client';

export default function Home() {
  return (
    <div className="container mx-auto min-h-[80vh] flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-16 p-4">
      {/* 左栏：Logo、标语 */}
      <div className="flex-1 flex flex-col items-center lg:items-start text-center lg:text-left animate-in slide-in-from-left duration-700 mt-5">
        <div className="mb-8">
          <img src="/logo_2.png" alt="小章鱼存档地" className="h-20 md:h-32 w-auto object-contain" />
        </div>
        <div className="max-w-lg">
          <p className="text-gray-600 leading-relaxed">
            欢迎来到专属于小章鱼们的存档地~
            <br />
            大家一起开心吃饭吧！
            <br />
            <span className="text-sm text-gray-400 mt-2 block font-medium">Only For Yeonjun and Beomgyu.</span>
          </p>
        </div>
      </div>

      {/* 右栏：网站须知 + 其他公告 */}
      <div className="flex-1 w-full max-w-xl space-y-6 animate-in slide-in-from-right duration-700">
        {/* 网站须知 */}
        <div className="bg-white/90 backdrop-blur-sm p-6 rounded-2xl border border-sakura transition-shadow">
          <h2 className="text-xl font-bold mb-4 text-bamguet-dark flex items-center gap-2">
            <span className="text-2xl">📋</span> 网站须知
          </h2>
          <div className="text-gray-600 space-y-2 min-h-[100px] bg-gray-50/50 p-4 rounded-xl border border-dashed border-gray-200">
            <p className="text-sm text-gray-400">本站是专属于韩国男团 TOMORROW X TOGETHER cp 准奎（崔然竣×崔杋圭）的产出整理站。
              <br />
              本站禁拆逆、禁引战，采用邀请码制注册。未登录的用户仅可浏览图书馆页面，使用部分功能。
              <br />
              若有违反本站规定的行为，管理员有权删除相关内容并封禁账号。
              <br />
              希望小章鱼们能够维护网站和谐友爱的环境，一起开心吃饭！
              <br />
              ○ 平台官方微博账号：@小章鱼存档地
            </p>
          </div>
        </div>

        {/* 其他公告 */}
        <div className="bg-white/90 backdrop-blur-sm p-6 rounded-2xl border border-mint transition-shadow">
          <h2 className="text-xl font-bold mb-4 text-hwangchoon-dark flex items-center gap-2">
            <span className="text-2xl">📢</span> 其他公告
          </h2>
          <div className="text-gray-600 space-y-2 min-h-[100px] bg-gray-50/50 p-4 rounded-xl border border-dashed border-gray-200">
            <p className="text-sm text-gray-400">
              2026.2.4 - 网站正式上线！欢迎小章鱼们注册使用~
              2026.2.14 - 更新了重置密码功能
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
