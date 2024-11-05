import { Response } from 'express';
import querystring from 'querystring';

// to-do: scope and state
export function requestUserAuthorization(res: Response) {
    res.redirect('https://accounts.spotify.com/authorize?' +
    querystring.stringify({
        client_id: process.env.CLIENT_ID,
        response_type: 'code',
        redirect_uri: 'http://localhost/spotify/callback',
        show_dialog: true
    }));
}

export function requestAccessToken() {

}
