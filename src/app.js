import NodeCache from 'node-cache';

import { fetchStreamers } from './streamers.js';
import { fetchClips } from './clips.js';
import { downloadClips } from './downloader.js';
import { createVideo } from './video.js';

export const cache = new NodeCache();

await fetchStreamers();
await fetchClips();
await downloadClips();
await createVideo();
