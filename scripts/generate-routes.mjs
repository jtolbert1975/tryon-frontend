// Builds routes.txt for Angular prerendering from the blog post slugs.
import { readFileSync, writeFileSync } from 'node:fs';

const src = readFileSync(new URL('../src/app/data/blog-posts.ts', import.meta.url), 'utf8');
const slugs = [...src.matchAll(/^\s*slug:\s*'([a-z0-9-]+)'/gm)].map((m) => m[1]);

const routes = ['/', '/blog', ...slugs.map((s) => `/blog/${s}`), '/affiliate-disclosure', '/privacy', '/terms'];
writeFileSync(new URL('../routes.txt', import.meta.url), routes.join('\n') + '\n');
console.log(`routes.txt: ${routes.length} routes (${slugs.length} posts)`);
