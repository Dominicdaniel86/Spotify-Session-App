import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import cookieParser from 'cookie-parser';
import { requestUserAuthorization } from './spotify-authentication.js';

const app = express();
app.use(cookieParser());

const __dirname = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');

const PORT = process.env.PORT || 3000;

// serve static files
app.get('/', (req, res) => {
    console.log(req.cookies);
    res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

app.get('/addSong', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'add-song.html'));
});

app.get('/playlist', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'playlist.html'));
});

app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'admin.html'));
});

// api calls
app.get('/spotify/login', (req, res) => {
    console.debug("debug: spotify login started");
    requestUserAuthorization(res);
});

app.get('/spotify/callback', (req, res) => {
    console.log("debug: spotify callback");
    console.log("debug: received " + req.query.code);
    res.redirect("/admin");
});

app.listen(PORT, () => {
    console.log("Server is running on http://localhost:${PORT}");
});
