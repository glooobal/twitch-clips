import fs from 'node:fs';
import path from 'node:path';
import { exec } from 'child_process';

const CLIPS_FILE = 'data/clips.json';
const DOWNLOADED_CLIPS_PATH = 'data/downloaded_clips';

const ensureDirectoryExists = (dir) => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
};

const downloadClip = (clip) => {
    return new Promise((resolve, reject) => {
        ensureDirectoryExists(DOWNLOADED_CLIPS_PATH);

        const filePath = path.join(DOWNLOADED_CLIPS_PATH, `${clip.id}.mp4`);
        const command = `streamlink ${clip.url} best -o ${filePath}`;

        exec(command, (err, stdout, stderr) => {
            if (err) {
                console.error(`Error while downloading clip (${clip.title}):`, err.message);
                return reject(err);
            }

            if (stderr) {
                console.error(`Error while downloading clip: ${stderr}`);
            }

            resolve();
        });
    });
};

export const downloadClips = async () => {
    try {
        const clips = JSON.parse(fs.readFileSync(CLIPS_FILE, 'utf8'));

        for (const clip of clips) {
            await downloadClip(clip);
        }
    } catch (error) {
        console.error('Error while loading clips.json file and downloading clips:', error.message);
    }
};
