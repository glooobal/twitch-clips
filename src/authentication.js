import axios from 'axios';
import 'dotenv/config';

import { cache } from '../app.js';

export const getAccessToken = async () => {
    try {
        const cachedToken = cache.get('twitch_access_token');
        if (cachedToken) return cachedToken;

        const response = await axios.post('https://id.twitch.tv/oauth2/token', null, {
            params: {
                client_id: process.env.TWITCH_CLIENT_ID,
                client_secret: process.env.TWITCH_CLIENT_SECRET,
                grant_type: 'client_credentials',
            },
        });

        if (response.data && response.data.access_token) {
            const accessToken = response.data.access_token;
            const expiresIn = response.data.expires_in;

            cache.set('twitch_access_token', accessToken, expiresIn - 60);

            return accessToken;
        } else {
            throw new Error('Error while retrieving access token');
        }
    } catch (err) {
        console.error(`Error while getting access token:`, err.response?.data || err.message);
        throw err;
    }
};
