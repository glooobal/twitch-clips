import fs from 'node:fs';
import path from 'node:path';

const CLIPS_FOLDER = 'data/temp/downloaded_clips';
const NORMALIZED_FOLDER = 'data/temp/normalized_clips';
const CLIPS_LIST_PATH = 'data/temp/clips_list.txt';
const CLIPS_PATH = 'data/temp/clips.json';

/**
 * Cleans up temporary files and folders
 */
export const deleteTempFiles = () => {
    try {
        fs.readdirSync(CLIPS_FOLDER).forEach(file => {
            fs.unlinkSync(path.join(CLIPS_FOLDER, file));
        });

        fs.readdirSync(NORMALIZED_FOLDER).forEach(file => {
            fs.unlinkSync(path.join(NORMALIZED_FOLDER, file));
        });

        if (fs.existsSync(CLIPS_LIST_PATH)) {
            fs.unlinkSync(CLIPS_LIST_PATH);
        }

        if (fs.existsSync(CLIPS_PATH)) {
            fs.unlinkSync(CLIPS_PATH);
        }
    } catch (error) {
        console.error('Error cleaning up temporary files:', error);
    }
};