// Builds routes.txt for Angular prerendering from the blog post slugs.
import { readFileSync, writeFileSync } from 'node:fs';

const src = readFileSync(new URL('../src/app/data/blog-posts.ts', import.meta.url), 'utf8');
const slugs = [...src.matchAll(/^\s*slug:\s*'([a-z0-9-]+)'/gm)].map((m) => m[1]);

const routes = ['/', '/blog', ...slugs.map((s) => `/blog/${s}`), '/affiliate-disclosure', '/privacy', '/terms'];
writeFileSync(new URL('../routes.txt', import.meta.url), routes.join('\n') + '\n');
console.log(`routes.txt: ${routes.length} routes (${slugs.length} posts)`);

// Also emit the CloudFront Function (paste into CloudFront > Functions > adattamento-rewrite > Publish).
// Prerendered routes -> their folder index.html; any other extensionless route -> SPA shell.
const prerendered = routes.filter((r) => r !== '/');
const fn = `function handler(event) {
  var request = event.request;
  var host = request.headers.host ? request.headers.host.value : '';

  // www -> apex (one canonical URL)
  if (host === 'www.adattamento.app') {
    return {
      statusCode: 301,
      statusDescription: 'Moved Permanently',
      headers: { location: { value: 'https://adattamento.app' + request.uri } }
    };
  }

  var prerendered = ${JSON.stringify(prerendered)};
  var uri = request.uri;
  if (uri.length > 1 && uri.charAt(uri.length - 1) === '/') {
    uri = uri.slice(0, -1);
  }

  if (uri === '/') {
    request.uri = '/index.html';
  } else if (prerendered.indexOf(uri) !== -1) {
    request.uri = uri + '/index.html';
  } else if (uri.indexOf('.') === -1) {
    // Client-rendered app route (login, dashboard, try-on, ...)
    request.uri = '/index.csr.html';
  }
  return request;
}
`;
writeFileSync(new URL('./cloudfront-rewrite.js', import.meta.url), fn);
console.log('scripts/cloudfront-rewrite.js written');
