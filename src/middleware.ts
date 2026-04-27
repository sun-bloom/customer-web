import { defineMiddleware } from 'astro/middleware';

const ALLOWED_ORIGINS = ['http://100.81.89.45', 'https://100.81.89.45'];

export const onRequest = defineMiddleware((context, next) => {
  const url = new URL(context.request.url);
  const origin = context.request.headers.get('origin') || '';
  const clientIP = context.request.headers.get('cf-connecting-ip') || '';
  const isAllowed = ALLOWED_ORIGINS.includes(origin) || clientIP === '100.81.89.45';

  const applyCorsHeaders = (response: Response) => {
    if (!isAllowed) return response;
    response.headers.set('Access-Control-Allow-Origin', origin || 'http://100.81.89.45');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type');
    response.headers.set('Access-Control-Allow-Credentials', 'true');
    response.headers.append('Vary', 'Origin');
    return response;
  };

  if (context.request.method === 'OPTIONS') {
    return applyCorsHeaders(new Response(null, { status: 204 }));
  }

  if (url.pathname.startsWith('/order/') && !url.pathname.startsWith('/__fallback__/order')) {
    url.pathname = '/__fallback__/order';
    return applyCorsHeaders(context.rewrite(url));
  }
  if (url.pathname.startsWith('/products/') && !url.pathname.startsWith('/__fallback__/products')) {
    url.pathname = '/__fallback__/products';
    return applyCorsHeaders(context.rewrite(url));
  }

  return next().then(applyCorsHeaders);
});
