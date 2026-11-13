---
title: Caching
summary: Where caches live (browser, CDN, application, distributed), cache-aside and other strategies, invalidation, HTTP caching headers and the classic failure modes.
difficulty: intermediate
tags: [caching, performance, redis, http, backend]
order: 15
related: [backend/rest-api-design, databases/choosing-a-database, design/proxy-pattern]
status: needs-review
reviewNotes: New entry from the topic-gaps batch.
---

A **cache** stores a copy of data closer to where it's needed, so future requests are faster and cheaper. Done well, caching is the single biggest performance lever in most systems. Done badly, it serves stale or wrong data.

> "There are only two hard things in Computer Science: cache invalidation and naming things." — attributed to Phil Karlton

## Where caches live

| Layer | Example | Good for |
| --- | --- | --- |
| **Browser** | HTTP cache, service worker | Static assets, per-user API responses |
| **CDN / edge** | Cloudflare, Azure Front Door, CloudFront | Static files and public, cacheable responses near users |
| **Reverse proxy** | NGINX, Varnish, output caching | Whole responses in front of your app |
| **In-process (memory)** | `IMemoryCache`, a `Map` | Hot, small, per-instance data; fastest |
| **Distributed** | Redis / Valkey, Memcached | Data shared by many app instances |
| **Database** | Buffer pool, materialised views | Handled by the database itself |

## Strategies

### Cache-aside (lazy loading)

The most common pattern. The application checks the cache, and on a miss loads from the source and populates the cache.

```csharp
public async Task<Product?> GetProductAsync(int id)
{
    var key = $"product:{id}";
    var cached = await cache.GetStringAsync(key);
    if (cached is not null) return JsonSerializer.Deserialize<Product>(cached);

    var product = await db.Products.FindAsync(id);                 // miss → load
    if (product is not null)
        await cache.SetStringAsync(key, JsonSerializer.Serialize(product),
            new DistributedCacheEntryOptions { AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(10) });
    return product;
}
```

.NET's `HybridCache` combines in-memory and distributed caching with built-in stampede protection.

### Others

- **Read-through:** the cache itself loads missing data from the source.
- **Write-through:** writes go to the cache and the database together, so the cache is always fresh. Writes are slower.
- **Write-behind:** writes go to the cache and are flushed to the database later. Fast, but data can be lost.

## Invalidation

- **TTL (time to live):** entries expire after a fixed time. Simple, but data can be stale for up to the TTL.
- **Explicit invalidation:** delete or update the cache entry when the data changes. Do it *after* the database write succeeds.
- **Event-driven:** publish a change event and let caches invalidate themselves. See [Event-Driven Architecture](event-driven-architecture.md).
- **Versioned keys:** include a version in the key (`product:42:v7`) so new data never collides with old.

Choose TTLs by asking **how stale can this be?** Product prices: seconds or minutes. A list of countries: days.

## HTTP caching

```http
Cache-Control: public, max-age=3600          # CDNs and browsers may cache for an hour
Cache-Control: private, max-age=60           # browser only (per-user data)
Cache-Control: no-store                      # never cache (sensitive data)
ETag: "a1b2c3"                               # validator: client sends If-None-Match → 304 Not Modified
```

Static assets with **content hashes** in their file names (`main-SOX7JUUD.js`, as in this codex's build) can be cached for a year with `immutable`. A new deploy means a new file name.

## Failure modes

- **Stale data:** users see old prices. Choose TTLs deliberately and invalidate on writes.
- **Cache stampede (thundering herd):** a hot key expires and thousands of requests hit the database at once. Prevent it with request coalescing (one loader per key), locks, early refresh, or jittered TTLs.
- **Caching per-user data publicly:** a CDN serves one user's account page to another. Use `private` and vary correctly.
- **Unbounded memory:** in-process caches need size limits and eviction (LRU).
- **Cache as source of truth:** caches can be flushed at any time. The system must still work, just more slowly.

```recall
Q: How does the cache-aside pattern work?
A: The application checks the cache; on a miss it loads from the source, stores the result in the cache, and returns it.

Q: What is a cache stampede and how do you prevent it?
A: Many concurrent requests missing the same expired hot key and all hitting the database; prevent with request coalescing/locking, early refresh or jittered expiry.

Q: What's the difference between Cache-Control public and private?
A: public allows shared caches (CDNs, proxies) to store the response; private restricts caching to the user's own browser.

Q: Why can content-hashed static files be cached for a year?
A: Any change produces a new file name, so a cached old version is never served for new content.

Q: What's the trade-off of write-behind caching?
A: Very fast writes, but data can be lost if the cache fails before flushing to the database.
```
