import express from 'express';
import * as querystring from 'querystring';
import { generateOAuthQuerystring, logout, oAuthAuthorization, validateState } from '../api/index.js';
import logger from '../logger/logger.js';
import { validateJWTToken } from '../auth/auth.middleware.js';
import {
    NotFoundError,
    InvalidParameterError,
    ExpiredTokenError,
    NotVerifiedError,
    SpotifyStateError,
    AuthenticationError,
    SpotifyStateExpiredError,
    ExistingSessionError,
} from '../errors/index.js';
import { ENV_VARIABLES } from '../config.js';
import { CookieList, SpotifyAuthState } from '../shared/cookies.js';
import { newGeneralPurposeValidation, setSpotifyStateCookie } from '../utility/authsUtils.js';
import type { BaseRes } from '../shared/interfaces/base.js';

const router = express.Router();

router.get('/login', async (req, res) => {
    logger.info({ endpoint: '/spotify/login' }, 'A user is trying to connect their Spotify account');
    const token = req.cookies[CookieList.ADMIN_TOKEN];
    if (token === undefined || token === null || token.trim() === '') {
        logger.warn({ endpoint: '/spotify/logout' }, 'No token provided for logout');
        res.status(400).json({ error: 'No token provided' });
        return;
    }

    try {
        logger.info('A user is trying to connect their Spotify account.');
        await validateJWTToken(token);

        const url = 'https://accounts.spotify.com/authorize?';
        const spotifyQueryString = (await generateOAuthQuerystring(token)) + '&show_dialog=true';
        res.redirect(url + spotifyQueryString);
        logger.info('Redirected user to the Spotify login page.');
    } catch (error) {
        if (error instanceof InvalidParameterError) {
            logger.warn('Invalid parameters received');
            res.status(400).json({ error: 'Invalid parameters' });
            return;
        } else if (error instanceof ExpiredTokenError) {
            logger.warn({ error, endpoint: '/spotify/login' }, 'Token is expired');
            res.status(403).json({ error: error.message });
        } else if (error instanceof NotVerifiedError) {
            logger.warn({ error, endpoint: '/spotify/login' }, 'User is not verified');
            res.status(403).json({ error: 'User is not verified' });
        } else if (error instanceof NotFoundError) {
            logger.warn({ error, endpoint: '/spotify/login' }, 'User not found in the database');
            res.status(404).json({ error: 'User not found in the database' });
        } else {
            logger.error({ error, endpoint: '/spotify/login' }, 'Failed to validate JWT token');
            res.status(500).json({ error: 'Internal server error' });
        }
    }
});

/**
 * state_expired: The state is expired, the user needs to re-login
 * invalid_state: The state received from Spotify is invalid
 * state_validation_failed: The state validation failed, the user needs to re-login
 * oauth_authorization_stopped: The user stopped the OAuth authorization process
 * oauth_authorization_failed: The OAuth authorization failed, the user needs to re-login
 */
router.get('/callback', async (req, res) => {
    logger.info({ endpoint: '/spotify/callback' }, 'User login callback');
    const code = req.query.code as string;
    const state = req.query.state as string;

    try {
        await validateState(state);
    } catch (error) {
        if (error instanceof SpotifyStateExpiredError) {
            logger.warn({ error, endpoint: '/spotify/callback' }, 'State is expired');
            await setSpotifyStateCookie(SpotifyAuthState.STATE_EXPIRED, res);
            return res.redirect('/?' + querystring.stringify({ error: 'state_expired' }));
        } else if (error instanceof SpotifyStateError) {
            await setSpotifyStateCookie(SpotifyAuthState.INVALID_STATE, res);
            logger.warn({ error, endpoint: '/spotify/callback' }, 'Invalid state received');
            return res.redirect('/?' + querystring.stringify({ error: 'invalid_state' }));
        } else {
            await setSpotifyStateCookie(SpotifyAuthState.STATE_VALIDATION_FAILED, res);
            logger.error({ error, endpoint: '/spotify/callback' }, 'Failed to validate state');
            return res.redirect('/?' + querystring.stringify({ error: 'state_validation_failed' }));
        }
    }

    try {
        await oAuthAuthorization(code, state);
        await setSpotifyStateCookie(SpotifyAuthState.OAUTH_AUTHORIZATION_SUCCESS, res);
        if (ENV_VARIABLES.IS_PRODUCTION) {
            res.redirect(`https://${ENV_VARIABLES.DOMAIN}/static/html/admin.html`);
        } else {
            res.redirect(`http://${ENV_VARIABLES.LOCAL_HOST}/static/html/admin.html`);
        }
        logger.info({ endpoint: '/spotify/callback' }, 'Redirected user back to admin.html');
    } catch (error) {
        if (error instanceof AuthenticationError) {
            logger.warn(
                { error, endpoint: '/spotify/callback' },
                'OAuth authorization failed: User stopped the authorization'
            );
            await setSpotifyStateCookie(SpotifyAuthState.OAUTH_AUTHORIZATION_STOPPED, res);
            return res.redirect('/?' + querystring.stringify({ error: 'oauth_authorization_stopped' }));
        }
        await setSpotifyStateCookie(SpotifyAuthState.OAUTH_AUTHORIZATION_FAILED, res);
        logger.error({ error, endpoint: '/spotify/callback' }, 'OAuth authorization failed during callback');
        return res.redirect('/?' + querystring.stringify({ error: 'oauth_authorization_failed' }));
    }
});

router.post('/logout', async (req, res) => {
    logger.info({ endpoint: '/spotify/logout' }, 'A user is trying to start a session');
    let token: string;
    try {
        token = await newGeneralPurposeValidation(req, res);
    } catch {
        // error handled in newGeneralPurposeValidation
        return;
    }

    try {
        await logout(token);
        logger.info({ endpoint: '/spotify/logout' }, 'User logged out successfully');
        const response: BaseRes = {
            message: 'Logout successful!',
            code: 200,
        };
        res.status(200).json(response);
    } catch (error) {
        if (error instanceof NotFoundError) {
            res.status(400).json({ error: 'No OAuth token found' });
        } else if (error instanceof ExistingSessionError) {
            res.status(409).json({ error: 'User has open sessions, cannot remove OAuth token' });
        } else {
            logger.error(error, 'Failed to log out');
            res.status(500).json({ error: 'Internal server error' });
        }
    }
});

export default router;
