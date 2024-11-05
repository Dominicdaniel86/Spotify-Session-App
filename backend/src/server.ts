import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import cookieParser from 'cookie-parser';
import { clientCredentials, requestAccessToken, requestUserAuthorization } from './spotify-authentication.js';
import { pauseSong, playSong, searchSong, skipSong } from './spotify-api-calls.js';

const app = express();
app.use(cookieParser());

const __dirname = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');

const PORT = process.env.PORT || 3000;

// always execute client credentials authentication
clientCredentials();

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

app.get('/wishlist', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'wishlist.html'));
});

app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'admin.html'));
});

// api calls
app.get('/spotify/searchSong/:songName', (req, res) => {
    const song = req.params.songName;
    searchSong(song)
    .then(tracks => {
        console.log("Tracks found:", tracks);
    })
    .catch(error => {
        console.error("Error searching for songs:", error);
    });
});

// admin api calls
app.get('/spotify/admin/login', (req, res) => {
    console.debug("debug: spotify login started");
    requestUserAuthorization(res);
});

app.get('/spotify/admin/callback', (req, res) => {
    console.log("debug: spotify callback");
    console.log("debug: received " + req.query.code);
    let code: string = String(req.query.code) || "";
    res.redirect("/admin");
    requestAccessToken(code);
});

app.put('/spotify/admin/play', (req, res) => {
    console.debug("debug: play/ resume call");
    playSong();
});

app.put('/spotify/admin/pause', (req, res) => {
    console.debug("debug: pause call");
    pauseSong();
});

app.post('/spotify/admin/skip', (req, res) => {
    console.debug("debug: skip call");
    skipSong();
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
