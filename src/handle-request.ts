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

  if (req.method !== "GET") {
    return new Response("Method Not Allowed", {
      status: 405,
      headers: CORS_HEADERS,
    });
  }

  const { pathname, search } = req.nextUrl ? req.nextUrl : new URL(req.url);
  const url = new URL(pathname + search, "https://eggacheb-fast.hf.space").href;
  const headers = pickHeaders(req.headers, ["content-type", "authorization"]);

  try {
    const res = await fetch(url, {
      method: req.method,
      headers,
    });

    const resHeaders = {
      ...CORS_HEADERS,
      ...Object.fromEntries(
        pickHeaders(res.headers, ["content-type", /^x-ratelimit-/, /^openai-/])
      ),
    };

    return new Response(await res.text(), {
      headers: resHeaders,
      status: res.status,
    });
  } catch (error) {
    return new Response("Error fetching the requested URL", {
      status: 500,
      headers: CORS_HEADERS,
    });
  }
}
