import axios from 'axios';
import fs from 'node:fs';

import 'dotenv/config';

import { getAccessToken } from './authentication.js';

const STREAMERS_FILE = 'streamers.json';
const MIN_VIEWERS = 75;

const loadCurrentStreamers = () => {
    if (fs.existsSync(STREAMERS_FILE)) {
        return JSON.parse(fs.readFileSync(STREAMERS_FILE));
    }

    return [];
};

const saveToFile = (filename, data) => {
    try {
        fs.writeFileSync(filename, JSON.stringify(data, null, 2));
    } catch (error) {
        console.error(`Error while saving ${filename}:`, error.message);
    }
};

export const fetchStreamers = async () => {
    try {
        const accessToken = await getAccessToken();

        let currentStreamers = loadCurrentStreamers();
        let newStreamers = [];
        let cursor = null;

        do {
            const response = await axios.get('https://api.twitch.tv/helix/streams', {
                headers: {
                    'Client-ID': process.env.TWITCH_CLIENT_ID,
                    Authorization: `Bearer ${accessToken}`,
                },
                params: {
                    first: 100,
                    language: 'pl',
                    after: cursor,
                },
            });

            if (response.status !== 200) {
                console.error(`Error while fetching streamers from Twitch: ${response.status}`);
                return;
            }

            const streams = response.data.data || [];
            if (streams.length === 0) break;

            streams.forEach((stream) => {
                if (
                    stream.viewer_count >= MIN_VIEWERS &&
                    !currentStreamers.some((s) => s.name.toLowerCase() === stream.user_name.toLowerCase())
                ) {
                    newStreamers.push({
                        id: stream.user_id,
                        name: stream.user_name,
                    });
                }
            });

            cursor = response.data.pagination?.cursor;
        } while (cursor);

        if (newStreamers.length > 0) {
            currentStreamers = [...currentStreamers, ...newStreamers];
            saveToFile(STREAMERS_FILE, currentStreamers);
        }
    } catch (err) {
        console.error('Error while fetching streamers:', err.message);
    }
};
