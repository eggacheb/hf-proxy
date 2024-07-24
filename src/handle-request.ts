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
  // Update the base URL to point to the new target
  const url = new URL(pathname + search, "https://eggacheb-fast.hf.space").href;
  const headers = new Headers(req.headers); // Forward all request headers

  const res = await fetch(url, {
    body: req.body,
    method: req.method,
    headers,
  });

  const resHeaders = new Headers(res.headers);
  for (const [key, value] of Object.entries(CORS_HEADERS)) {
    resHeaders.set(key, value); // Add CORS headers to the response
  }

  return new Response(res.body, {
    headers: resHeaders,
    status: res.status
  });
}
