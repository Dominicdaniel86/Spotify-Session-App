import express from 'express';
import * as querystring from 'querystring';
import { validateClientToken, generateOAuthQuerystring, oAuthAuthorization, searchSong, playTrack, pauseTrack, skipTrack, refreshAuthToken } from './api/index.js';
import logger, { initializeLoggingFile } from './logger/logger.js';
import { PORT, prisma } from './config.js';

// Initialize app
const app = express();

// Add body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialize log file
try {
    initializeLoggingFile();  
} catch(error: unknown) {
    const errorMessage = error instanceof Error ? `Failed to initialize the logging file: ${error.message}` : 'Failed to initialize the logging file due to an unknown reason';
    logger.fatal(errorMessage);
    process.exit(1);
}

// Retrieve client credential token
await validateClientToken();

app.get('/api', (req, res) => {
    res.send("Hello from the backend!");
});

app.get('/api/tracks/search', async (req, res) => {

    try {
        await validateClientToken();

        const trackTitle = req.query.trackTitle as string;

        if(!trackTitle) {
            res.status(400).json({error: 'Empty track title'});
            return
        }

        let tracks = await searchSong(trackTitle);

        if(tracks.length === 0) {
            res.status(404).json({error: 'No tracks found'});
            return
        }

        logger.info(`Sucessfully send ${tracks.length} track results to the user.`);
        res.status(200).json({tracks: tracks});
    } catch(error) {
        logger.error(error, 'Failed to find tracks through the Spotify API.');
        res.status(500).json({error: 'Internal server error'});
    }
});

app.post('/api/tracks/select', (req, res) => {
    if(req.body.trackID) {
        logger.info('Song got selected: ' + req.body.trackID);
        res.send("You selected the song!");
    } else {
        logger.warn('Empty song selection received');
        res.status(400).send('Empty song send');
    }
});

app.get('/api/auth/spotify/login', async (req, res) => {

    try {
        logger.info('A user is trying to log in.');

        const url = 'https://accounts.spotify.com/authorize?';
        const querystring = await generateOAuthQuerystring();
    
        res.redirect(url + querystring);
        logger.info('Redirected user to the Spotify login page.');
    } catch(error) {
        logger.error(error, 'Could not redirect user to Spotify login page.');
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/api/auth/callback', async (req, res) => {
    logger.info('User login callback');
    const code = req.query.code as string;
    const state = req.query.state as string;

    try {
        const currentState = await prisma.state.findFirst();

        if(!state || state !== currentState?.state) {
            logger.warn('OAuth authentication failed: Received invalid state');
            return res.redirect('/#' + querystring.stringify({ error: 'state_mismatch' }));
        }

    } catch(error) {
        logger.error('Failed to read state from the database');
        return res.redirect('/#' + querystring.stringify({ error: 'state_mismatch' }));
    }

    await oAuthAuthorization(code);
    res.redirect('http://localhost/static/html/admin.html');
    logger.info('Redirected user back to admin.html');
});

app.post('/api/auth/spotify/logout', (req, res) => {
    res.send('Logged out now!');
});

app.put('/api/admin/control/play', async (req, res) => {
    try {
        await refreshAuthToken();
        await playTrack();
        logger.info('Admin plays/ continues the song');
        res.status(200).send('Play Song');
    } catch(error) {
        logger.error(error, 'Failed to play/ continue the song');
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.put('/api/admin/control/stop', async (req, res) => {
    try {
        await refreshAuthToken();
        await pauseTrack();
        logger.info('Admin stopped the song');
        res.status(200).send('Stop Song');
    } catch (err) {
        logger.error(err, 'Failed to stop the song');
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/api/admin/control/skip', async (req, res) => {
    try {
        await refreshAuthToken();
        await skipTrack();
        logger.info('Admin skipped the song');
        res.status(200).send('Skip Song');
    } catch (err) {
        logger.error(err, 'Failed to skip the song');
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.listen(PORT, () => {
    logger.info(`Server is running on port ${PORT}`);
});
