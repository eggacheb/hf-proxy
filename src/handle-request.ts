export default {
  async fetch(request: Request, env: any): Promise<Response> {
    const url = new URL(request.url);
    url.host = 'eggacheb-fast.hf.space';
    return fetch(new Request(url.toString(), request));
  }
};
