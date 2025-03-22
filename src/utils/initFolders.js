import fs from 'fs';
import { FOLDER_CONFIG } from '../config.js';

/**
 * Creates directories if they don't exist
 * @param {string} dir Directory path to create
 */
const createDirIfNotExists = (dir) => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
};

/**
 * Initializes all required folders for the application
 */
export const initializeFolders = () => {
    try {
        createDirIfNotExists(FOLDER_CONFIG.DATA_DIR);
        createDirIfNotExists(FOLDER_CONFIG.TEMP_DIR);
        createDirIfNotExists(FOLDER_CONFIG.DOWNLOADED_CLIPS);
        createDirIfNotExists(FOLDER_CONFIG.NORMALIZED_CLIPS);
    } catch (error) {
        console.error('Error initializing directories:', error);
        throw error;
    }
}; 