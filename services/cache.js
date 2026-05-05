const cache = new Map();

function getCache(key) {
  const item = cache.get(key);
  if (!item) return null;
  if (Date.now() > item.exp) {
      cache.delete(key);
      return null;
  }
  return item.data;
}

function setCache(key, data, ttlMs = 5 * 60 * 1000) {
  cache.set(key, { data, exp: Date.now() + ttlMs });
}

module.exports = { getCache, setCache };
