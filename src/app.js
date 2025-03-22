import NodeCache from 'node-cache';

import { fetchStreamers } from './streamers.js';
import { initializeFolders } from './utils/folders.js';
import { fetchClips } from './clips.js';
import { downloadClips } from './downloader.js';
import { createVideo } from './video.js';

export const cache = new NodeCache();

// initializeFolders();

// await fetchStreamers();
// await fetchClips();
// await downloadClips();
await createVideo();
