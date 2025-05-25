export {};

export function setCookie(name: string, value: string, days: number): void {
    console.debug('Setting cookie:', name, value, days);
    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    const expires = `expires=${date.toUTCString()}`;
    document.cookie = `${name}=${encodeURIComponent(value)}; ${expires}; path=/`;
}

export function getCookie(name: string): string | null {
    const nameEQ = name + '=';
    const ca = document.cookie.split(';');

    for (let c of ca) {
        c = c.trim();
        if (c.startsWith(nameEQ)) {
            return decodeURIComponent(c.substring(nameEQ.length));
        }
    }
    return null;
}

export function deleteCookie(name: string): void {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
}

export function listCookies(): Record<string, string> {
    const cookies: Record<string, string> = {};
    const cookieArray = document.cookie.split(';');

    for (const cookie of cookieArray) {
        const [name, ...rest] = cookie.trim().split('=');
        const value = rest.join('=');
        cookies[name] = decodeURIComponent(value);
    }

    return cookies;
}

export enum CookieList {
    ADMIN_TOKEN = 'mursica-fm-admin-token',
    ADMIN_EMAIL = 'mursica-fm-admin-email',
    ADMIN_USERNAME = 'mursica-fm-admin-username',
    SESSION_ID = 'mursica-fm-admin-session-id',
    SPOTIFY_AUTH_STATE = 'mursica-fm-spotify-auth-state',
}

export enum SpotifyAuthState {
    STATE_EXPIRED = 'state_expired',
    INVALID_STATE = 'invalid_state',
    STATE_VALIDATION_FAILED = 'state_validation_failed',
    OAUTH_AUTHORIZATION_STOPPED = 'oauth_authorization_stopped',
    OAUTH_AUTHORIZATION_FAILED = 'oauth_authorization_failed',
    OAUTH_AUTHORIZATION_SUCCESS = 'oauth_authorization_success',
    DISCONNECTED = 'disconnected',
}
