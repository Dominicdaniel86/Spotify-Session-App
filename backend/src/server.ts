import express from 'express';
import logger from './logger.js';
import { clientCredentialsFlow } from './spotify-auth.js';
import { writeToEnvFile } from './helper.js';

const app = express();
const port = 3000;

const client_id = process.env.CLIENT_ID || '';
const client_secret = process.env.CLIENT_SECRET || '';

let clientToken: Promise<string> = clientCredentialsFlow(client_id, client_secret);

clientToken.then(resolvedToken => {
    writeToEnvFile('CLIENT_CREDENTIAL_TOKEN', resolvedToken);
}).catch(error => {
    logger.fatal('Could not resolve Client Token');
});

app.get('/api', (req, res) => {
    res.send("Hello from the backend!");
});

app.get('/api/tracks/search', (req, res) => {
    res.send('Searched song result: Master of Puppets (best song!)');
});

app.post('/api/auth/spotify/login', (req, res) => {
    res.send('Clever, you are trying to login?');
});

app.post('/api/auth/spotify/logout', (req, res) => {
    res.send('Logged out now!');
});

app.listen(port, () => {
    logger.info(`Server is running on port ${port}`);
});
