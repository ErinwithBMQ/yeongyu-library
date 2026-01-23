import { supabase } from '@/lib/supabaseClient';

interface FetchOptions extends RequestInit {
    params?: Record<string, any>;
}

export const fetchApi = async <T>(path: string, options: FetchOptions = {}): Promise<T> => {
    const { data: { session } } = await supabase.auth.getSession();

    const headers = new Headers(options.headers);
    if (session?.access_token) {
        headers.set('Authorization', `Bearer ${session.access_token}`);
    }
    // Only set content-type if not already set, but fetch defaults usually ok.
    // If body is object, we stringify it.

    let body = options.body;
    if (body && typeof body === 'object' && !(body instanceof FormData) && !(body instanceof URLSearchParams) && !(body instanceof Blob)) {
        body = JSON.stringify(body);
        if (!headers.has('Content-Type')) {
            headers.set('Content-Type', 'application/json');
        }
    }

    let url = `/api${path}`;
    if (options.params) {
        const searchParams = new URLSearchParams();
        Object.entries(options.params).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                if (Array.isArray(value)) { // for filterTagIds=[1,2,3] -> filterTagIds=1,2,3
                    searchParams.append(key, value.join(','));
                } else {
                    searchParams.append(key, String(value));
                }
            }
        });
        const queryString = searchParams.toString();
        if (queryString) {
            // Handle case where path already has query params?
            url += url.includes('?') ? `&${queryString}` : `?${queryString}`;
        }
    }

    const response = await fetch(url, {
        ...options,
        headers,
        body
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || 'API Request failed');
    }

    return data as T;
};
