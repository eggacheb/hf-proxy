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

export default async function handleRequest(req: Request & { nextUrl?: URL }) {
  const { pathname, search } = req.nextUrl ? req.nextUrl : new URL(req.url);
  const url = new URL(pathname + search, "https://eggacheb-fast.hf.space").href;
  const headers = pickHeaders(req.headers, ["content-type", "authorization"]);

  const fetchOptions: RequestInit = {
    method: req.method,
    headers,
  };

  // Only set body for non-GET and non-HEAD methods
  if (req.method !== "GET" && req.method !== "HEAD") {
    fetchOptions.body = req.body;
  }

  const res = await fetch(url, fetchOptions);

  const resHeaders = Object.fromEntries(
    pickHeaders(res.headers, ["content-type", /^x-ratelimit-/, /^openai-/])
  );

  return new Response(res.body, {
    headers: resHeaders,
    status: res.status,
  });
}
