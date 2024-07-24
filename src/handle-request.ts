const pickHeaders = (headers, keys) => {
  const picked = new Headers();
  for (const key of headers.keys()) {
    if (keys.some((k) => (typeof k === "string" ? k === key : k.test(key)))) {
      const value = headers.get(key);
      if (typeof value === "string") {
        picked.set(key, value);
      }
    }
  }
  return picked;
};

const CORS_HEADERS = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET, POST, PUT, DELETE, OPTIONS",
  "access-control-allow-headers": "Content-Type, Authorization",
};

export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: CORS_HEADERS,
      });
    }

    const originalUrl = new URL(request.url);
    const targetUrl = new URL(originalUrl.pathname + originalUrl.search, "https://eggacheb-fast.hf.space");
    
    const headers = pickHeaders(request.headers, ["content-type", "authorization"]);
    headers.set('origin', 'https://eggacheb-fast.hf.space');

    const response = await fetch(new Request(targetUrl, {
      body: request.body,
      method: request.method,
      headers,
    }));

    const responseHeaders = {
      ...CORS_HEADERS,
      ...Object.fromEntries(
        pickHeaders(response.headers, ["content-type", /^x-ratelimit-/, /^openai-/])
      ),
    };

    let location = response.headers.get('location');
    if (location) {
      location = location.replace('://eggacheb-fast.hf.space', '://' + originalUrl.hostname);
      responseHeaders['location'] = location;
    }

    return new Response(response.body, {
      headers: responseHeaders,
      status: response.status,
      statusText: response.statusText,
    });
  }
};
