// start/ resume
export function playSong() {
    fetch("https://api.spotify.com/v1/me/player/play", {
        method: 'PUT',
        headers: {
            'Authorization': "Bearer " + String(process.env.SPOTIFY_TOKEN)
        }
    })
    .then(response => console.log(response.status))
    .catch(error => console.error('error: ', error));
}

// pause
export function pauseSong() {
    fetch("https://api.spotify.com/v1/me/player/pause", {
        method: 'PUT',
        headers: {
            'Authorization': "Bearer " + String(process.env.SPOTIFY_TOKEN)
        }
    })
    .then(response => console.log(response.status))
    .catch(error => console.error('error: ', error)); 
}

// skip
export function skipSong() {
    fetch("https://api.spotify.com/v1/me/player/next", {
        method: 'POST',
        headers: {
            'Authorization': "Bearer " + String(process.env.SPOTIFY_TOKEN)
        }
    })
    .then(response => console.log(response.status))
    .catch(error => console.error('error: ', error));
}
