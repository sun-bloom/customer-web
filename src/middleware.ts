import { defineMiddleware } from 'astro/middleware';

export const onRequest = defineMiddleware((context, next) => {
  const url = new URL(context.request.url);
  if (url.pathname.startsWith('/order/') && !url.pathname.startsWith('/order/__fallback__')) {
    url.pathname = '/order/__fallback__';
    return context.rewrite(url);
  }
  if (url.pathname.startsWith('/products/') && !url.pathname.startsWith('/products/__fallback__')) {
    url.pathname = '/products/__fallback__';
    return context.rewrite(url);
  }
  return next();
});
