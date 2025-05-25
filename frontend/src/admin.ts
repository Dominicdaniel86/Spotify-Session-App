// TODO: Fix this ESLint problem

import type { SessionStateRes } from './interfaces/res/auth.js';
import type { StartSessionRes } from './interfaces/res/sessions.js';
import { StateEnum } from './interfaces/state.js';
import { CookieList, deleteCookie, getCookie, setCookie, SpotifyAuthState } from './shared/cookie-management.js';
import { openLoading, openPopup } from './shared/popups.js';
import { validateNotAdmin } from './shared/validations.js';

/* eslint-disable @typescript-eslint/no-misused-promises */
export {};

declare global {
    interface Window {
        changeVolume: () => void;
        // playSong: () => void;
        // skipSong: () => void;
        spotifyLogin: () => void;
        spotifyLogout: () => void;
        logout: () => void;
        startSession: () => void;
        stopSession: () => void;
        // stopSong: () => void;
        switchVolumeVisibility: () => void;
    }
}

async function changeVolume() {
    const element = document.getElementById('volume-slider') as HTMLInputElement;
    const url = `/api/admin/control/volume?volume=${element.value}`;

    const config: object = {
        headers: {
            'Content-Type': 'application/json',
        },
    };

    try {
        await axios.put<string>(url, config);
    } catch (error) {
        console.error('Error changing volume:', error);
    }
}

// async function playSong() {
//     const url = '/api/admin/control/play';
//     try {
//         await axios.put(url);
//     } catch (error) {
//         console.error('Error playing song:', error);
//     }
// }

// async function skipSong() {
//     const url = '/api/admin/control/skip';
//     try {
//         await axios.post(url);
//     } catch (error) {
//         console.error('Error skipping song:', error);
//     }
// }

async function spotifyLogin(): Promise<void> {
    const url = '/api/auth/spotify/login';
    try {
        window.location.replace(url);
    } catch (error) {
        console.error(error);
    }
}

export async function spotifyLogout(): Promise<void> {
    const url = '/api/auth/spotify/logout';
    const config: object = {
        headers: {
            Authorization: `Bearer ${getCookie(CookieList.ADMIN_TOKEN)}`,
        },
    };

    try {
        await axios.post(url, null, config);
        setCookie(CookieList.SPOTIFY_AUTH_STATE, SpotifyAuthState.DISCONNECTED, 1);
        window.location.replace('');
    } catch (error) {
        console.error('Error disconnecting Spotify account:', error);
        openPopup('An error occurred while disconnecting the Spotify account. Please try again later.');
    }
}

export async function logout(): Promise<void> {
    const url = '/api/auth/logout';
    const config: object = {
        headers: {
            Authorization: `Bearer ${getCookie(CookieList.ADMIN_TOKEN)}`,
        },
    };

    try {
        await axios.post(url, null, config);
    } catch (error) {
        console.error('Error logging out:', error);
    } finally {
        openLoading();
        setTimeout(() => {
            window.location.replace('/static/html/index.html');
        }, 1000);
        deleteCookie(CookieList.ADMIN_USERNAME);
        deleteCookie(CookieList.ADMIN_EMAIL);
        deleteCookie(CookieList.ADMIN_TOKEN);
    }
}

// async function stopSong() {
//     const url = '/api/admin/control/stop';
//     try {
//         await axios.put(url);
//     } catch (error) {
//         console.error('Error stopping song:', error);
//     }
// }

async function switchVolumeVisibility() {
    // const volumeSliderElement = document.getElementById('volume-slider') as HTMLInputElement;
    // if (volumeSliderElement === null || volumeSliderElement === undefined) {
    //     console.error('Volume slider element not found');
    //     return;
    // }
    // const visibility = volumeSliderElement.style.display ?? 'none';
    // if (visibility === 'none') {
    //     volumeSliderElement.style.display = 'block';
    // } else {
    //     volumeSliderElement.style.display = 'none';
    // }
}

async function startSession() {
    const url = '/api/admin/session/start';
    const config: object = {
        headers: {
            Authorization: `Bearer ${getCookie(CookieList.ADMIN_TOKEN)}`,
        },
    };
    try {
        const response = await axios.post<StartSessionRes>(url, null, config);

        const sessionId = response.data.sessionId;
        setCookie(CookieList.SESSION_ID, sessionId, 7);
        window.location.replace('');
    } catch (error) {
        openPopup('An error occurred while starting the session. Please try again later.');
        console.error('Error starting session:', error);
    }
}

async function stopSession() {
    const url = '/api/admin/session/stop';
    const config: object = {
        headers: {
            Authorization: `Bearer ${getCookie(CookieList.ADMIN_TOKEN)}`,
        },
    };
    try {
        await axios.post(url, null, config);
        deleteCookie(CookieList.SESSION_ID);
        window.location.replace('');
    } catch (error) {
        openPopup('An error occurred while ending the session. Please try again later.');
        console.error('Error ending session:', error);
    }
}

