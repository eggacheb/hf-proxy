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
  const hostname = req.nextUrl ? req.nextUrl.hostname : new URL(req.url).hostname;
  
  // Update the base URL to point to the new target
  const targetHostname = "eggacheb-fast.hf.space";
  const url = new URL(pathname + search, `https://${targetHostname}`).href;
  const headers = pickHeaders(req.headers, ["content-type", "authorization"]);
  
  // Create a new request with the updated URL and set the origin header
  const modifiedReq = new Request(url, req);
  modifiedReq.headers.set('origin', `https://${targetHostname}/`);
  
  const res = await fetch(modifiedReq);
  let newRes = new Response(res.body, res);

  // Update the location header in the response if it exists
  let location = newRes.headers.get('location');
  if (location !== null && location !== "") {
    location = location.replace(`://${targetHostname}`, `://${hostname}`);
    newRes.headers.set('location', location);
  }

  const resHeaders = {
    ...CORS_HEADERS,
    ...Object.fromEntries(
      pickHeaders(newRes.headers, ["content-type", /^x-ratelimit-/, /^openai-/])
    ),
  };

  return new Response(newRes.body, {
    headers: resHeaders,
    status: newRes.status
  });
}
