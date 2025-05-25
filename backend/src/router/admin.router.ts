import express from 'express';
import {
    changeCurrentVolume,
    getCurrentVolume,
    pauseTrack,
    playTrack,
    refreshAuthToken,
    skipTrack,
} from '../api/index.js';
import { NotFoundError, ValueAlreadyExistsError } from '../errors/database.js';
import logger from '../logger/logger.js';
import {
    generalPurposeGETValidation,
    generalPurposeValidation,
    newGeneralPurposeValidation,
} from '../utility/authsUtils.js';
import { createNewSession, stopCurrentSession } from '../services/sessionManagement.js';
import { InvalidParameterError } from '../errors/services.js';
import { CookieList } from '../shared/cookies.js';
import { getSessionState } from '../auth/auth.middleware.js';
import type { SessionStateRes } from '../shared/interfaces/res/auth.js';
import type { StartSessionRes } from '../shared/interfaces/res/sessions.js';

const router = express.Router();

router.post('/session/start', async (req, res) => {
    logger.info({ endpoint: '/session/start' }, 'A user is trying to start a session');
    let token: string;
    try {
        token = await newGeneralPurposeValidation(req, res);
    } catch {
        // error handled in newGeneralPurposeValidation
        return;
    }

    try {
        const sessionId = await createNewSession(token);
        const response: StartSessionRes = {
            message: 'Session started successfully',
            code: 200,
            sessionId,
        };

        logger.info('Session started');
        res.status(200).json(response);
    } catch (error) {
        if (error instanceof InvalidParameterError) {
            logger.warn({ endpoint: '/session/start' }, error.message);
            res.status(400).json({ error: error.message });
        } else if (error instanceof NotFoundError) {
            logger.warn({ endpoint: '/session/start' }, error.message);
            res.status(404).json({ error: error.message });
        } else if (error instanceof ValueAlreadyExistsError) {
            logger.warn({ endpoint: '/session/start' }, error.message);
            res.status(409).json({ error: error.message });
        } else {
            logger.error({ endpoint: '/session/start', error }, 'Failed to create a new session');
            res.status(500).json({ error: 'Internal Server error' });
        }
    }
});

router.post('/session/stop', async (req, res) => {
    logger.info({ endpoint: '/session/stop' }, 'A user is trying to stop a session');
    let token: string;
    try {
        token = await newGeneralPurposeValidation(req, res);
    } catch {
        // error handled in newGeneralPurposeValidation
        return;
    }

    try {
        const sessionId = await stopCurrentSession(token);
        logger.info({ sessionId, endpoint: '/session/stop' }, 'Successfully stopped session');
        res.status(200).send('Session stopped');
    } catch (error) {
        if (error instanceof InvalidParameterError) {
            logger.warn({ endpoint: '/session/stop' }, error.message);
            res.status(400).json({ error: error.message });
        } else if (error instanceof NotFoundError) {
            logger.warn({ endpoint: '/session/stop' }, error.message);
            res.status(404).json({ error: error.message });
        } else {
            logger.error({ endpoint: '/session/stop', error }, 'Failed to stop session');
            res.status(500).json({ error: 'Internal Server error' });
        }
    }
});

router.get('/session/status', async (req, res) => {
    logger.info({ endpoint: '/session/status' }, 'A user is trying to get the session status');
    const token = req.cookies[CookieList.ADMIN_TOKEN];
    if (token === undefined || token === null || token.trim() === '') {
        logger.warn({ endpoint: '/spotify/logout' }, 'No token provided for logout');
        res.status(400).json({ error: 'No token provided' });
        return;
    }

    try {
        const sessionStatus = await getSessionState(token);
        const response: SessionStateRes = {
            message: 'Session status retrieved successfully',
            code: '200',
            session_state: sessionStatus,
        };
        logger.debug({ sessionStatus }, 'Session status retrieved');
        res.status(200).json(response);
    } catch (error) {
        logger.error(error, 'Failed to get session status');
        res.status(500).json({ error: 'Internal Server error' });
    }
});

