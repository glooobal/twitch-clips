import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'child_process';

import { deleteTempFiles } from './utils/temp.js';

const CLIPS_FOLDER = 'data/temp/downloaded_clips';
const NORMALIZED_FOLDER = 'data/temp/normalized_clips';
const CLIPS_LIST_PATH = 'data/temp/clips_list.txt';

const OUTPUT_VIDEO_PATH = 'data/final_video.mp4';
const TRANSITION_PATH = 'data/transition.mp4';

const normalizeClips = (clips) => {
    clips.forEach((file, index) => {
        const inputPath = path.join(CLIPS_FOLDER, file);
        const outputPath = path.join(NORMALIZED_FOLDER, `normalized_${index}.mp4`);

        const command = `ffmpeg -hwaccel cuda -i "${inputPath}" -c:v h264_nvenc -preset p7 -b:v 5000k -c:a aac -b:a 192k -ar 44100 -ac 2 -movflags +faststart -r 30 -s 1920x1080 "${outputPath}" -y`;
        try {
            execSync(command, { stdio: 'ignore' });
        } catch (error) {
            console.error(`Error normalizing clip ${file}:`, error.message);
        }
    });
};

const generateFileList = () => {
    const clips = fs.readdirSync(NORMALIZED_FOLDER).filter((file) => file.endsWith('.mp4'));
    let fileContent = '';

    clips.forEach((file, index) => {
        const currentClip = path.resolve(NORMALIZED_FOLDER, file);
        fileContent += `file '${currentClip}'\n`;

        if (index < clips.length - 1) {
            const transition = path.resolve(TRANSITION_PATH);
            fileContent += `file '${transition}'\n`;
        }
    });

    fs.writeFileSync(CLIPS_LIST_PATH, fileContent);
    return CLIPS_LIST_PATH;
};

const mergeVideos = (fileListPath) => {
    const command = `ffmpeg -f concat -safe 0 -i ${fileListPath} -c:v h264_nvenc -preset p7 -b:v 5000k -c:a aac -strict experimental "${OUTPUT_VIDEO_PATH}" -y`;

    try {
        execSync(command, { stdio: 'ignore' });
    } catch (error) {
        console.error('Error merging videos:', error.message);
    }
};

export const createVideo = async () => {
    try {
        // const clips = fs.readdirSync(CLIPS_FOLDER).filter((file) => file.endsWith('.mp4'));
        // await normalizeClips(clips);

        // const fileListPath = generateFileList();
        // mergeVideos(fileListPath);

        deleteTempFiles();
    } catch (error) {
        console.error('Error while creating the final video:', error);
    }
};