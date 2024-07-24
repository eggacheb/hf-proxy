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
  const targetUrl = new URL(pathname + search, "https://eggacheb-chuanhuchatgpt.hf.space").href;

  const modifiedRequest = new Request(targetUrl, req);
  modifiedRequest.headers.set('origin', 'https://eggacheb-chuanhuchatgpt.hf.space/');

  const response = await fetch(modifiedRequest);
  let modifiedResponse = new Response(response.body, response);

  const location = modifiedResponse.headers.get('location');
  if (location) {
    const updatedLocation = location.replace('://eggacheb-chuanhuchatgpt.hf.space', `://${req.headers.get('host')}`);
    modifiedResponse.headers.set('location', updatedLocation);
  }

  const resHeaders = {
    ...CORS_HEADERS,
    ...Object.fromEntries(
      pickHeaders(modifiedResponse.headers, ["content-type", /^x-ratelimit-/, /^openai-/])
    ),
  };

  return new Response(modifiedResponse.body, {
    headers: resHeaders,
    status: modifiedResponse.status
  });
}
