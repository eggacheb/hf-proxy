const pickHeaders = (headers: Headers, keys: (string | RegExp)[]): Headers => {
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

const CORS_HEADERS: Record<string, string> = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET, POST, PUT, DELETE, OPTIONS",
  "access-control-allow-headers": "Content-Type, Authorization",
};

export default async function handleRequest(req: Request & { nextUrl?: URL }) {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: CORS_HEADERS,
    });
  }

  const { pathname, search } = req.nextUrl ? req.nextUrl : new URL(req.url);
  const _url = new URL(pathname + search, "https://eggacheb-fast.hf.space");
  
  // Create a new request with the updated URL
  const proxiedReq = new Request(_url, req);
  proxiedReq.headers.set('origin', 'https://eggacheb-fast.hf.space');
  
  // Adjust headers to be proxied
  const headers = pickHeaders(req.headers, ["content-type", "authorization"]);
  headers.forEach((value, key) => proxiedReq.headers.set(key, value));

  const res = await fetch(proxiedReq);
  let newRes = new Response(res.body, res);
  
  // Set CORS headers on the response
  Object.entries(CORS_HEADERS).forEach(([key, value]) => newRes.headers.set(key, value));

  // Handle location header if present
  let location = newRes.headers.get('location');
  if (location) {
    location = location.replace('://eggacheb-fast.hf.space', `://${req.headers.get('host')}`);
    newRes.headers.set('location', location);
  }

  return newRes;
}
