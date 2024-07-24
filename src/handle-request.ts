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
  const headers = pickHeaders(req.headers, ["content-type", "authorization"]);
  
  // Set the origin header to the target URL
  headers.set('origin', 'https://eggacheb-fast.hf.space');

  const res = await fetch(new Request(_url.href, {
    body: req.body,
    method: req.method,
    headers,
  }));

  let newres = new Response(res.body, {
    headers: {
      ...CORS_HEADERS,
      ...Object.fromEntries(
        pickHeaders(res.headers, ["content-type", /^x-ratelimit-/, /^openai-/])
      ),
    },
    status: res.status,
  });

  // Adjust the location header if present
  let location = newres.headers.get('location');
  if (location !== null && location !== "") {
    location = location.replace('://eggacheb-fast.hf.space', '://' + (req.nextUrl ? req.nextUrl.hostname : new URL(req.url).hostname));
    newres.headers.set('location', location);
  }

  return newres;
}
