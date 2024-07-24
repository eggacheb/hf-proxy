const copyHeaders = (sourceHeaders: Headers, targetHeaders: Headers) => {
  for (const [key, value] of sourceHeaders.entries()) {
    targetHeaders.set(key, value);
  }
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
  const url = new URL(pathname + search, "https://eggacheb-fast.hf.space").href;

  const headers = new Headers();
  copyHeaders(req.headers, headers);

  const res = await fetch(url, {
    body: req.body,
    method: req.method,
    headers,
  });

  const resHeaders = new Headers();
  copyHeaders(res.headers, resHeaders);

  for (const [key, value] of Object.entries(CORS_HEADERS)) {
    resHeaders.set(key, value);
  }

  const body = await res.text(); // Ensure the response body is read before returning it

  return new Response(body, {
    headers: resHeaders,
    status: res.status,
  });
}
