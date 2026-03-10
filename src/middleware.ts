import { defineMiddleware } from 'astro/middleware';

export const onRequest = defineMiddleware((context, next) => {
  const url = new URL(context.request.url);

  if (url.pathname.startsWith('/order/') && !url.pathname.startsWith('/__fallback__/order')) {
    url.pathname = '/__fallback__/order';
    return context.rewrite(url);
  }

  return next();
});