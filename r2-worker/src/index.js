/**
 * R2 公共资源访问 Worker
 * 将 R2 bucket 中的文件以公开方式提供访问
 */

const ALLOWED_METHODS = ['GET', 'HEAD'];

const CONTENT_TYPES = {
  '.webp': 'image/webp',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.mp3': 'audio/mpeg',
  '.ogg': 'audio/ogg',
  '.wav': 'audio/wav',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.json': 'application/json',
  '.txt': 'text/plain',
};

function getContentType(key) {
  const ext = key.substring(key.lastIndexOf('.')).toLowerCase();
  return CONTENT_TYPES[ext] || 'application/octet-stream';
}

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, HEAD',
    'Access-Control-Max-Age': '86400',
  };
}

export default {
  async fetch(request, env) {
    // 只允许 GET 和 HEAD 请求
    if (!ALLOWED_METHODS.includes(request.method)) {
      return new Response('Method Not Allowed', {
        status: 405,
        headers: corsHeaders(),
      });
    }

    const url = new URL(request.url);
    // 去掉前导斜杠
    const key = url.pathname.replace(/^\//, '');

    if (!key) {
      return new Response('Missing file path', { status: 400 });
    }

    try {
      const object = await env.ASSETS.get(key);

      if (!object) {
        return new Response('File Not Found', {
          status: 404,
          headers: corsHeaders(),
        });
      }

      const headers = new Headers();
      headers.set('ETag', object.httpEtag);
      headers.set('Cache-Control', 'public, max-age=31536000, immutable');
      headers.set('Content-Type', getContentType(key));
      headers.set('Access-Control-Allow-Origin', '*');

      // 对于 HEAD 请求不返回 body
      if (request.method === 'HEAD') {
        return new Response(null, { headers });
      }

      return new Response(object.body, { headers });
    } catch (err) {
      console.error('R2 fetch error:', err);
      return new Response('Internal Server Error', { status: 500 });
    }
  },
};
