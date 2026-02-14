import { NextResponse } from 'next/server'
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get('code')
    const next = searchParams.get('next') ?? '/'

    // 检查是否有上游错误 (Supabase 有时会返回 error 和 error_description)
    const errorParam = searchParams.get('error')
    const errorDesc = searchParams.get('error_description')

    if (errorParam) {
        console.error('Auth callback received error:', errorParam, errorDesc)
        return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(errorDesc || errorParam)}`)
    }

    if (code) {
        const cookieStore = await cookies()
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    getAll() {
                        return cookieStore.getAll()
                    },
                    setAll(cookiesToSet) {
                        try {
                            cookiesToSet.forEach(({ name, value, options }) =>
                                cookieStore.set(name, value, options)
                            )
                        } catch {
                            // The `setAll` method was called from a Server Component.
                            // This can be ignored if you have middleware refreshing
                            // user sessions.
                        }
                    },
                },
            }
        )
        const { error } = await supabase.auth.exchangeCodeForSession(code)
        if (!error) {
            // 检查是否有 next 参数，如果没有，尝试判断是否是重置密码流程（通常比较难判断，只能依赖 next）
            // 如果 next 为空，默认跳转到首页
            const forwardedHost = request.headers.get('x-forwarded-host') // original origin before load balancer
            const isLocal = origin.includes('localhost')

            console.log('Auth callback success, redirecting to:', next);

            if (isLocal) {
                // 本地开发直接跳转
                return NextResponse.redirect(`${origin}${next}`)
            } else if (forwardedHost) {
                // 生产环境可能需要处理 https 协议头
                return NextResponse.redirect(`https://${forwardedHost}${next}`)
            } else {
                return NextResponse.redirect(`${origin}${next}`)
            }
        } else {
            console.error('Auth callback error exchanging code:', error);
        }

    }

    // return the user to an error page with instructions
    return NextResponse.redirect(`${origin}/login?error=auth-code-error`)
}