// TODO: Check for all controls, if a session is active
router.put('/control/play', async (req, res) => {
    logger.info('A user is trying to play a track');
    try {
        await generalPurposeValidation(req, res);
    } catch {
        // error handled in generalPurposeValidation
        return;
    }

    const { token, username, email } = req.body;

    try {
        const oAuthToken = await refreshAuthToken(token, username, email);
        await playTrack(oAuthToken);
        logger.info('Admin plays/ continues the song');
        res.status(200).send('Play Song');
    } catch (error) {
        if (error instanceof InvalidParameterError) {
            logger.error(error, 'Failed to play/ continue the song - No OAuth token found');
            res.status(401).json({ error: 'No OAuth token found' });
            return;
        }
        logger.error(error, 'Failed to play/ continue the song - Internal server error');
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.put('/control/stop', async (req, res) => {
    logger.info('A user is trying to stop a track');
    try {
        await generalPurposeValidation(req, res);
    } catch {
        // error handled in generalPurposeValidation
        return;
    }

    const { token, username, email } = req.body;

    try {
        const oAuthToken = await refreshAuthToken(token, username, email);
        await pauseTrack(oAuthToken);
        logger.info('Admin stopped the song');
        res.status(200).send('Stop Song');
    } catch (error) {
        if (error instanceof InvalidParameterError) {
            logger.error(error, 'Failed to stop the song - No OAuth token found');
            res.status(401).json({ error: 'No OAuth token found' });
            return;
        }
        logger.error(error, 'Failed to stop the song - Internal server error');
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.post('/control/skip', async (req, res) => {
    logger.info('A user is trying to skip a track');
    try {
        await generalPurposeValidation(req, res);
    } catch {
        // error handled in generalPurposeValidation
        return;
    }

    const { token, username, email } = req.body;

    try {
        const oAuthToken = await refreshAuthToken(token, username, email);
        await skipTrack(oAuthToken);
        logger.info('Admin skipped the song');
        res.status(200).send('Skip Song');
    } catch (error) {
        if (error instanceof InvalidParameterError) {
            logger.error(error, 'Failed to skip the song - No OAuth token found');
            res.status(401).json({ error: 'No OAuth token found' });
            return;
        }
        logger.error(error, 'Failed to skip the song - Internal server error');
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.get('/control/volume', async (req, res) => {
    logger.info('A user is trying to get the current volume');
    try {
        await generalPurposeGETValidation(req, res);
    } catch {
        // error handled in generalPurposeValidation
        return;
    }

    const { token, username, email } = req.headers;
    if (typeof token !== 'string' || typeof username !== 'string' || typeof email !== 'string') {
        logger.warn('Invalid parameters', { token, username, email });
        res.status(400).json({ error: 'Invalid parameters' });
        return;
    }

    try {
        const oAuthToken = await refreshAuthToken(token, username, email);
        const currentVolume = await getCurrentVolume(oAuthToken);
        logger.info('Admin retrieved the current volume');
        res.status(200).send(`${currentVolume}`);
    } catch (error) {
        if (error instanceof InvalidParameterError) {
            logger.error(error, 'Failed to get current volume - No OAuth token found');
            res.status(401).json({ error: 'No OAuth token found' });
            return;
        }
        logger.error(error, 'Failed to get current volume - Internal server error');
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.put('/control/volume', async (req, res) => {
    logger.info('A user is trying to change the volume');
    try {
        await generalPurposeValidation(req, res);
    } catch {
        // error handled in generalPurposeValidation
        return;
    }

    const { token, username, email } = req.body;

    try {
        const volume = req.query.volume as string;
        logger.debug(volume);

        const oAuthToken = await refreshAuthToken(token, username, email);
        await changeCurrentVolume(oAuthToken, volume);
        logger.info('Admin changed the current volume');
        res.status(200).send('Volume successfully changed!');
    } catch (error) {
        if (error instanceof InvalidParameterError) {
            logger.error(error, 'Failed to change current volume - No OAuth token found');
            res.status(401).json({ error: 'No OAuth token found' });
            return;
        }
        logger.error(error, 'Failed to change current volume - Internal server error');
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
