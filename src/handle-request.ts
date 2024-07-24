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

  try {
    const { pathname, search } = req.nextUrl ? req.nextUrl : new URL(req.url);
    const url = new URL(pathname + search, "https://eggacheb-fast.hf.space").href;
    const headers = pickHeaders(req.headers, ["content-type", "authorization"]);

    const res = await fetch(url, {
      body: req.body,
      method: req.method,
      headers,
    });

    const resHeaders = {
      ...CORS_HEADERS,
      ...Object.fromEntries(
        pickHeaders(res.headers, ["content-type", /^x-ratelimit-/, /^openai-/])
      ),
    };

    const body = await res.text();

    return new Response(body, {
      headers: resHeaders,
      status: res.status,
    });
  } catch (error) {
    console.error('Error in handleRequest:', error);
    return new Response('Internal Server Error', {
      status: 500,
      headers: {
        "Content-Type": "text/plain",
        ...CORS_HEADERS,
      },
    });
  }
}
