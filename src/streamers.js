import axios from 'axios';
import fs from 'node:fs';

import 'dotenv/config';

import { getAccessToken } from './authentication.js';

const STREAMERS_FILE = 'data/streamers.json';
const STREAMERS_BLACKLIST_FILE = 'data/streamersBlacklist.json';

const MIN_VIEWERS = 75;

const loadFile = (filename) => (fs.existsSync(filename) ? JSON.parse(fs.readFileSync(filename)) : []);
const saveFile = (filename, data) => fs.writeFileSync(filename, JSON.stringify(data, null, 2));

const BLACKLISTED_STREAMERS = loadFile(STREAMERS_BLACKLIST_FILE);

export const fetchStreamers = async () => {
    try {
        const accessToken = await getAccessToken();

        let currentStreamers = loadFile(STREAMERS_FILE);
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
                    !currentStreamers.some((s) => s.name.toLowerCase() === stream.user_name.toLowerCase()) &&
                    !BLACKLISTED_STREAMERS.includes(stream.user_name)
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
            saveFile(STREAMERS_FILE, currentStreamers);
        }
    } catch (err) {
        console.error('Error while fetching streamers:', err);
    }
};
