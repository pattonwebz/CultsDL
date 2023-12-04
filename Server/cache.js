const fileSystemCache = require("file-system-cache");
const {CONSTANTS} = require("./constants");
const {CACHE_DIR} = CONSTANTS;

const cache = fileSystemCache.default({
    basePath: CACHE_DIR,  // (optional) Path where cache files are stored (default).
    hash: "sha1",          // (optional) A hashing algorithm used within the cache key.
    ttl: 60 * 60   // (optional) A time-to-live (in secs) on how long an item remains cached.
});

module.exports = cache;