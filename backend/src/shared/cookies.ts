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
