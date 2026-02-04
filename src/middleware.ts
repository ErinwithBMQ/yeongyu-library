import { type NextRequest } from 'next/server';
import { updateSession } from '@/utils/supabase/middleware';

export async function middleware(request: NextRequest) {
    return await updateSession(request);
}

export const config = {
    matcher: [
        /*
         * Match only protected routes to save resources.
         * Public routes (/, /library, /activities, /login, etc.) will bypass middleware.
         * - /me, /favorites, /radio: Require authentication
         * - /library/add: Requires authentication
         * - /library/:id/edit: Requires authentication
         */
        '/me/:path*',
        '/favorites/:path*',
        '/radio/:path*',
        '/library/add',
        '/library/:path*/edit',
    ],
};
