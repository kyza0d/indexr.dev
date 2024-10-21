import NodeCache from 'node-cache';

// Create a cache instance with a default TTL of 1 hour
const cache = new NodeCache({ stdTTL: 3600 });

export default cache;
