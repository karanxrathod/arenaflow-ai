/**
 * CacheService provides local transient memory caching with time-to-live (TTL) validation
 */
class CacheService {
  private cache = new Map<string, { data: any; timestamp: number }>();
  private ttl = 10000; // 10 seconds default TTL for real-time arena data

  /**
   * Retrieves cached payload if it exists and has not expired
   * 
   * @param key Unique key for cached entry
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    
    const isExpired = Date.now() - entry.timestamp > this.ttl;
    if (isExpired) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.data as T;
  }

  /**
   * Caches payload with an optional custom TTL duration in milliseconds
   * 
   * @param key Cache key identifier
   * @param data Payload to cache
   * @param customTtl Override default TTL
   */
  set(key: string, data: any, customTtl?: number): void {
    const activeTtl = customTtl !== undefined ? customTtl : this.ttl;
    this.cache.set(key, { 
      data, 
      timestamp: Date.now() 
    });
    
    // Automatically evict key after TTL expires to prevent memory bloat
    setTimeout(() => {
      const entry = this.cache.get(key);
      if (entry && Date.now() - entry.timestamp >= activeTtl) {
        this.cache.delete(key);
      }
    }, activeTtl);
  }

  /**
   * Explicitly evicts an entry from cache
   * 
   * @param key Target key
   */
  evict(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Completely flushes all cache entries
   */
  clear(): void {
    this.cache.clear();
  }
}

export const cache = new CacheService();
