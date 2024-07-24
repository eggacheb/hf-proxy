export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    url.host = 'eggacheb-fast.hf.space';
    return fetch(new Request(url, request));
  }
}
