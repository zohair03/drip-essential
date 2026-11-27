/**
 * Cloudflare Worker for R2 Image Delivery with Edge Cache
 *
 * Can be deployed to Cloudflare to serve images from R2 with full Cache API caching.
 * Note: Alternatively, Cloudflare R2's built-in "Connect Domain" feature under
 * Bucket Settings -> Custom Domains (images.dripessential.in) also provides direct CDN delivery.
 */

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const key = url.pathname.slice(1); // strip leading slash

    if (!key) {
      return new Response("Not Found", { status: 404 });
    }

    // Only allow GET/HEAD
    if (request.method !== "GET" && request.method !== "HEAD") {
      return new Response("Method Not Allowed", { status: 405 });
    }

    // Check Cloudflare Edge Cache
    const cache = caches.default;
    let response = await cache.match(request);
    if (response) {
      return response;
    }

    // Fetch from R2 bucket
    const object = await env.MY_BUCKET.get(key);
    if (!object) {
      return new Response("Image Not Found", { status: 404 });
    }

    const headers = new Headers();
    object.writeHttpMetadata(headers);
    headers.set("etag", object.httpEtag);
    headers.set("Cache-Control", "public, max-age=31536000, immutable");
    headers.set("Access-Control-Allow-Origin", "*");

    response = new Response(object.body, { headers });

    // Store in Cloudflare Edge Cache
    ctx.waitUntil(cache.put(request, response.clone()));

    return response;
  },
};