async function selectMatchingState() {
    const url = '/api/admin/session/status';
    const config: object = {
        headers: {
            Authorization: `Bearer ${getCookie(CookieList.ADMIN_TOKEN)}`,
        },
    };
    try {
        const response = await axios.get<SessionStateRes>(url, config);
        const sessionStatus: StateEnum = response.data.session_state;

        if (sessionStatus === StateEnum.SPOTIFY_DISCONNECTED) {
            const accDisconnectedSection = document.getElementById('spotify-account-disconnected') as HTMLDivElement;
            accDisconnectedSection.style.display = 'block';
        } else if (sessionStatus === StateEnum.SPOTIFY_CONNECTED) {
            const accConnectedSection = document.getElementById('spotify-account-connected') as HTMLDivElement;
            accConnectedSection.style.display = 'block';
        } else if (sessionStatus === StateEnum.SESSION_ACTIVE) {
            const accSessionSection = document.getElementById('spotify-session-open') as HTMLDivElement;
            accSessionSection.style.display = 'block';
            const logoutElement = document.getElementById('logout') as HTMLElement;
            logoutElement.style.display = 'block';
            const sessionId = getCookie('mursica-fm-admin-session-id') ?? '#XXX-XXX';
            const sessionIdElement = document.getElementById('session-id') as HTMLSpanElement;
            sessionIdElement.innerText = sessionId;
        } else {
            // Fallback to disconnected state
            console.warn('Unknown session status:', sessionStatus);
            const accDisconnectedSection = document.getElementById('spotify-account-disconnected') as HTMLDivElement;
            accDisconnectedSection.style.display = 'block';
        }
    } catch (error) {
        console.error('Error retrieving session status:', error);
        // Fallback to disconnected state
        const accDisconnectedSection = document.getElementById('spotify-account-disconnected') as HTMLDivElement;
        accDisconnectedSection.style.display = 'block';
    }
}

async function validateSpotifyFeedback() {
    const spotifyStatus = getCookie(CookieList.SPOTIFY_AUTH_STATE);
    console.debug('Spotify status:', spotifyStatus);

    if (spotifyStatus === null || spotifyStatus === undefined || spotifyStatus === '') {
        return;
    }

    if (spotifyStatus === SpotifyAuthState.STATE_EXPIRED) {
        openPopup('Spotify login expired. Please re-login to your Spotify account.');
    } else if (spotifyStatus === SpotifyAuthState.INVALID_STATE) {
        openPopup('Spotify login state is invalid. Please re-login to your Spotify account.');
    } else if (spotifyStatus === SpotifyAuthState.STATE_VALIDATION_FAILED) {
        openPopup('Spotify login state validation failed. Please try again.');
    } else if (spotifyStatus === SpotifyAuthState.OAUTH_AUTHORIZATION_STOPPED) {
        openPopup('Spotify OAuth authorization was stopped. Could not complete the authorization.');
    } else if (spotifyStatus === SpotifyAuthState.OAUTH_AUTHORIZATION_FAILED) {
        openPopup('Spotify OAuth authorization failed. Please try again.');
    } else if (spotifyStatus === SpotifyAuthState.OAUTH_AUTHORIZATION_SUCCESS) {
        openPopup('Spotify OAuth authorization was successful. You can now use the admin panel.');
    } else if (spotifyStatus === SpotifyAuthState.DISCONNECTED) {
        openPopup('Successfully disconnected from Spotify. All Spotify features are now disabled.');
    }
    deleteCookie(CookieList.SPOTIFY_AUTH_STATE);
}

window.addEventListener('load', async () => {
    // TODO: Implement this function
    // load current volume
    // const url = '/api/admin/control/volume';
    // const config: object = {
    //     headers: {
    //         'Content-Type': 'application/json',
    //     },
    // };
    // try {
    //     const volume = await axios.get<string>(url, config);
    //     const element = document.getElementById('volume-slider') as HTMLInputElement;
    //     if (element === null || element === undefined) {
    //         console.error('Volume slider element not found');
    //         return;
    //     }
    //     element.value = volume.data;
    // } catch (error) {
    //     console.error('Error retrieving the current volume: ', error);
    // }

    // Routing validation
    // ? TODO: Also really validate the admin with backend API
    validateNotAdmin('/static/html/index.html');

    let accName = getCookie('mursica-fm-admin-username');
    if (accName === null || accName === undefined || accName === '') {
        accName = 'Connected with email'; // ! Deprecated, only as fallback
    }
    const accNameElement = document.getElementById('account-name') as HTMLSpanElement;
    accNameElement.innerText = accName;

    await selectMatchingState();
    await validateSpotifyFeedback();
});

window.spotifyLogin = spotifyLogin;
window.spotifyLogout = spotifyLogout;
window.logout = logout;
window.startSession = startSession;
window.stopSession = stopSession;
window.switchVolumeVisibility = switchVolumeVisibility;
// window.playSong = playSong;
// window.stopSong = stopSong;
// window.skipSong = skipSong;
window.changeVolume = changeVolume;
