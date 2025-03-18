import NodeCache from 'node-cache';

import { fetchStreamers } from './streamers.js';
import { fetchClips } from './clips.js';

export const cache = new NodeCache();

await fetchStreamers();
await fetchClips();
