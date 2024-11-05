import { Response } from 'express';
import querystring from 'querystring';
import fs from 'fs';

const REDIRECT_URI: string = 'http://localhost/spotify/admin/callback';
const CLIENT_ID: string = process.env.CLIENT_ID || "";
const CLIENT_SECRET: string = process.env.CLIENT_SECRET || "";

// to-do: scope and state
export function requestUserAuthorization(res: Response) {
    res.redirect('https://accounts.spotify.com/authorize?' +
    querystring.stringify({
        client_id: CLIENT_ID,
        response_type: 'code',
        redirect_uri: REDIRECT_URI,
        show_dialog: true,
        scope: 'user-modify-playback-state'
    }));
}

//
export function requestAccessToken(prevCode: string) {
    if(prevCode==="")
        return;

    // request-body data
    const postData = querystring.stringify({
        grant_type: 'authorization_code',
        code: prevCode,
        redirect_uri: REDIRECT_URI
    });

    // create authorization header
    const authorizationHeader = "Basic " + Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64');
    console.log(authorizationHeader);

    fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
            'Authorization': authorizationHeader,
            'Content-Type': "application/x-www-form-urlencoded"
        },
        body: postData
    })
    .then(response => response.json())
    .then(data => {
        let accessToken: string = data.access_token;
        let refreshToken: string = data.refresh_token;
        let expiresIn: string = data.expires_in;

        process.env.SPOTIFY_TOKEN = accessToken;

        let content: string = "SPOTIFY_TOKEN=" + accessToken + "\n"
                                + "SPOTIFY_REFRESH_TOKEN=" + refreshToken + "\n"
                                + "SPOTIFY_EXPIRES_IN=" + expiresIn + "\n";

        fs.writeFile('/usr/src/app/token.env', content, (err) => {
            if (err)
                console.error("error: ", err);
        });

    })
    .catch(error => {
        console.error("error: ", error);
    });

}

//
export function clientCredentials() {
    
}
