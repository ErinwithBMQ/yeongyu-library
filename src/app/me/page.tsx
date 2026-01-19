export default function MePage() {
    return (
        <div className="container mx-auto p-4 sm:p-8 max-w-2xl">
            <h1 className="text-3xl font-bold text-gray-800 mb-8">个人中心</h1>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                    <h2 className="text-xl font-semibold text-gray-700 mb-4">登录 / 注册</h2>
                    <form className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">邮箱</label>
                            <input type="email" className="w-full rounded-lg border-gray-300 p-2 border" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">密码</label>
                            <input type="password" className="w-full rounded-lg border-gray-300 p-2 border" />
                        </div>
                        <button className="w-full py-2 bg-sakura text-pink-900 font-semibold rounded-lg hover:bg-sakura/90 transition">
                            登录
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
