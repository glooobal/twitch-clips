import NodeCache from 'node-cache';

import { fetchStreamers } from './streamers.js';

export const cache = new NodeCache();

await fetchStreamers();
