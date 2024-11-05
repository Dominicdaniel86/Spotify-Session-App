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

// search song
export async function searchSong(title: string): Promise<any> {
    let url: string = "https://api.spotify.com/v1/search?";
    let q: string = "q=" + title.replace(/ /g, "%20");
    let type: string = "type=track";
    let market: string = "market=DE";
    let limit: string = "limit=6";
    url += q + "&" + type + "&" + market + "&" + limit;
    console.log("URL: " + url);

    return fetch(url, {
        method: 'GET',
        headers: {
            'Authorization': "Bearer " + String(process.env.CLIENT_TOKEN)
        }
    })
    .then(response => response.json())
    .then(data => {
        type Track = {
            name: string;
            artist: string;
            albumName: string;
            albumImage: string;
        }

        let tracks: Track[] = [];


        // multiple artists?
        for(let i: number =0; i<6; i++) {
            const newTrack: Track = {
                name: data.tracks.items[i].name,
                artist: data.tracks.items[i].album.name,
                albumName: JSON.stringify(data.tracks.items[i].album.images[0].url),
                albumImage: data.tracks.items[i].artists[0].name
            };

            tracks.push(newTrack);
        }

        return tracks;
    })
    .catch(error => {
        console.error('error: ', error);
        throw error;
    }); 
}
