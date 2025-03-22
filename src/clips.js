import axios from 'axios';
import fs from 'node:fs';

import { getAccessToken } from './authentication.js';
import { getYesterdayTimeRange } from './utils/date.js';
import { CLIP_CONFIG } from './config';

const STREAMERS_FILE = 'data/streamers.json';
const STREAMERS_WOMEN_FILE = 'data/streamerki.json';
const CLIPS_FILE = 'data/temp/clips.json';
const CLIPS_BLACKLIST_FILE = 'data/clipsBlacklist.json';

const TIME_THRESHOLD = CLIP_CONFIG.TIME_THRESHOLD;
const MIN_TOTAL_DURATION = CLIP_CONFIG.MIN_TOTAL_DURATION;
const MAX_CLIPS_PER_STREAMER = CLIP_CONFIG.MAX_CLIPS_PER_STREAMER;
const MIN_VIEWS = CLIP_CONFIG.MIN_VIEWS;
const MIN_WOMEN_CLIPS = CLIP_CONFIG.MIN_WOMEN_CLIPS;

const loadFile = (filename) => (fs.existsSync(filename) ? JSON.parse(fs.readFileSync(filename)) : []);
const saveFile = (filename, data) => fs.writeFileSync(filename, JSON.stringify(data, null, 2));

const BLACKLISTED_GAMES = loadFile(CLIPS_BLACKLIST_FILE);

const isWithinTimeFrame = (newClip, existingClips) => {
    const newClipTime = new Date(newClip.created_at).getTime();
    return existingClips.some((clip) => Math.abs(newClipTime - new Date(clip.created_at).getTime()) < TIME_THRESHOLD);
};

const fetchStreamersClips = async (streamer, accessToken, start, end) => {
    try {
        const response = await axios.get('https://api.twitch.tv/helix/clips', {
            headers: {
                'Client-ID': process.env.TWITCH_CLIENT_ID,
                Authorization: `Bearer ${accessToken}`,
            },
            params: {
                broadcaster_id: streamer.id,
                first: 5,
                started_at: start,
                ended_at: end,
            },
        });

        if (response.data.error) {
            console.error(`Twitch API error for ${streamer.name}:`, response.data);
            return [];
        }

        const clips = response.data.data || [];

        const validClips = [];
        clips.forEach((clip) => {
            if (
                validClips.length < MAX_CLIPS_PER_STREAMER &&
                !isWithinTimeFrame(clip, validClips) &&
                clip.view_count >= MIN_VIEWS &&
                !BLACKLISTED_GAMES.games.includes(clip.game_id)
            ) {
                validClips.push({
                    id: clip.id,
                    title: clip.title,
                    url: clip.url,
                    views: clip.view_count,
                    streamer: streamer.name,
                    created_at: clip.created_at,
                    duration: clip.duration,
                });
            }
        });

        return validClips;
    } catch (error) {
        console.error(`Error fetching clips for ${streamer.name}:`, error.response?.data || error.message);
        return [];
    }
};

export const fetchClips = async () => {
    try {
        const accessToken = await getAccessToken();
        const streamers = loadFile(STREAMERS_FILE);
        const womenStreamers = loadFile(STREAMERS_WOMEN_FILE);
        const { start, end } = getYesterdayTimeRange();

        const allClips = (
            await Promise.all(
                [...streamers, ...womenStreamers].map((s) => fetchStreamersClips(s, accessToken, start, end))
            )
        ).flat();

        allClips.sort((a, b) => b.views - a.views);

        let totalDuration = 0;
        let womenClips = allClips.filter((clip) => womenStreamers.some((ws) => ws.name === clip.streamer));
        let finalClips = [];

        if (womenClips.length < MIN_WOMEN_CLIPS) {
            finalClips.push(...womenClips.slice(0, MIN_WOMEN_CLIPS));
            totalDuration = finalClips.reduce((sum, clip) => sum + clip.duration, 0);
        }

        allClips.forEach((clip) => {
            if (totalDuration >= MIN_TOTAL_DURATION) return;

            if (!finalClips.some((c) => c.id === clip.id)) {
                finalClips.push(clip);
                totalDuration += clip.duration;

                if (totalDuration >= MIN_TOTAL_DURATION) {
                    return;
                }
            }
        });

        saveFile(CLIPS_FILE, finalClips);
    } catch (err) {
        console.error('Error fetching clips:', err.response?.data || err);
    }
};
