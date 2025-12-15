// hooks/useAuth.ts
import { useRouter } from 'next/navigation';

export const useAuth = () => {
    const router = useRouter();

    const logout = async () => {
        try {
            const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5002';

            await fetch(`${backendUrl}/api/auth/logout`, {
                method: 'POST',
                credentials: 'include'
            });

            clearAuth();
            router.push('/login');
            router.refresh();

        } catch (error) {
            console.error('Logout error:', error);
            clearAuth();
            router.push('/login');
        }
    };

    const clearAuth = () => {
        if (typeof window !== 'undefined') {
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            localStorage.removeItem('user');
            localStorage.removeItem('isAuthenticated');
        }
    };

    const getUser = () => {
        if (typeof window === 'undefined') return null;
        const userStr = localStorage.getItem('user');
        return userStr ? JSON.parse(userStr) : null;
    };

    const getToken = () => {
        if (typeof window === 'undefined') return null;
        return localStorage.getItem('access_token');
    };

    const isAuthenticated = () => {
        if (typeof window === 'undefined') return false;
        const token = getToken();
        const isAuth = localStorage.getItem('isAuthenticated');
        return !!token && isAuth === 'true';
    };

    const refreshToken = async () => {
        try {
            const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5002';
            const refreshToken = localStorage.getItem('refresh_token');

            if (!refreshToken) {
                clearAuth();
                return false;
            }

            const response = await fetch(`${backendUrl}/api/auth/refresh`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ refreshToken }),
                credentials: 'include'
            });

            if (response.ok) {
                const data = await response.json();

                if (data.tokens?.accessToken) {
                    localStorage.setItem('access_token', data.tokens.accessToken);
                    return true;
                }
            }

            return false;

        } catch (error) {
            console.error('Token refresh error:', error);
            return false;
        }
    };

    return {
        logout,
        getUser,
        getToken,
        isAuthenticated,
        refreshToken,
        clearAuth
    };
};