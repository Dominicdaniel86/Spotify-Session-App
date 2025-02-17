import axios from 'axios';
import { PrismaClient } from '@prisma/client';
import * as querystring from 'querystring';
import { SpotifyAuthTokenResponse, SpotifyClientTokenResponse } from '../interfaces/index.js';
import logger from '../logger/logger.js';
import { generateRandomString } from '../utility/fileUtils.js';
import { clientID, clientSecret} from '../config.js';

// TODO: Refactor code into 2 seperate files (OAuth.ts & clientCredentials.ts)

const prisma = new PrismaClient();

export async function clientCredentialsFlow(): Promise<[string, string]> {

    if(!clientID || !clientSecret) {
        logger.warn('Received empty client parameters in function "clientCredentialsFlow"');
        throw new Error('Client-Credentials-Flow failed.');
    }

    const url: string = 'https://accounts.spotify.com/api/token';
    const data = new URLSearchParams({
        grant_type: 'client_credentials'
    });
    const config = {
        headers: {
            'Authorization': `Basic ${Buffer.from(`${clientID}:${clientSecret}`).toString('base64')}`
        }
    };

    try {
        const response = await axios.post<SpotifyClientTokenResponse>(url, data, config);

        let access_token = response.data.access_token;
        let expires_in = response.data.expires_in;

        logger.info({'accessToken': access_token, 'validUntil': expires_in}, `Client-Credentials-Flow authorization succeeded.`);

        return [access_token, String(expires_in)];

    } catch(error) {
        if(axios.isAxiosError(error)) {
            if(error.response)
                logger.error(`Client-Credentials-Flow authorization failed with status ${error.status}: ${error.message}`);
            else if(error.request)
                logger.error(`Client-Credentials-Flow authorization failed: No response received`);
            else
                logger.error(`Client-Credentials-Flow authorization failed: ${error.message}`);
        } else {
            logger.error(error, `Axios request to Spotify API failed: Unexpected error.`);
        }

        throw new Error('Client-Credentials-Flow failed.');
    }
}

export function generateOAuthQuerystring(): string {
    const state = generateRandomString(16); // TODO: Use this state to prevent CSRF attacks
    const scope = 'user-modify-playback-state user-read-playback-state';
    const redirectURI = 'http://127.0.0.1:3000/callback';

    return querystring.stringify({
        response_type: 'code',
        client_id: clientID,
        scope: scope,
        redirect_uri: redirectURI,
        state: state
    });
}

export async function oAuthAuthorization(code: string): Promise<string[]> {
    const url = 'https://accounts.spotify.com/api/token';
    const data = {
        code: code,
        redirect_uri: 'http://127.0.0.1:3000/callback',
        grant_type: 'authorization_code'
    };
    const config = {
        headers: {
            'content-type': 'application/x-www-form-urlencoded',
            'Authorization': 'Basic ' + (Buffer.from(clientID + ':' + clientSecret).toString('base64'))
        }
    };

    const response = await axios.post<SpotifyAuthTokenResponse>(url, data, config);

    const access_token = response.data.access_token;
    const expires_in = response.data.expires_in;
    const refresh_token = response.data.refresh_token;

    const validUntilDate: Date = new Date(Date.now() + (expires_in * 1000));

    const token = await prisma.oAuthToken.findFirst();

    if(token) {
        await prisma.oAuthToken.update({
            where: {id: token.id },
            data: { token: access_token, validUntil: validUntilDate, refreshToken: refresh_token}
        });
    } else {
        await prisma.oAuthToken.create({
            data: { token: access_token, validUntil: validUntilDate, refreshToken: refresh_token}
        });
    }

    return [access_token, String(expires_in), refresh_token];
}

export async function refreshAuthToken() {

    const token = await prisma.oAuthToken.findFirst();

    if(!token)
        return;

    const url = 'https://accounts.spotify.com/api/token';
    const data = new URLSearchParams({
       grant_type: 'refresh_token',
       refresh_token: token.refreshToken,
    });
    const config = {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': 'Basic ' + (Buffer.from(clientID + ':' + clientSecret).toString('base64'))
        }
    };

    const response = await axios.post<SpotifyAuthTokenResponse>(url, data, config);
    console.log(response.data);
}
