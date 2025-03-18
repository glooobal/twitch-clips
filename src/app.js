import NodeCache from 'node-cache';

import { fetchStreamers } from './streamers.js';
import { fetchClips } from './clips.js';
import { downloadClips } from './downloader.js';

export const cache = new NodeCache();

await fetchStreamers();
await fetchClips();
await downloadClips();
